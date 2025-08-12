import { create } from "zustand";
import { audioBlobStorage } from "./js-utils/LocalStorage";

type Store = {
  blobUrl: string | null;
  setBlobUrl: (url: string | null) => void;
  clearBlobUrl: (url: string) => void;
  selectedFile: FileSystemFileHandle | null;
  setSelectedFile: (file: FileSystemFileHandle) => void;
  loadOPFSFile: (fileHandle: FileSystemFileHandle) => Promise<void>;
};

export const useStore = create<Store>()((set, get) => ({
  blobUrl: null,
  selectedFile: null,
  setBlobUrl: (url) => set(() => ({ blobUrl: url })),
  clearBlobUrl: (url) => {
    URL.revokeObjectURL(url); // Revoke the old blob URL to free up memory
    audioBlobStorage.set("audioBlobUrl", null); // Clear the previous blob URL from local storage
    set(() => ({ blobUrl: null })); // Clear the previous blob URL
  },
  setSelectedFile: (file) => set(() => ({ selectedFile: file })),
  loadOPFSFile: async (fileHandle) => {
    const file = await fileHandle.getFile();
    const blobUrl = URL.createObjectURL(file);
    const currentBlobUrl = get().blobUrl;
    if (currentBlobUrl) {
      get().clearBlobUrl(currentBlobUrl);
    }
    set(() => ({ blobUrl }));
  },
}));
