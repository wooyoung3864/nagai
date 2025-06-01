// src/components/GestureHelpButton/GestureHelpButton.tsx
import './GestureHelpButton.css';

interface GestureHelpButtonProps {
  onClick: () => void;
  shouldBlink?: boolean; // NEW (06/01, wyjung): Optional prop to control blinking
}

export default function GestureHelpButton({ onClick, shouldBlink }: GestureHelpButtonProps) {
  return (
    <button 
    className={`gesture-help${shouldBlink ? ' blink' : ''}`} 
    onClick={onClick}>
      ?
    </button>
  );
}
