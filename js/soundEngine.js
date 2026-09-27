/**
 * KelvinFlux Procedural Audio Engine
 * Generates dynamic, ambient atmospheric soundscapes in real time using the Web Audio API.
 * Warmth (low Kelvin): Crackling fireplace embers, warm analog drone, soft harmonic rumble.
 * Coolness (high Kelvin): High-altitude arctic wind, crystalline chimes, airy glacial breeze.
 * Zero external audio files required!
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.35;

    // Master nodes
    this.masterGain = null;

    // Warm sub-systems
    this.warmGain = null;
    this.fireCrackleTimer = null;
    this.warmDroneOsc = null;

    // Cool sub-systems
    this.coolGain = null;
    this.windNoiseNode = null;
    this.windFilter = null;
    this.coolChimeOsc = null;

    // Current state
    this.currentKelvin = 6500;
  }

  /**
   * Initialize Web Audio Context upon user interaction
   */
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Warm bus
    this.warmGain = this.ctx.createGain();
    this.warmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.warmGain.connect(this.masterGain);

    // Cool bus
    this.coolGain = this.ctx.createGain();
    this.coolGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.coolGain.connect(this.masterGain);

    this.setupWarmGenerators();
    this.setupCoolGenerators();
  }

  /**
   * Generates warm cozy drone and ember crackle nodes
   */
  setupWarmGenerators() {
    // 1. Low warm ambient drone (analog chord: 110Hz A2)
    this.warmDroneOsc = this.ctx.createOscillator();
    this.warmDroneOsc.type = 'sine';
    this.warmDroneOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

    const warmDroneFilter = this.ctx.createBiquadFilter();
    warmDroneFilter.type = 'lowpass';
    warmDroneFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.warmDroneOsc.connect(warmDroneFilter);
    warmDroneFilter.connect(droneGain);
    droneGain.connect(this.warmGain);
    this.warmDroneOsc.start();

    // 2. Ember crackle loop using filtered noise bursts
    this.startEmberCrackle();
  }

  /**
   * Periodically trigger subtle organic crackles of a wood fire
   */
  startEmberCrackle() {
    const triggerCrackle = () => {
      if (!this.isPlaying || !this.ctx) {
        this.fireCrackleTimer = setTimeout(triggerCrackle, 800);
        return;
      }

      // Only produce crackle if warm gain is audible
      if (this.warmGain.gain.value > 0.05) {
        const bufferSize = this.ctx.sampleRate * 0.04; // 40ms burst
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800 + Math.random() * 1500, this.ctx.currentTime);

        const crackleGain = this.ctx.createGain();
        const crackleAmp = (0.04 + Math.random() * 0.08) * this.warmGain.gain.value;
        crackleGain.gain.setValueAtTime(crackleAmp, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(crackleGain);
        crackleGain.connect(this.warmGain);

        noise.start();
      }

      const nextDelay = 120 + Math.random() * 450;
      this.fireCrackleTimer = setTimeout(triggerCrackle, nextDelay);
    };

    triggerCrackle();
  }

  /**
   * Generates cool arctic wind and crystalline shimmer
   */
  setupCoolGenerators() {
    // 1. Procedural pink/white noise for arctic wind
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.05;
      b1 = 0.963 * b1 + white * 0.11;
      b2 = 0.57 * b2 + white * 0.55;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    this.windNoiseNode = this.ctx.createBufferSource();
    this.windNoiseNode.buffer = noiseBuffer;
    this.windNoiseNode.loop = true;

    // Resonant bandpass filter for whistling wind effect
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Subtle LFO modulating wind frequency
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // slow breathing sweep

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(this.windFilter.frequency);
    lfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.windNoiseNode.connect(this.windFilter);
    this.windFilter.connect(windGain);
    windGain.connect(this.coolGain);
    this.windNoiseNode.start();
  }

  /**
   * Update sound balance according to Kelvin temperature
   * @param {number} kelvin (1000 - 12000)
   */
  updateTemperature(kelvin) {
    this.currentKelvin = kelvin;
    if (!this.ctx || !this.isPlaying) return;

    // Warm ratio: 1.0 at 1000K, 0.0 at 7000K
    // Cool ratio: 0.0 at 5000K, 1.0 at 12000K
    let warmFactor = 0;
    let coolFactor = 0;

    if (kelvin < 5500) {
      warmFactor = (5500 - kelvin) / 4500; // 0 to 1
    }
    if (kelvin > 5500) {
      coolFactor = (kelvin - 5500) / 6500; // 0 to 1
    }

    const t = this.ctx.currentTime;
    this.warmGain.gain.linearRampToValueAtTime(warmFactor * 0.7, t + 0.1);
    this.coolGain.gain.linearRampToValueAtTime(coolFactor * 0.7, t + 0.1);

    if (this.windFilter) {
      // Wind tone gets sharper and higher pitch as it gets cooler
      const windFreq = 300 + coolFactor * 600;
      this.windFilter.frequency.setTargetAtTime(windFreq, t, 0.2);
    }
  }

  /**
   * Toggle audio playback on or off
   */
  toggle() {
    this.init();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.2);
      this.updateTemperature(this.currentKelvin);
    } else {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }

    return this.isPlaying;
  }

  /**
   * Set Master Volume (0.0 to 1.0)
   */
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }
}
