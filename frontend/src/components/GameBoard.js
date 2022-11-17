import { useReducer } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import CARD_DATA from '../CardData';
import getSvgPath from '../utils/getSvgPath';
import EventCard from './EventCard';
import Row from './Row';

const reducer = (state, action) => {
  switch (action.type) {
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

export default function GameBoard() {
  // TODO: send message when audio recording starts
  // {
  //   "type": "audio_start",
  //   "mimetype:" "<audio mimetype>"
  // }
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket('ws://localhost:8080/play', {
    onOpen: () => console.log('/play socket opened'),
    onClose: () => console.log('/play socket closed'),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('/play onMessage', data);
    },
  });

  const [state, dispatch] = useReducer(reducer, {
    events: CARD_DATA,
    totalScore: 0,
  });

  const lastCompletedEventIndex =
    state.events.findIndex((event) => event.completed) ?? 0;

  const possibleNextIndex = lastCompletedEventIndex + 1;
  const maxIndex = state.events.length - 1;

  const activeIndex =
    possibleNextIndex > maxIndex ? maxIndex : possibleNextIndex;

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
          isActive={activeIndex === i}
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
