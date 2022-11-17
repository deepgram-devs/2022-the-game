export default function PrimaryButton({ children, style = {}, ...props }) {
  return (
    <button
      style={{
        cursor: 'pointer',
        color: '#141E29',
        fontWeight: 'bold',
        background: '#38EDAC',
        padding: '10px 20px',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
