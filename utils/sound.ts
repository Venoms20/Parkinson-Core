export const playAlarmSound = () => {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audioCtx = new AudioContext();
    
    // Função para criar um "bip" curto
    const playBeep = (startTime: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square'; // Som mais "cortante" para alarme
      oscillator.frequency.setValueAtTime(880, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    };

    // Toca uma sequência de 3 bips
    const now = audioCtx.currentTime;
    playBeep(now);
    playBeep(now + 0.3);
    playBeep(now + 0.6);
    
  } catch (error) {
    console.error("Erro ao tocar som de alarme:", error);
  }
};
