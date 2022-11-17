import { ReactSVG } from 'react-svg';
import { Fragment } from 'react';
import Col from './Col';
import useHover from '../hooks/useHover';
import { useModal } from 'use-modal-hook';
import Row from './Row';
import Microphone from './Microphone';
import BaseModal from './BaseModal';

export default function EventCard({
  eventTitle,
  eventBody,
  completed,
  isActive,
}) {
  const [hoverRef, isHovered] = useHover();
  const [showModal] = useModal(EventCardDetailsModal, {
    description: eventBody,
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
      iconPath="/svgs/sparkle.svg"
      background="/svgs/card-completed.svg"
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
      iconPath="/svgs/unlocked.svg"
      background="/svgs/card-unlocked.svg"
      borderColor="#96A2FF"
    />
  );
}

function LockedEventCard() {
  return (
    <EventCardImage
      iconPath="/svgs/locked.svg"
      background="/svgs/card-locked.svg"
      borderColor="#1E2C3C"
    />
  );
}

function EventCardDetailsModal(props) {
  return (
    <BaseModal {...props}>
      {({ description }) => (
        <Fragment>
          <Col style={{ gap: '30px' }}>
            <div>{description}</div>

            <Microphone />
          </Col>
        </Fragment>
      )}
    </BaseModal>
  );
}
