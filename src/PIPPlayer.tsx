import React, { useEffect } from "react";
import { useStore } from "./useGlobalStore";
import { AudioPlayer } from "./js-utils/AudioPlayer";
import { PIPElement } from "./js-utils/PIP";
import { createRoot } from "react-dom/client";

export const PIPPlayer = () => {
  const { blobUrl } = useStore();
  const [pipPlayer, setPipPlayer] = React.useState<PIPElement | null>(null);
  const [inPipMode, setInPipMode] = React.useState(false);

  useEffect(() => {
    const pipElement = document.getElementById("audio-player");
    if (!pipElement) return;
    setPipPlayer(new PIPElement(pipElement));
  }, [blobUrl]);
  if (!blobUrl) return null;
  return (
    <>
      <button
        className="text-white bg-blue-400 py-2 px-4 rounded-md"
        onClick={async () => {
          if (!pipPlayer) return;
          try {
            await pipPlayer.togglePictureInPicture({
              onClose: () => {
                setInPipMode(false);
                // const pipElement = document.getElementById("audio-player");
                // if (!pipElement) return;
                if (document.getElementById("audio-player")) {
                  return;
                }
                createRoot(
                  document.getElementById("audio-block-container")!
                ).render(<AudioBlock blobUrl={blobUrl} />);
              },
              onOpen: (pipWindow) => {
                setInPipMode(true);
                // const pipElement = document.getElementById("audio-player");
                // if (!pipElement) return;
                if (pipWindow.document.body.querySelector("#audio-player")) {
                  return;
                }
                createRoot(pipWindow.document.body).render(
                  <AudioBlock blobUrl={blobUrl} />
                );
                pipWindow.document.body.style.backgroundColor = "white";
              },
            });
          } catch (error) {
            console.error("Error entering PiP mode:", error);
          }
        }}
      >
        Open PIP
      </button>
      <div id="audio-block-container">
        {/* {inPipMode && (
          <p className="text-gray-400 text-center text-sm">
            Picture-in-Picture Mode
          </p>
        )} */}
        <AudioBlock blobUrl={blobUrl} />
      </div>
    </>
  );
};

const AudioBlock = ({ blobUrl }: { blobUrl: string }) => {
  const audioManager = new AudioPlayer(blobUrl);
  const [isPlaying, setIsPlaying] = React.useState(audioManager.on);
  const inputRangeRef = React.useRef<HTMLInputElement>(null);
  const [currentProgress, setCurrentProgress] = React.useState(
    audioManager.getCurrentTimeInPercentage()
  );
  const [currentVolume, setCurrentVolume] = React.useState(
    audioManager.getVolume()
  );
  //   const [audioLoaded, setAudioLoaded] = React.useState(
  //     audioManager.audioLoaded
  //   );
  //   useEffect(() => {
  //     if (audioManager.audioLoaded) {
  //       setAudioLoaded(true);
  //     }
  //   }, [audioManager.audioLoaded]);

  //   if (!audioManager.audioLoaded) {
  //     return (
  //       <div className="bg-white shadow-2xl min-w-[25rem] p-4 rounded-2xl border-gray-200 border-2">
  //         <p className="text-gray-400 text-center text-sm">Loading...</p>
  //       </div>
  //     );
  //   }

  audioManager.onProgress((progress) => {
    setCurrentProgress(progress);
    if (inputRangeRef.current) {
      inputRangeRef.current.value = `${progress * 100}`;
    }
  });

  function getProgress() {
    if (currentProgress === 0 && !audioManager.duration) {
      return "00:00/--:--";
    }
    const duration = audioManager.duration;
    const currentTimeFormatted = new Date(currentProgress * duration * 1000)
      .toISOString()
      .substr(11, 8);
    const durationFormatted = new Date(duration * 1000)
      .toISOString()
      .substr(11, 8);
    return `${currentTimeFormatted}/${durationFormatted}`;
  }

  return (
    <div
      id="audio-player"
      className="bg-white shadow-2xl min-w-[25rem] p-4 rounded-2xl border-gray-200 border-2"
    >
      <p className="text-gray-400 text-center text-sm">{getProgress()}</p>
      <div className="relative">
        <div
          className="bg-blue-400/75 rounded-lg h-2 cursor-pointer absolute top-3 left-0 w-full"
          style={{ width: `${Math.floor(currentProgress * 100)}%` }}
        ></div>
        <input
          id="default-range"
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          ref={inputRangeRef}
          defaultValue={1}
          onChange={(e) => {
            //   setCurrentProgress(Number(e.target.value) / 100);
            audioManager.seekTo(Number(e.target.value) / 100);
          }}
        ></input>
      </div>
      <div className="flex justify-center items-center mt-2 gap-x-2">
        <SpeedChangeButton
          onChangeSpeed={(speed) => {
            audioManager.setSpeed(speed);
          }}
        />
        <PlayPauseButton
          isPlaying={isPlaying}
          onClick={() => {
            if (isPlaying) {
              audioManager.pause();
              setIsPlaying(false);
            }
            if (!isPlaying) {
              audioManager.play();
              setIsPlaying(true);
            }
          }}
        />
        <input
          id="volume-range"
          type="range"
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          //   value={currentVolume}
          onChange={(e) => {
            // setCurrentProgress(Number(e.target.value) / 100);
            audioManager.setVolume(Number(e.target.value) / 100);
            // setCurrentVolume(Number(e.target.value) / 100);
          }}
        ></input>
      </div>
    </div>
  );
};

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
  isPlaying,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white font-semibold h-10 w-10 p-1 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-150 flex items-center cursor-pointer justify-center text-lg"
    >
      {isPlaying ? (
        // Pause SVG Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
        </svg>
      ) : (
        // Play SVG Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
};

interface SpeedChangeButtonProps {
  onChangeSpeed: (speed: number) => void; // Callback to handle speed change
}

const SpeedChangeButton: React.FC<SpeedChangeButtonProps> = ({
  onChangeSpeed,
}) => {
  const [speedIndex, setSpeedIndex] = React.useState(1);
  const speeds = [0.5, 1, 1.5, 2]; // Available speed options

  const handleClick = () => {
    // Calculate the next speed index
    const nextIndex = (speedIndex + 1) % speeds.length;
    setSpeedIndex(nextIndex);
    // Trigger the callback with the new speed
    onChangeSpeed(speeds[nextIndex]);
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-500 bg-white font-semibold h-8 w-8 p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-150 flex items-center cursor-pointer justify-center text-sm border-gray-200 border-2"
    >
      {speeds[speedIndex]}x
    </button>
  );
};
