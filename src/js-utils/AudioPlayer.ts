import { audioBlobStorage } from "./LocalStorage";

export class AudioPlayer {
  private audio!: HTMLAudioElement;
  private isPlaying!: boolean;
  private static instance: AudioPlayer;
  constructor(audioBlobUrl: string) {
    const lastUsedUrl = audioBlobStorage.get("audioBlobUrl");
    if (lastUsedUrl) {
      if (AudioPlayer.instance) {
        return AudioPlayer.instance;
      }
    }
    this.audio = new Audio(audioBlobUrl);
    this.isPlaying = !this.audio.paused;

    // singleton stuff
    AudioPlayer.instance = this;
    audioBlobStorage.set("audioBlobUrl", audioBlobUrl);

    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
    });
  }

  onLoad(): Promise<void> {
    return new Promise((resolve) => {
      this.audio.addEventListener("loadeddata", () => {
        resolve();
      });
    });
  }

  public get audioLoaded(): boolean {
    return this.audio.readyState >= 2; // HAVE_ENOUGH_DATA
  }

  public get on(): boolean {
    return this.isPlaying;
  }

  onProgress(cb: (progress: number) => void): void {
    this.audio.addEventListener("timeupdate", () => {
      const progress = this.audio.currentTime / this.audio.duration;
      cb(progress);
    });
  }

  toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Play the audio
  play(): void {
    this.audio.play();
    this.isPlaying = true;
  }

  // Pause the audio
  pause(): void {
    this.audio.pause();
    this.isPlaying = false;
  }

  // Change the playback speed (e.g., 1.0 is normal speed, 2.0 is double speed)
  setSpeed(speed: number): void {
    if (speed > 0) {
      this.audio.playbackRate = speed;
    } else {
      console.error("Speed must be greater than 0.");
    }
  }

  // Skip forward or backward by a specified number of seconds
  skip(seconds: number): void {
    this.audio.currentTime += seconds;
  }

  seekTo(progress: number): void {
    if (progress >= 0 && progress <= 1) {
      this.audio.currentTime = progress * this.audio.duration;
    } else {
      console.error("Progress must be between 0 and 1.");
    }
  }

  // Get the current playback speed
  getSpeed(): number {
    return this.audio.playbackRate;
  }

  // Get the current time of the audio in seconds
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getCurrentTimeInPercentage(): number {
    if (!this.audio.duration) {
      return 0;
    }
    return this.audio.currentTime / this.audio.duration;
  }

  // Get the total duration of the audio in seconds
  public get duration(): number {
    return this.audio.duration;
  }

  // Check if the audio is currently playing
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  // Clean up the object URL when done
  destroy(): void {
    URL.revokeObjectURL(this.audio.src);
  }

  setVolume(volume: number): void {
    if (volume >= 0 && volume <= 1) {
      this.audio.volume = volume;
    } else {
      console.error("Volume must be between 0 and 1.");
    }
  }

  getVolume(): number {
    return this.audio.volume;
  }
}

// Example usage:
// const audioBlob = ...; // Your audio blob
// const player = new AudioPlayer(audioBlob);
// player.play();
// player.setSpeed(1.5);
// player.skip(10); // Skip forward 10 seconds
// player.pause();
// player.destroy();
