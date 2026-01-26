export const triggerHaptic = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(50); // A short vibration for feedback
    } catch (error) {
      console.error("Haptic feedback failed", error);
    }
  }
};
