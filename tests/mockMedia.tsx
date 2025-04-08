export const mockAudioRecordingProcesses = () => {
  function createMockAudioTrack() {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.connect(gainNode);
    const destination = audioContext.createMediaStreamDestination();
    gainNode.connect(destination);

    oscillator.start();

    return destination.stream.getAudioTracks()[0];
  }

  navigator.mediaDevices.getUserMedia = async ({
    audio,
  }: {
    audio: boolean;
  }) => {
    return new MediaStream([createMockAudioTrack()]);
  };

  class MockMediaRecorder {
    private stream: MediaStream;
    private options: MediaRecorderOptions;
    private chunks: Blob[];
    private ondataavailable: ((event: { data: Blob }) => void) | null;
    private onstop: ((a?: any) => void) | null;
    private onpause: ((a?: any) => void) | null;

    constructor(stream: MediaStream, options: MediaRecorderOptions) {
      this.stream = stream;
      this.options = options;
      this.chunks = [];
      this.ondataavailable = null;
      this.onstop = null;
      this.onpause = null;
    }

    start() {
      const blob = new Blob(["sample audio data"], { type: "audio/wav" });
      this.chunks.push(blob);
      if (this.ondataavailable) {
        this.ondataavailable({ data: blob });
      }
    }

    stop() {
      if (this.onstop) {
        this.onstop();
      }
    }

    pause() {
      if (this.onpause) {
        this.onpause();
      }
    }

    addEventListener(
      event: "dataavailable" | "stop",
      callback: (event: { data: Blob }) => void,
    ) {
      if (event === "dataavailable") {
        this.ondataavailable = callback;
      } else if (event === "stop") {
        this.onstop = callback;
      }
    }
  }

  (window as any).MediaRecorder = MockMediaRecorder;
};
