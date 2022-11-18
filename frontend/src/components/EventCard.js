import { ReactSVG } from 'react-svg';
import { Fragment, useEffect, useReducer, useState } from 'react';
import Col from './Col';
import useHover from '../hooks/useHover';
import Row from './Row';
import Microphone from './Microphone';
import getSvgPath from '../utils/getSvgPath';
import PrimaryButton from './PrimaryButton';
import Modal from 'react-modal';

const MODAL_STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    color: '#f8f8f8',
    backgroundColor: '#1a2532',
    width: '500px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
    border: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: '24px',
  },
};

export default function EventCard({
  eventTitle,
  eventBody,
  failMessage,
  successMessage,
  completed,
  isActive,
  startAudioStream,
  stopAudioStream,
  streamAudio,
  score,
}) {
  const [hoverRef, isHovered] = useHover();
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const [state, dispatch] = useReducer(modalReducer, {
    showGameover: false,
  });

  const isGameWon = score !== null && completed;

  return (
    <Fragment>
      <Col
        ref={hoverRef}
        alignItems="center"
        justifyContent="center"
        style={{
          gap: '8px',
          cursor: isActive ? 'pointer' : 'default',
        }}
        onClick={isActive ? openModal : () => {}}
      >
        <span
          style={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'color 350ms',
            color: isActive && isHovered ? '#fd5c5c' : '#f8f8f8',
          }}
        >
          {eventTitle}
        </span>

        {completed ? (
          <CompletedEventCard />
        ) : isActive ? (
          <ActiveEventCard isHovered={isHovered} />
        ) : (
          <LockedEventCard />
        )}
      </Col>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={MODAL_STYLES}
      >
        <Row justifyContent="flex-end">
          <button
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              visibility: completed === false ? 'hidden' : 'visible',
            }}
            onClick={closeModal}
          >
            <ReactSVG src={getSvgPath('close')} />
          </button>
        </Row>

        <div style={{ padding: '10px' }}>
          {state.showGameover ? (
            <Gameover score={score} isGameWon={isGameWon} />
          ) : (
            <Col style={{ gap: '30px' }}>
              <div>{eventBody}</div>

              <Microphone
                startAudioStream={startAudioStream}
                stopAudioStream={stopAudioStream}
                streamAudio={streamAudio}
              />

              {completed !== null ? (
                <Verdict
                  message={completed ? successMessage : failMessage}
                  success={completed}
                  isGameWon={isGameWon}
                  onClose={closeModal}
                  onGameOver={() => dispatch({ type: 'GAMEOVER' })}
                />
              ) : null}
            </Col>
          )}
        </div>
      </Modal>
    </Fragment>
  );
}

function EventCardImage({
  isHovered,
  isActive,
  isCompleted,
  borderColor,
  title,
  iconPath,
  background = '',
  textColor = '#fff',
}) {
  return (
    <Col
      alignItems="center"
      justifyContent="center"
      style={{
        borderRadius: '10px',
        // background: isHovered ? '#fd5c5c' : '#1a2532',
        backgroundImage: `url(${background}) `,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        transition: 'background 350ms',
        padding: '10px',
        width: '100%',
        height: '300px',
        color: textColor,
        gap: '20px',
        border: `2px solid ${borderColor}`,
      }}
    >
      {title ? (
        <span
          style={{
            fontSize: '30px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {title}
        </span>
      ) : null}

      {iconPath ? <ReactSVG src={iconPath} /> : null}
    </Col>
  );
}

function CompletedEventCard() {
  return (
    <EventCardImage
      title="Survivor Card"
      iconPath={getSvgPath('sparkle')}
      background={getSvgPath('card-completed')}
      borderColor="#1E2C3C"
      textColor="#000"
    />
  );
}

function ActiveEventCard({ isHovered }) {
  return (
    <EventCardImage
      isHovered={isHovered}
      title="Draw a life event card"
      iconPath={getSvgPath('unlocked')}
      background={getSvgPath('card-unlocked')}
      borderColor="#96A2FF"
    />
  );
}

function LockedEventCard() {
  return (
    <EventCardImage
      iconPath={getSvgPath('locked')}
      background={getSvgPath('card-locked')}
      borderColor="#1E2C3C"
    />
  );
}

const modalReducer = (state, action) => {
  switch (action.type) {
    case 'SUCCESS':
      return { ...state, success: true };

    case 'FAIL':
      return { ...state, success: false };

    case 'GAMEOVER':
      return { ...state, showGameover: true };
    default:
      return state;
  }
};

const getMonthNameFromScore = (score) =>
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
  ][score];

function Gameover({ score, isGameWon }) {
  return (
    <Col alignItems="center" justifyContent="center" style={{ gap: '20px' }}>
      <Row
        alignItems="center"
        justifyContent="center"
        style={{ fontWeight: 'bold', fontSize: '16px' }}
      >
        {isGameWon
          ? 'You made it to 2023!'
          : `You made it to ${getMonthNameFromScore(
              score
            )} with a score of ${score}`}
      </Row>

      <Row
        alignItems="center"
        justifyContent="center"
        style={{ textAlign: 'center' }}
      >
        {isGameWon ? (
          <Fragment>
            Great. Just you wait till you see what 2023 has to offer.
            <br />
            You need to be extremely hardcore.
          </Fragment>
        ) : (
          <Fragment>
            Well, 2023 isn't for everyone.
            <br />
            You need to be extremely hardcore.
          </Fragment>
        )}
      </Row>

      <Col alignItems="center" justifyContent="center" style={{ gap: '5px' }}>
        <Row
          alignItems="center"
          justifyContent="center"
          style={{ color: '#7F94AD', fontSize: '14px' }}
        >
          Share your result
        </Row>

        <Row
          alignItems="center"
          justifyContent="space-between"
          style={{ width: '100%' }}
        >
          <ReactSVG src={getSvgPath('mail')} />
          <ReactSVG src={getSvgPath('twitter')} />
          <ReactSVG src={getSvgPath('linkedin')} />
          <ReactSVG src={getSvgPath('facebook')} />
        </Row>

        <Row
          alignItems="center"
          justifyContent="center"
          style={{ marginTop: '20px' }}
        >
          <a href="/app" style={{ color: '#96A2FF', textDecoration: 'none' }}>
            Play again
          </a>
        </Row>
      </Col>
    </Col>
  );
}

function Verdict({ isGameWon, message, success, onClose, onGameOver }) {
  return (
    <Col style={{ width: '100%' }} alignItems="center">
      <Row style={{ alignSelf: 'flex-start' }}>
        <h3
          style={{
            color: '#7F94AD',
            textTransform: 'uppercase',
            fontSize: '14px',
          }}
        >
          Verdict
        </h3>
      </Row>

      <Row
        style={{ gap: '20px', alignSelf: 'flex-start' }}
        alignItems="center"
        justifyContent="center"
      >
        <ReactSVG
          src={getSvgPath(success ? 'thumbs-up-button' : 'thumbs-down-button')}
        />

        <span css={{ maxWidth: '75%' }}>{message}</span>
      </Row>

      <PrimaryButton
        onClick={isGameWon ? onGameOver : success ? onClose : onGameOver}
        style={{ marginTop: '20px' }}
      >
        {isGameWon ? 'Congratulations!' : success ? 'Next Challenge' : 'Oh No!'}
      </PrimaryButton>
    </Col>
  );
}