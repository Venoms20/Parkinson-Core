export const playAlarmSound = () => {
  // Garante que o código só rode no navegador
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  
  if (!AudioContext) {
    console.warn("Web Audio API is not supported in this browser.");
    return;
  }

  try {
    const audioCtx = new AudioContext();

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota A5, clara e audível

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // Começa com 50% do volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5); // Fade out em 0.5s

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5); // Toca por 0.5 segundos
  } catch (error) {
    console.error("Could not play alarm sound:", error);
  }
};
