import { FC, useEffect, useRef, useState } from "react";
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

  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatusEnum>(
    RecordingStatusEnum.STOPPED,
  );
  const [remoteTranscription, setRemoteTranscription] = useState<string>();
  const [remoteTranscriptionError, setRemoteTranscriptionError] =
    useState<boolean>(false);
  const [wasRecordingOnline, setWasRecordingOnline] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder>(null);

  const handleOnline = async () => {
    if (!wasRecordingOnline) {
      try {
        const res = await fetch("api/v1/google_text_to_speech", {
          method: "POST",
          body: audioBlob,
        });
        const jsonResult = await res.json();
        setRemoteTranscription(jsonResult["results"]);
      } catch (error) {
        setRemoteTranscriptionError(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [wasRecordingOnline]);

  const handleStartRecording = async () => {
    await SpeechRecognition.startListening({ continuous: true });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const audioBlobs: Blob[] = [];

    recorder.ondataavailable = (event) => {
      audioBlobs.push(event.data);
    };

    recorder.onstop = async () => {
      setAudioBlob(new Blob(audioBlobs, { type: "audio/webm" }));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    if (recordingStatus == RecordingStatusEnum.STOPPED) {
      resetTranscript();
    }

    if (recordingStatus == RecordingStatusEnum.STOPPED) {
      // If starting recording from stopped, reset to assume connection
      setRemoteTranscription(undefined);
      setWasRecordingOnline(true);
      setRemoteTranscriptionError(false);
    }

    if (!window.navigator.onLine) {
      setWasRecordingOnline(false);
    }

    setRecordingStatus(RecordingStatusEnum.RECORDING);
  };

  const handlePauseRecording = async () => {
    if (listening) {
      await SpeechRecognition.stopListening();
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state != "inactive"
    ) {
      mediaRecorderRef.current.pause();
    }
    setRecordingStatus(RecordingStatusEnum.PAUSED);
  };

  const handleStopRecording = async () => {
    if (listening) {
      await SpeechRecognition.stopListening();
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state != "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setRecordingStatus(RecordingStatusEnum.STOPPED);
  };

  return (
    <div>
      {remoteTranscriptionError && (
        <div className="alert error">
          <h5 style={{ margin: 0 }}>
            An error has occurred during transcription
          </h5>
        </div>
      )}
      <h2 style={{ margin: 0 }}>Voice Recorder & Transcriber</h2>
      {!wasRecordingOnline &&
        audioBlob &&
        recordingStatus == RecordingStatusEnum.STOPPED && (
          <div className="alert warning">
            <h5 style={{ margin: 0 }}>
              A recording is awaiting transcription, recording a new one will
              overwrite the existing one
            </h5>
          </div>
        )}
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
      {!wasRecordingOnline && (
        <div className="alert info">
          <h5 style={{ margin: 0 }}>
            Connection issues during recording, recording will be transcribed
            once connection is restored
          </h5>
        </div>
      )}
      <h3>Transcription</h3>
      <p>{wasRecordingOnline ? transcript : remoteTranscription}</p>
    </div>
  );
};

export default Recorder;
