/* global Recorder */
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { ReactSVG } from 'react-svg';
import getSvgPath from '../utils/getSvgPath';
import Col from './Col';
import Row from './Row';

const reducer = (state, action) => {
  switch (action.type) {
    case 'RECORDING_STARTED':
      return { ...state, isRecording: true };

    case 'RECORDING_STOPPED':
      return { ...state, isRecording: false, buttonDisabled: true };

    default:
      return state;
  }
};

export default function Microphone({
  startAudioStream,
  stopAudioStream,
  streamAudio,
}) {
  const [state, dispatch] = useReducer(reducer, {
    isRecording: false,
    buttonDisabled: false,
  });

  const recorder = useMemo(
    () =>
      new Recorder({
        encoderPath: '/app/recorderjs/encoderWorker.min.js',
        leaveStreamOpen: true,
        numberOfChannels: 1,

        // OPUS options
        encoderSampleRate: 16000,
        streamPages: true,
        maxBuffersPerPage: 1,
        //originalSampleRateOverride: sampleRate,

        // WAV options
        //wavBitDepth: 16
      }),
    []
  );

  useEffect(() => {
    recorder.addEventListener('dataAvailable', (e) => {
      streamAudio(e.detail);
    });

    recorder.initStream();

    return () => {
      recorder.stop();
    };
  }, [streamAudio]);

  const startRecording = useCallback(() => {
    recorder.start();
    startAudioStream();
    dispatch({ type: 'RECORDING_STARTED' });
  }, [recorder, startAudioStream]);

  const stopRecording = useCallback(() => {
    recorder.stop();
    stopAudioStream();
    dispatch({ type: 'RECORDING_STOPPED' });
  }, [recorder, stopAudioStream]);

  const toggleRecording = useCallback(() => {
    state.isRecording ? stopRecording() : startRecording();
  }, [state.isRecording, stopRecording, startRecording]);

  return (
    <Col
      alignItems="center"
      justifyContent="center"
      style={{
        width: '100%',
        gap: '20px',
      }}
    >
      <button
        disabled={state.buttonDisabled}
        style={{
          cursor: state.buttonDisabled ? 'default' : 'pointer',
          borderRadius: '50%',
          background: state.buttonDisabled ? '#ccc' : '#38EDAC',
          opacity: state.buttonDisabled ? 0.2 : 1,
          width: '80px',
          height: '80px',
        }}
        onClick={toggleRecording}
      >
        <ReactSVG
          src={getSvgPath(state.isRecording ? 'pause' : 'microphone')}
        />
      </button>
    </Col>
  );
}
