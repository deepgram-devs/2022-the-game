/* global Recorder */
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useRef,
} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Col from './Col';

/**
 * START_RECORDING
 * STOP_RECORDING
 * SUBMITTING
 * ON_SUBMIT_SUCCESS
 * ON_SUBMIT_FAIL
 * ON_LEVEL_SUCCESS
 * ON_LEVEL_FAIL
 *
 */

const SAMPLE_RATE = 16000;
const WEBSOCKET_URL = `wss://cab2b5852c84ae12.deepgram.com/v2/listen/stream?punctuate=true&model=general-dQw4w9WgXcQ&encoding=ogg-opus&sample_rate=${SAMPLE_RATE}`;
const WEBSOCKET_PROTOCOLS = [
  'Basic',
  'R1dnVWh0S1VhNnBiNkNnQjg0OEI2QTpPbFpkd0IyanhWOVNBM0dOdzZYOFJ3',
];

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_RECORDING':
      return { ...state, isRecording: !state.isRecording };

    case 'START_RECORDING':
      return { ...state, isRecording: true };

    case 'STOP_RECORDING':
      return { ...state, isRecording: false };

    default:
      return state;
  }
};

export default function Microphone({ onRecordingDone }) {
  const [transcript, setTranscript] = useState('');
  const [state, dispatch] = useReducer(reducer, {
    isRecording: false,
    transcript: '',
  });

  const [chunks, setChunks] = useState([]);

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(WEBSOCKET_URL, {
    protocols: WEBSOCKET_PROTOCOLS,
    onOpen: () => console.log('opened'),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      const final = data.is_final;
      const words = data.channel.alternatives[0].words;

      if (words.length) {
        setChunks((prev) => [...prev, { words, final }]);
      }
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const recorder = useMemo(
    () =>
      new Recorder({
        encoderPath: '/recorderjs/encoderWorker.min.js',
        leaveStreamOpen: true,
        numberOfChannels: 1,

        // OPUS options
        encoderSampleRate: SAMPLE_RATE,
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
      if (readyState === ReadyState.OPEN) {
        sendMessage(e.detail);
      }
    });

    recorder.initStream();

    return () => {
      recorder.stop();

      // Trigger a shutdown flush.
      if (readyState === ReadyState.OPEN) {
        sendMessage(new Uint8Array(0));
      }
    };
  }, [sendMessage, readyState]);

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
        style={{ cursor: 'pointer' }}
        onClick={() => {
          dispatch({ type: 'TOGGLE_RECORDING' });

          if (state.isRecording) {
            recorder.stop();
            const text = chunks
              .filter((chunk) => chunk.final)
              .map((chunk) =>
                chunk.words.map((c) => c.punctuated_word).join(' ')
              )
              .join(' ');
            setTranscript(text);
          } else {
            setChunks([]);
            recorder.start();
          }
        }}
      >
        {state.isRecording ? 'Stop Recording' : 'Record'}
      </button>

      {state.isRecording ? <Recording /> : null}

      {transcript ? <div>Transcript: {transcript}</div> : null}
    </Col>
  );
}

function Recording() {
  return <div>recording...</div>;
}