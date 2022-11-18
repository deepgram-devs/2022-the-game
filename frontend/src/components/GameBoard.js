import { useCallback, useReducer } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import CARD_DATA from '../CardData';
import getSvgPath from '../utils/getSvgPath';
import EventCard from './EventCard';
import Row from './Row';

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CARD': {
      const index = state.events.findIndex((event) => event.eventBody === null);
      const newEvents = state.events;
      newEvents[index] = {
        ...newEvents[index],
        eventBody: action.description,
      };

      return {
        ...state,
        events: newEvents,
      };
    }

    case 'FAILED_CARD': {
      const index = state.events.findIndex((event) => event.completed === null);
      const newEvents = state.events;
      newEvents[index] = {
        ...newEvents[index],
        eventBody: action.description,
        completed: false,
      };

      return {
        ...state,
        events: newEvents,
      };
    }

    case 'COMPLETED_EVENT':
      return {
        ...state,
        totalScore: state.totalScore + action.event.score,
        events: state.events.map((event) => {
          return event.id === action.event.id
            ? { ...event, completed: true, score: action.event.score }
            : event;
        }),
      };

    case 'FAILED_EVENT':
      return {
        ...state,
        events: state.events.map((event) => {
          return event.id === action.event.id
            ? { ...event, completed: false }
            : event;
        }),
      };
    default:
      return state;
  }
};

const WEBSOCKET_URL = 'ws://localhost:8080/play';

const getTitle = (index) =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][index];

export default function GameBoard() {
  const [state, dispatch] = useReducer(reducer, {
    events: CARD_DATA,
    totalScore: 0,
  });

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(WEBSOCKET_URL, {
    onOpen: () => console.log('/play socket opened'),
    onClose: () => console.log('/play socket closed'),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('/play onMessage', data);

      switch (data.type) {
        case 'new_card':
          dispatch({ type: 'ADD_CARD', description: data.message });
          break;

        case 'failure':
          dispatch({ type: 'FAILED_CARD' });
          break;
      }
    },
  });

  const lastCompletedEventIndex =
    state.events.findIndex((event) => event.completed) ?? 0;

  const possibleNextIndex = lastCompletedEventIndex + 1;
  const maxIndex = state.events.length - 1;

  const activeIndex =
    possibleNextIndex > maxIndex ? maxIndex : possibleNextIndex;

  const startAudioStream = useCallback(() => {
    console.log('sendMessage: audio_start');
    sendJsonMessage({
      type: 'audio_start',
      mimetype: 'audio/ogg',
    });
  }, []);

  const stopAudioStream = useCallback(() => {
    console.log('sendMessage: audio_stop');
    sendJsonMessage({
      type: 'audio_stop',
    });
  }, []);

  const streamAudio = useCallback((data) => {
    console.log('audio stream: ', data);
    sendMessage(data);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        padding: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {state.events.map((eventCard, i) => (
        <EventCard
          key={eventCard.id}
          {...eventCard}
          title={getTitle(i)}
          isActive={activeIndex === i}
          startAudioStream={startAudioStream}
          stopAudioStream={stopAudioStream}
          streamAudio={streamAudio}
          onPass={(event) => {
            dispatch({ type: 'COMPLETED_EVENT', event });
          }}
          onFail={(event) => {
            dispatch({ type: 'FAILED_EVENT', event });
          }}
        />
      ))}

      <Row
        alignItems="center"
        justifyContent="center"
        style={{
          gridColumnStart: 'span 3',
          backgroundImage: `url(${getSvgPath('card-2023')})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          width: '100%',
          height: '300px',
          color: '#fff',
          fontSize: '60px',
          fontWeight: 'bold',
          border: '2px solid #1E2C3C',
          marginTop: '26px',
          borderRadius: '10px',
        }}
      >
        2023
      </Row>
    </div>
  );
}

// bg: #050a0f
// header bg: #0b121b
// card bg: #1a2532
// "white": #f8f8f8
// powered by: #7c92ab
// dg red: #fd5c5c
// meadow: #38EDAC
