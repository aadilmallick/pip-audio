import { create } from "zustand";
import { OPFS } from "./js-utils/OPFS";

type OPFSFile = {
  name: string;
  handle: FileSystemFileHandle;
};

type OPFSState = {
  files: OPFSFile[];
  opfs: OPFS;
  actions: {
    init: () => Promise<void>;
    addFile: (file: File) => Promise<void>;
    deleteFile: (fileName: string) => Promise<void>;
    getFiles: () => Promise<void>;
  };
};

export const useOPFSStore = create<OPFSState>((set, get) => ({
  files: [],
  opfs: new OPFS(),
  actions: {
    init: async () => {
      const opfs = get().opfs;
      if (!opfs.initialized) {
        await opfs.initOPFS();
      }
      get().actions.getFiles();
    },
    addFile: async (file: File) => {
      const opfs = get().opfs;
      const fileHandle = await opfs.createFileHandle(file.name);
      await OPFS.writeDataToFileHandle(fileHandle, await file.arrayBuffer());
      get().actions.getFiles();
    },
    deleteFile: async (fileName: string) => {
      const opfs = get().opfs;
      await opfs.deleteFile(fileName);
      get().actions.getFiles();
    },
    getFiles: async () => {
      const opfs = get().opfs;
      const { files } = await opfs.getFilesAndFolders();
      set({ files: files.map((handle) => ({ name: handle.name, handle })) });
    },
  },
}));
