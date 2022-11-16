export default function GameBoard() {
  return (
    <div>
      <Header>Survive 2022 - The Game</Header>
    </div>
  );
}

function Header({ children }) {
  return (
    <h1
      style={{
        fontSize: '24px',
      }}
    >
      {children}
    </h1>
  );
}
