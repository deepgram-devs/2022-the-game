import GameBoard from './components/GameBoard';
import Row from './components/Row';
import { ReactSVG } from 'react-svg';
import { ModalProvider } from 'use-modal-hook';
import getSvgPath from './utils/getSvgPath';

function App() {
  return (
    <ModalProvider>
      <div
        style={{
          backgroundImage: `url(${getSvgPath('bg-pattern')})`,
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top left',
        }}
      >
        <Header />
        <GameBoard />
      </div>
    </ModalProvider>
  );
}

function Header() {
  return (
    <Row
      alignItems="center"
      justifyContent="space-between"
      style={{
        padding: '12px 30px',
        background: '#0b121b',
      }}
    >
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '0 30px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            color: '#f8f8f8',
          }}
        >
          2022: The Game
        </h1>

        <h2
          style={{
            fontSize: '16px',
            color: '#7c92ab',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          Powered by: <ReactSVG src={getSvgPath('logo-deepgram')} />
        </h2>
      </Row>
    </Row>
  );
}

export default App;
