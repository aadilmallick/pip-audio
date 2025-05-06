import React from "react";
import { useStore } from "./useGlobalStore";
import { audioBlobStorage } from "./js-utils/LocalStorage";
import { CacheStrategist } from "./js-utils/CacheStorage";

const FileInput = () => {
  const inputUrlRef = React.useRef<HTMLInputElement>(null);
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { setBlobUrl, blobUrl, clearBlobUrl } = useStore();

  async function onDownloadFile(file: File) {
    if (blobUrl) {
      clearBlobUrl(blobUrl); // Clear the previous blob URL
    }
    try {
      setLoading(true);
      setError(null);
      const blobUrl = URL.createObjectURL(file);
      setBlobUrl(blobUrl);
      audioBlobStorage.set("audioBlobUrl", blobUrl);
    } catch (err) {
      console.error("Error creating blob URL:", err);
      setError("Failed to create blob URL. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onDownloadURL() {
    if (!inputUrlRef.current?.value) return;

    const url = inputUrlRef.current.value;
    if (blobUrl) {
      clearBlobUrl(blobUrl); // Clear the previous blob URL
    }
    try {
      setLoading(true);
      setError(null);
      const response = await CacheStrategist.cacheFirst(
        new Request(url),
        "audio-url-cache"
      );
      const blob = await response.blob();
      console.log("Blob:", blob);
      const blobUrl = URL.createObjectURL(blob);
      setBlobUrl(blobUrl);
    } catch (err) {
      console.error("Error fetching the URL:", err);
      setError("Failed to fetch the URL. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
    // const blobUrl = URL.createObjectURL(blob);
    // console.log("Blob URL:", blobUrl);
  }
  return (
    <div className="bg-white shadow-2xl rounded-2xl py-2 px-4 border-gray-200 border-2 max-w-[40rem] min-w-[20rem]">
      <h3 className="text-2xl font-semibold tracking-tighter text-gray-600">
        Upload Audio File
      </h3>
      <hr className="mt-2 mb-4 border-gray-300" />
      <input
        type="file"
        name="file"
        id="file"
        accept="audio/*"
        multiple={false}
        onChange={(e) => {
          console.log("File selected:", e.target.files);
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            onDownloadFile(file);
          }
        }}
        className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4 file:rounded-md
        file:border-0 file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100 file:cursor-pointer file:transition-colors file:duration-150"
      />
      <p className="text-center text-sm text-gray-400 my-2">or</p>
      <div className="space-y-2">
        <input
          type="url"
          name="url"
          id="url"
          className="rounded-lg w-full p-1 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter URL to audio file"
          ref={inputUrlRef}
        />
        <button
          className="w-full bg-blue-500 text-white font-semibold py-2 p rounded-md hover:bg-blue-600 transition-colors duration-150 block hover:cursor-pointer"
          onClick={onDownloadURL}
        >
          Upload from URL
        </button>
      </div>
    </div>
  );
};

export default FileInput;
