import React from "react";
import { useOPFSStore } from "./useOPFSStore";
import { useStore } from "./useGlobalStore";

export const FileSidebar = () => {
  const { files, actions } = useOPFSStore();
  const { loadOPFSFile } = useStore();

  React.useEffect(() => {
    actions.init();
  }, [actions]);

  const onFileClick = (file: FileSystemFileHandle) => {
    loadOPFSFile(file);
  };

  const onDeleteClick = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    actions.deleteFile(fileName);
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">OPFS Files</h2>
      <ul>
        {files.map((file) => (
          <li
            key={file.name}
            className="flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md"
            onClick={() => onFileClick(file.handle)}
          >
            <span>{file.name}</span>
            <button
              onClick={(e) => onDeleteClick(e, file.name)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
