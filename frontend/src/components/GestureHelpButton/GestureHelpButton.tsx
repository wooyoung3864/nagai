// src/components/GestureHelpButton/GestureHelpButton.tsx
import './GestureHelpButton.css';

interface GestureHelpButtonProps {
  onClick: () => void;
}

export default function GestureHelpButton({ onClick }: GestureHelpButtonProps) {
  return (
    <button className="gesture-help" onClick={onClick}>
      ?
    </button>
  );
}
