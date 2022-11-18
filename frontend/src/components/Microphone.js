/* global Recorder */
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useRef,
} from 'react';
import { ReactSVG } from 'react-svg';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import getSvgPath from '../utils/getSvgPath';
import Col from './Col';
import Row from './Row';


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

export default function Microphone({
  onSuccess,
  onFail,
  startAudioStream,
  stopAudioStream,
  streamAudio,
}) {
  const [state, dispatch] = useReducer(reducer, {
    isRecording: false,
    transcript: '',
  });

  // const [chunks, setChunks] = useState([]);
  const [audioData, setAudioData] = useState([]);

  // const transcript = useMemo(
  //   () =>
  //     chunks
  //       .filter((chunk) => chunk.final)
  //       .map((chunk) => chunk.words.map((c) => c.punctuated_word).join(' '))
  //       .join(' '),
  //   [chunks]
  // );

  // const onMessage = useCallback((event) => {
  //   const data = JSON.parse(event.data);
  //   const final = data.is_final;
  //   const words = data?.channel?.alternatives[0]?.words ?? [];

  //   if (words.length) {
  //     setChunks((prev) => [...prev, { words, final }]);
  //   }
  // }, []);

  // const {
  //   sendMessage,
  //   sendJsonMessage,
  //   lastMessage,
  //   lastJsonMessage,
  //   readyState,
  //   getWebSocket,
  // } = useWebSocket(WEBSOCKET_URL, {
  //   protocols: WEBSOCKET_PROTOCOLS,
  //   onOpen: () => console.log('microphone socket opened'),
  //   onMessage,
  //   //Will attempt to reconnect on all close events, such as server shutting down
  //   shouldReconnect: (closeEvent) => true,
  // });

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
      // if (readyState === ReadyState.OPEN) {
      // sendMessage(e.detail);
      streamAudio(e.detail);
      // setAudioData((prev) => [...prev, e.detail]);
      // }
    });

    recorder.initStream();

    return () => {
      recorder.stop();

      // Trigger a shutdown flush.
      // if (readyState === ReadyState.OPEN) {
      // sendMessage(new Uint8Array(0));
      // }
    };
  }, [streamAudio]);

  // const saveRecording = useCallback(() => {
  //   const size = 0;

  //   audioData.forEach((e) => {
  //     size += e.length;
  //   });

  //   const big = new Uint8Array(size);
  //   let last = 0;

  //   audioData.forEach((e) => {
  //     big.set(e, last);
  //     last += e.length;
  //   });

  //   const blob = new Blob(audioData, { type: 'audio/ogg' });

  //   return blob;

  //   // return window.URL.createObjectURL(blob);
  // }, [audioData]);

  const startRecording = useCallback(() => {
    // setChunks([]);
    // setAudioData([]);
    recorder.start();
    dispatch({ type: 'START_RECORDING' });

    startAudioStream();
  }, [recorder]);

  const stopRecording = useCallback(() => {
    recorder.stop();

    // const audio = saveRecording();

    // console.log('audio binary', audio);

    dispatch({ type: 'STOP_RECORDING' });

    stopAudioStream();
  }, [recorder]);

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
        style={{
          cursor: 'pointer',
          borderRadius: '50%',
          background: '#38EDAC',
          width: '80px',
          height: '80px',
        }}
        onClick={toggleRecording}
      >
        <ReactSVG
          src={getSvgPath(state.isRecording ? 'pause' : 'microphone')}
        />
      </button>

      <Row>
        <button style={{ cursor: 'pointer' }} onClick={onSuccess}>
          Succeed
        </button>

        <button style={{ cursor: 'pointer' }} onClick={onFail}>
          Fail
        </button>
      </Row>

      {/* <Transcript transcript={transcript} /> */}
    </Col>
  );
}


function Transcript({ transcript }) {
  return transcript ? (
    <div
      style={{
        padding: '10px 0',
        fontFamily: 'monospace',
      }}
    >
      {transcript}
    </div>
  ) : null;
}