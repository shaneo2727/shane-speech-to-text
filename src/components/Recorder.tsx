import { FC, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const enum RecordingStatusEnum {
  STOPPED = 1,
  RECORDING = 2,
  PAUSED = 3,
}

interface RecorderProps {}

const Recorder: FC<RecorderProps> = ({}) => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const [recordingStatus, setRecordingStatus] = useState<RecordingStatusEnum>(
    RecordingStatusEnum.STOPPED,
  );

  const handleStartRecording = async () => {
    await SpeechRecognition.startListening({ continuous: true });

    if (recordingStatus == RecordingStatusEnum.STOPPED) {
      resetTranscript();
    }

    setRecordingStatus(RecordingStatusEnum.RECORDING);
  };

  const handlePauseRecording = async () => {
    await SpeechRecognition.stopListening();
    setRecordingStatus(RecordingStatusEnum.PAUSED);
  };

  const handleStopRecording = async () => {
    if (listening) {
      await SpeechRecognition.stopListening();
    }
    setRecordingStatus(RecordingStatusEnum.STOPPED);
  };

  return (
    <div>
      <h2>Voice Recorder & Transcriber</h2>
      <div className="controls">
        <button
          onClick={handleStartRecording}
          disabled={recordingStatus === RecordingStatusEnum.RECORDING}
          className={`control-button record ${recordingStatus === RecordingStatusEnum.RECORDING ? "active" : ""}`}
        >
          Record
        </button>
        <button
          onClick={handlePauseRecording}
          disabled={
            recordingStatus === RecordingStatusEnum.PAUSED ||
            recordingStatus === RecordingStatusEnum.STOPPED
          }
          className="control-button pause"
        >
          Pause
        </button>
        <button
          onClick={handleStopRecording}
          disabled={recordingStatus === RecordingStatusEnum.STOPPED}
          className="control-button stop"
        >
          Stop
        </button>
      </div>
      <h3>Transcription</h3>
      <p>{transcript}</p>
    </div>
  );
};

export default Recorder;
