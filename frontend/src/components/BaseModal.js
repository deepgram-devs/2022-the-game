import { memo } from 'react';
import Modal from 'react-modal';
import { ReactSVG } from 'react-svg';
import Row from './Row';
import getSvgPath from '../utils/getSvgPath';

export default memo(({ isOpen, onClose, children, ...props }) => (
  <Modal
    style={{
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
    }}
    isOpen={isOpen}
    onRequestClose={onClose}
  >
    <Row justifyContent="flex-end">
      <button
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onClick={onClose}
      >
        <ReactSVG src={getSvgPath('close')} />
      </button>
    </Row>

    {children({
      ...props,
      onClose,
    })}
  </Modal>
));
