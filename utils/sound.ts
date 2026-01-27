let alarmInterval: number | null = null;
let audioCtx: AudioContext | null = null;

export const startAlarmLoop = () => {
  if (typeof window === 'undefined') return;
  if (alarmInterval) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  audioCtx = new AudioContextClass();

  const playSiren = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Oscilador 1: Tom agudo
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.1);
    gain1.gain.linearRampToValueAtTime(0, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.5);
  };

  // Toca imediatamente e define o intervalo
  playSiren();
  alarmInterval = window.setInterval(playSiren, 600);
};

export const stopAlarmLoop = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
};

// Mantém a função antiga por compatibilidade, mas agora usa o novo sistema
export const playAlarmSound = () => {
  startAlarmLoop();
};
