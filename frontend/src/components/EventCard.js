import { ReactSVG } from 'react-svg';
import { Fragment, useReducer } from 'react';
import Col from './Col';
import useHover from '../hooks/useHover';
import { useModal } from 'use-modal-hook';
import Row from './Row';
import Microphone from './Microphone';
import BaseModal from './BaseModal';
import getSvgPath from '../utils/getSvgPath';
import PrimaryButton from './PrimaryButton';

export default function EventCard({
  eventTitle,
  eventBody,
  completed,
  isActive,
  startAudioStream,
  stopAudioStream,
  streamAudio,
}) {
  const [hoverRef, isHovered] = useHover();
  const [showModal] = useModal(EventCardDetailsModal, {
    description: eventBody,
    startAudioStream,
    stopAudioStream,
    streamAudio,
    completed,
  });

  return (
    <Col
      ref={hoverRef}
      alignItems="center"
      justifyContent="center"
      style={{
        gap: '8px',
        cursor: isActive ? 'pointer' : 'default',
      }}
      onClick={isActive ? showModal : () => {}}
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

function EventCardDetailsModal({
  startAudioStream,
  stopAudioStream,
  streamAudio,
  completed,
  ...props
}) {
  const [state, dispatch] = useReducer(modalReducer, {
    // success: null,
    showGameover: false,
  });

  return (
    <BaseModal {...props}>
      {({ description, onClose }) =>
        state.showGameover ? (
          <Gameover />
        ) : (
          <Fragment>
            <Col style={{ gap: '30px' }}>
              <div>{description}</div>

              <Microphone
                // onSuccess={() => dispatch({ type: 'SUCCESS' })}
                // onFail={() => dispatch({ type: 'FAIL' })}
                startAudioStream={startAudioStream}
                stopAudioStream={stopAudioStream}
                streamAudio={streamAudio}
              />

              {completed !== null ? (
                <Verdict
                  success={completed}
                  onClose={onClose}
                  onFailCtaClick={() => dispatch({ type: 'GAMEOVER' })}
                />
              ) : null}
            </Col>
          </Fragment>
        )
      }
    </BaseModal>
  );
}

function Gameover() {
  return (
    <Col alignItems="center" justifyContent="center" style={{ gap: '20px' }}>
      <Row
        alignItems="center"
        justifyContent="center"
        style={{ fontWeight: 'bold', fontSize: '16px' }}
      >
        You made it to May.
      </Row>

      <Row
        alignItems="center"
        justifyContent="center"
        style={{ textAlign: 'center' }}
      >
        Well, 2023 isn't for everyone.
        <br />
        You need to be extremely hardcore.
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
          Play again
        </Row>
      </Col>
    </Col>
  );
}

function Verdict({ success, onClose, onFailCtaClick }) {
  return (
    <Col alignItems="center">
      <Row style={{ width: '100%' }}>
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

      <Row style={{ gap: '20px' }} alignItems="center" justifyContent="center">
        <ReactSVG
          src={getSvgPath(success ? 'thumbs-up-button' : 'thumbs-down-button')}
        />

        <span css={{ maxWidth: '75%' }}>
          {success
            ? 'Hooray! You were angry enough and can continue 2022.'
            : 'You were not angry enough. Better luck next time!'}
        </span>
      </Row>

      <PrimaryButton
        onClick={success ? onClose : onFailCtaClick}
        style={{ marginTop: '20px' }}
      >
        {success ? 'Next Challenge' : 'Oh No!'}
      </PrimaryButton>
    </Col>
  );
}