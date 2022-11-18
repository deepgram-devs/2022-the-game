import { useCallback, useEffect, useReducer, memo } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import CARD_DATA from '../CardData';
import getSvgPath from '../utils/getSvgPath';
import EventCard from './EventCard';
import Row from './Row';

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CARD': {
      return {
        ...state,
        currentCardIndex: action.currentCardIndex,
        events: state.events.map((event, index) => {
          if (action.currentCardIndex === index) {
            return { ...event, eventBody: action.description };
          } else {
            return event;
          }
        }),
      };
    }

    case 'FAILED_CARD': {
      return {
        ...state,
        events: state.events.map((event, index) => {
          if (state.currentCardIndex === index) {
            return { ...event, completed: false, failMessage: action.message };
          } else {
            return event;
          }
        }),
      };
    }

    case 'SUCCEEDED_CARD': {
      return {
        ...state,
        events: state.events.map((event, index) => {
          if (state.currentCardIndex === index) {
            return {
              ...event,
              completed: true,
              successMessage: action.message,
            };
          } else {
            return event;
          }
        }),
      };
    }

    case 'GAME_OVER':
      return {
        ...state,
        score: action.score,
      };

    default:
      return state;
  }
};

const WEBSOCKET_URL = 'ws://localhost:8080/play';
// const WEBSOCKET_URL = 'ws://35.88.106.137:8080/play';

export default memo(function GameBoard() {
  const [state, dispatch] = useReducer(reducer, {
    currentCardIndex: -1,
    events: [...CARD_DATA],
    score: null,
  });

  const onMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      console.log('/play onMessage', data);

      switch (data.type) {
        case 'new_card':
          dispatch({
            type: 'ADD_CARD',
            description: data.message,
            currentCardIndex: state.currentCardIndex + 1,
          });
          break;

        case 'failure':
          dispatch({ type: 'FAILED_CARD', message: data.message });
          break;

        case 'success':
          dispatch({ type: 'SUCCEEDED_CARD', message: data.message });
          break;

        case 'game_over':
          dispatch({ type: 'GAME_OVER', score: data.score });
          break;
      }
    },
    [state.currentCardIndex]
  );

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
    onMessage,
  });

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
    // console.log('audio stream: ', data);
    sendMessage(data);
  }, []);

  // console.log('state.events', state.events);

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
          score={state.score}
          isActive={state.currentCardIndex === i}
          startAudioStream={startAudioStream}
          stopAudioStream={stopAudioStream}
          streamAudio={streamAudio}
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
});

// bg: #050a0f
// header bg: #0b121b
// card bg: #1a2532
// "white": #f8f8f8
// powered by: #7c92ab
// dg red: #fd5c5c
// meadow: #38EDAC
