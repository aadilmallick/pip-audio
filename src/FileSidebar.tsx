import React from "react";
import { useOPFSStore } from "./useOPFSStore";

export const FileSidebar = () => {
  const { files, actions } = useOPFSStore();

  React.useEffect(() => {
    actions.init();
  }, [actions]);

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">OPFS Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file.name} className="flex justify-between items-center mb-2">
            <span>{file.name}</span>
            <button
              onClick={() => actions.deleteFile(file.name)}
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
