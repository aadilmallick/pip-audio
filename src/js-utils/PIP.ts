export class AbortControllerManager {
  private controller = new AbortController();

  get signal() {
    return this.controller.signal;
  }

  get isAborted() {
    return this.controller.signal.aborted;
  }

  reset() {
    this.controller = new AbortController();
  }

  abort() {
    this.controller.abort();
  }
}

export class PIPVideo {
  enterPIPAborter = new AbortControllerManager();
  exitPIPAborter = new AbortControllerManager();
  constructor(private video: HTMLVideoElement) {}

  async togglePictureInPicture() {
    try {
      // If the video is not in PiP mode, request PiP
      if (this.video !== document.pictureInPictureElement) {
        const pipWindow = await this.video.requestPictureInPicture();
      } else {
        // If the video is in PiP mode, exit PiP
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error("Error toggling Picture-in-Picture:", error);
    }
  }

  Events = {
    onEnterPictureInPicture: (cb: (event: PictureInPictureEvent) => any) => {
      this.video.addEventListener(
        "enterpictureinpicture",
        cb as EventListener,
        {
          signal: this.enterPIPAborter.signal,
        }
      );
      return cb;
    },
    onLeavePictureInPicture: (cb: (event: Event) => any) => {
      this.video.addEventListener(
        "leavepictureinpicture",
        cb as EventListener,
        {
          signal: this.exitPIPAborter.signal,
        }
      );
      return cb;
    },
    removeEnterPIPListeners: () => {
      this.enterPIPAborter.abort();
      this.enterPIPAborter.reset();
    },
    removeExitPIPListeners: () => {
      this.exitPIPAborter.abort();
      this.exitPIPAborter.reset();
    },
  };
}

export class PIPElement {
  private pipWindow: Window | null = null;
  enterPIPAborter = new AbortControllerManager();
  exitPIPAborter = new AbortControllerManager();
  constructor(
    private pipContainer: HTMLElement,
    private options?: {
      width: number;
      height: number;
    }
  ) {}

  static get isAPIAvailable() {
    return "documentPictureInPicture" in window;
  }

  // closes pip window
  static closePipWindow() {
    window.documentPictureInPicture?.window?.close();
  }

  // checks if pip window is open
  static get pipWindowOpen() {
    return !!window.documentPictureInPicture.window;
  }

  // gets currently active pip window, else returns null
  static get pipWindow() {
    return window.documentPictureInPicture.window;
  }

  // logic for toggling pip
  async togglePictureInPicture({
    onOpen,
    onClose,
  }: {
    onOpen: (window: Window) => void;
    onClose: () => void;
  }) {
    this.Events.resetExitAborter();
    this.Events.resetEnterAborter();
    this.Events.onPIPEnter(onOpen);
    if (PIPElement.pipWindowOpen) {
      PIPElement.closePipWindow();
      onClose();
      return;
    } else {
      await this.openPipWindow();
      this.copyStylesToPipWindow();
      this.Events.onPIPWindowClose(onClose);
    }
  }

  // requests new pip window
  async openPipWindow() {
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: this.options?.width || this.pipContainer.clientWidth,
      height: this.options?.height || this.pipContainer.clientHeight,
    });
    this.pipWindow = pipWindow;
    this.pipWindow.document.body.append(this.pipContainer);
  }

  // manually add styles to pip window when open
  addStylesToPipWindow({ id, styles }: { styles: string; id: string }) {
    if (!this.pipWindow) {
      throw new Error("PIP window is not open");
    }
    const style = document.createElement("style");
    style.id = id;
    style.textContent = styles;
    this.pipWindow.document.head.appendChild(style);
  }

  // copy styles from main document to pip window
  copyStylesToPipWindow() {
    if (!this.pipWindow) {
      throw new Error("PIP window is not open");
    }
    // delete all style tags first
    this.pipWindow.document.querySelectorAll("style").forEach((style) => {
      style.remove();
    });
    [...document.styleSheets].forEach((styleSheet) => {
      const pipWindow = this.pipWindow!;
      try {
        const cssRules = [...styleSheet.cssRules]
          .map((rule) => rule.cssText)
          .join("");
        const style = document.createElement("style");

        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.type = styleSheet.type;
        link.href = styleSheet.href || "";
        pipWindow.document.head.appendChild(link);
      }
    });
  }

  Events = {
    // event that is triggered when pip window closes
    onPIPWindowClose: (cb: () => void) => {
      if (!this.pipWindow) {
        throw new Error("PIP window is not open");
      }
      this.pipWindow.addEventListener("pagehide", cb, {
        signal: this.exitPIPAborter.signal,
      });
    },

    // event that is triggered when pip window is opened
    onPIPEnter: (cb: (window: Window) => void) => {
      window.documentPictureInPicture.addEventListener(
        "enter",
        (event: DocumentPictureInPictureEvent) => {
          cb(event.window);
        },
        {
          signal: this.enterPIPAborter.signal,
        }
      );
    },
    resetExitAborter: () => {
      this.exitPIPAborter.abort();
      this.exitPIPAborter.reset();
    },
    resetEnterAborter: () => {
      this.enterPIPAborter.abort();
      this.enterPIPAborter.reset();
    },
  };
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}

export function css(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}
