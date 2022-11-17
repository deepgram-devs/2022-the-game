import { memo } from 'react';
import CARD_DATA from '../CardData';
import Col from './Col';
import useHover from '../hooks/useHover';
import { useModal } from 'use-modal-hook';
import Modal from 'react-modal';
import Row from './Row';
import Microphone from './Microphone';

export default function GameBoard() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        padding: '30px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {CARD_DATA.map((card) => (
        <Card key={card.eventTitle} {...card} />
      ))}
    </div>
  );
}

function Card({ eventTitle, eventBody }) {
  const [hoverRef, isHovered] = useHover();
  const [showModal, hideModal] = useModal(CardDetailsModal, {
    title: eventTitle,
    description: eventBody,
    closeBtnLabel: 'Close',
  });

  return (
    <Col
      ref={hoverRef}
      alignItems="center"
      justifyContent="center"
      style={{
        gap: '8px',
        cursor: 'pointer',
      }}
      onClick={showModal}
    >
      <span
        style={{
          textTransform: 'uppercase',
          fontWeight: 'bold',
          transition: 'color 350ms',
          color: isHovered ? '#fd5c5c' : '#f8f8f8',
        }}
      >
        {eventTitle}
      </span>

      <CardImage isHovered={isHovered} />
    </Col>
  );
}

function CardImage({ isHovered }) {
  return (
    <div
      style={{
        borderRadius: '10px',
        background: isHovered ? '#fd5c5c' : '#1a2532',
        transition: 'background 350ms',
        width: '100%',
        height: '250px',
      }}
    ></div>
  );
}

const CardDetailsModal = memo(
  ({ isOpen, onClose, title, description, closeBtnLabel }) => (
    <Modal
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          color: '#f8f8f8',
          backgroundColor: '#1a2532',
          width: '50%',
          height: '75%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '10px',
          border: 0,
        },
      }}
      isOpen={isOpen}
      onRequestClose={onClose}
    >
      <Row justifyContent="space-between" alignItems="center">
        <h2>{title}</h2>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>
          {closeBtnLabel}
        </button>
      </Row>

      <Col style={{ gap: '30px' }}>
        <div>{description}</div>

        <Microphone />
      </Col>
    </Modal>
  )
);

// bg: #050a0f
// header bg: #0b121b
// card bg: #1a2532
// "white": #f8f8f8
// powered by: #7c92ab
// dg red: #fd5c5c
