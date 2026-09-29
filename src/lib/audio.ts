// Synthesizer for high-priority loud order ring and notification tones

class SoundController {
  private audioCtx: AudioContext | null = null;
  private isRinging = false;
  private ringInterval: any = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Plays a single pleasant chime for user actions
  playChime(type: 'success' | 'click' | 'alert' = 'click') {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Starts continuous loud pulsing order ring tone with vibration
  startOrderRing(durationSec = 25) {
    if (this.isRinging) return;
    this.isRinging = true;

    try {
      this.initContext();
      // Trigger mobile vibration pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 600]);
      }

      const pulseRing = () => {
        if (!this.isRinging || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        // Dual harmonic oscillator for penetrating merchant ring
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'square';
        osc2.type = 'sawtooth';

        // Rising alarm urgency pitch
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(1174, now + 0.15);
        osc1.frequency.linearRampToValueAtTime(880, now + 0.3);

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.linearRampToValueAtTime(587, now + 0.15);
        osc2.frequency.linearRampToValueAtTime(440, now + 0.3);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);

        if ('vibrate' in navigator) {
          navigator.vibrate([250, 150, 250]);
        }
      };

      pulseRing();
      this.ringInterval = setInterval(pulseRing, 1000);

      // Timeout auto stop
      setTimeout(() => {
        this.stopOrderRing();
      }, durationSec * 1000);
    } catch (e) {
      console.warn('Order ring start error:', e);
    }
  }

  stopOrderRing() {
    this.isRinging = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  isCurrentlyRinging() {
    return this.isRinging;
  }
}

export const soundService = new SoundController();
