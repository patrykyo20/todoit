import { useCallback } from "react";

export const useTaskSound = (isCompleted: boolean) => {
  const playClickSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();

      if (!isCompleted) {
        // Success sound - pleasant ascending chord (when checking)
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
        const duration = 0.15;

        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = "sine";

          const startTime = audioContext.currentTime + index * 0.02;
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + duration
          );

          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        });
      } else {
        // Uncheck sound - lower, neutral tone (when unchecking)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 350;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.12
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
      }
    } catch {
      console.debug("Audio not available");
    }
  }, [isCompleted]);

  return { playClickSound };
};
