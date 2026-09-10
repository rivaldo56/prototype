/**
 * Web Audio Engine for MangoMagic
 * Synthesizes realistic vinyl crackle, motor rumble, harmonic tones, and tactile mechanical feedback.
 * Provides real-time frequency analysis data for live audio visualizations.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 2902;
  private playbackRate: number = 1.0;
  private volume: number = 0.8;
  private timerInterval: number | null = null;

  // Audio Nodes
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private vinylGain: GainNode | null = null;
  private synthGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;

  // Listeners
  private timeListeners: Set<(time: number) => void> = new Set();
  private stateListeners: Set<(playing: boolean) => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setDuration(seconds: number) {
    this.duration = seconds;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.timeListeners.add(cb);
    return () => this.timeListeners.delete(cb);
  }

  public onStateChange(cb: (playing: boolean) => void) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.osc1 && this.osc2 && this.ctx) {
      const baseFreq1 = 110 * rate;
      const baseFreq2 = 164.81 * rate;
      this.osc1.frequency.setValueAtTime(baseFreq1, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(baseFreq2, this.ctx.currentTime);
    }
  }

  public playNeedleDrop() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      // Deep thud oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);

      // Add a quick burst of vinyl crackle
      this.triggerHapticClick(0.06);
    } catch {
      // AudioContext policy handled
    }
  }

  public triggerHapticClick(intensity = 0.05) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = this.ctx.sampleRate * 0.02;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(intensity, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch {
      // ignore
    }
  }

  public play() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      if (this.isPlaying) return;
      this.isPlaying = true;

      // 1. Vinyl Crackle Generator
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pinkish noise with periodic micro-pops
        const isPop = Math.random() < 0.0015;
        data[i] = isPop ? (Math.random() * 2 - 1) * 0.5 : (Math.random() * 2 - 1) * 0.02;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.noiseNode.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);
      this.noiseNode.start();

      // 2. Warm Harmonic Ambient Drone
      this.synthGain = this.ctx.createGain();
      this.synthGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.synthGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);

      this.osc1 = this.ctx.createOscillator();
      this.osc2 = this.ctx.createOscillator();

      this.osc1.type = 'sine';
      this.osc2.type = 'triangle';

      const base1 = 110 * this.playbackRate; // A2
      const base2 = 164.81 * this.playbackRate; // E3

      this.osc1.frequency.setValueAtTime(base1, this.ctx.currentTime);
      this.osc2.frequency.setValueAtTime(base2, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, this.ctx.currentTime);

      this.osc1.connect(filter);
      this.osc2.connect(filter);
      filter.connect(this.synthGain);
      this.synthGain.connect(this.masterGain);

      this.osc1.start();
      this.osc2.start();

      // Clock loop
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = window.setInterval(() => {
        if (!this.isPlaying) return;
        this.currentTime = Math.min(this.duration, this.currentTime + 0.25 * this.playbackRate);
        this.notifyTime();
        if (this.currentTime >= this.duration) {
          this.pause();
        }
      }, 250);

      this.notifyState();
    } catch {
      this.isPlaying = true;
      this.notifyState();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.synthGain) {
        this.synthGain.gain.setValueAtTime(this.synthGain.gain.value, now);
        this.synthGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      }
      if (this.vinylGain) {
        this.vinylGain.gain.setValueAtTime(this.vinylGain.gain.value, now);
        this.vinylGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      }
      setTimeout(() => {
        try {
          if (this.osc1) {
            this.osc1.stop();
            this.osc1.disconnect();
            this.osc1 = null;
          }
          if (this.osc2) {
            this.osc2.stop();
            this.osc2.disconnect();
            this.osc2 = null;
          }
          if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
        } catch {
          // clean
        }
      }, 250);
    }

    this.notifyState();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    this.triggerHapticClick(0.04);
    this.notifyTime();
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32).fill(12);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  private notifyTime() {
    this.timeListeners.forEach(fn => fn(this.currentTime));
  }

  private notifyState() {
    this.stateListeners.forEach(fn => fn(this.isPlaying));
  }
}

export const audioEngine = new AudioEngine();
