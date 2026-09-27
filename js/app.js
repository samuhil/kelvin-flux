/**
 * KelvinFlux - Main Application Controller
 * Coordinates ColorEngine, ParticleEngine, and SoundEngine.
 */

import { ColorEngine } from './colorEngine.js';
import { ParticleEngine } from './particles.js';
import { SoundEngine } from './soundEngine.js';

class App {
  constructor() {
    this.kelvin = 6500;
    this.soundEngine = new SoundEngine();
    this.particleEngine = null;
    this.isLiveSyncActive = false;
    this.isScreenTintActive = false;
    this.liveClockTimer = null;

    // Presets definition
    this.presets = [
      { id: 'candle', name: 'Candlelight', kelvin: 1200, icon: '🔥' },
      { id: 'hearth', name: 'Cozy Hearth', kelvin: 2000, icon: '🛋️' },
      { id: 'golden', name: 'Golden Hour', kelvin: 3200, icon: '🌅' },
      { id: 'studio', name: 'Studio Neutral', kelvin: 4500, icon: '💡' },
      { id: 'daylight', name: 'True Daylight', kelvin: 6500, icon: '☀️' },
      { id: 'overcast', name: 'Overcast Sky', kelvin: 8000, icon: '☁️' },
      { id: 'glacial', name: 'Glacial Frost', kelvin: 10500, icon: '❄️' },
      { id: 'cyber', name: 'Cyber Deep Cool', kelvin: 12000, icon: '🌌' },
    ];
  }

  init() {
    // 1. Initialize Particles
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
      this.particleEngine = new ParticleEngine(canvas);
    }

    // 2. Setup DOM Elements & Listeners
    this.setupControls();
    this.setupPresets();
    this.setupCircadian();
    this.setupSplitSlider();
    this.setupKeyboardShortcuts();
    this.setupDevTools();

    // 3. Render Initial State
    this.setTemperature(6500, false);
  }

  /**
   * Primary method to set color temperature across all subsystems
   */
  setTemperature(kelvin, updateSlider = true) {
    this.kelvin = Math.round(Math.min(Math.max(kelvin, 1000), 12000));
    const theme = ColorEngine.generateTheme(this.kelvin);

    // Apply to DOM
    ColorEngine.applyThemeToDOM(theme);

    // Update Particles
    if (this.particleEngine) {
      this.particleEngine.setTemperature(this.kelvin, theme.rgb, theme.warmth);
    }

    // Update Audio
    if (this.soundEngine) {
      this.soundEngine.updateTemperature(this.kelvin);
    }

    // Update UI elements
    this.updateUI(theme, updateSlider);
  }

  updateUI(theme, updateSlider) {
    const kelvinSlider = document.getElementById('kelvin-slider');
    if (updateSlider && kelvinSlider) {
      kelvinSlider.value = this.kelvin;
    }

    // Main Value Readouts
    const kelvinDisplay = document.getElementById('display-kelvin-val');
    if (kelvinDisplay) kelvinDisplay.textContent = this.kelvin.toLocaleString();

    const titleDisplay = document.getElementById('display-temp-title');
    if (titleDisplay) titleDisplay.textContent = `${theme.metadata.icon} ${theme.metadata.label}`;

    const descDisplay = document.getElementById('display-temp-desc');
    if (descDisplay) descDisplay.textContent = theme.metadata.description;

    const catBadge = document.getElementById('display-temp-category');
    if (catBadge) catBadge.textContent = theme.metadata.category;

    // Warmth meter indicator
    const warmthThumb = document.getElementById('warmth-gauge-thumb');
    const warmthReadout = document.getElementById('display-warmth-pct');
    if (warmthThumb) {
      // 100% warmth is at left (0%), 0% warmth is at right (100%)
      const leftPos = 100 - theme.warmth;
      warmthThumb.style.left = `${leftPos}%`;
    }
    if (warmthReadout) warmthReadout.textContent = `${theme.warmth}%`;

    // Metrics Panel
    const rgbReadout = document.getElementById('metric-rgb');
    if (rgbReadout) rgbReadout.textContent = `${theme.rgb.r}, ${theme.rgb.g}, ${theme.rgb.b}`;

    const hexReadout = document.getElementById('metric-hex');
    if (hexReadout) hexReadout.textContent = theme.hex;

    const hslReadout = document.getElementById('metric-hsl');
    if (hslReadout) hslReadout.textContent = `${theme.hsl.h}°, ${theme.hsl.s}%, ${theme.hsl.l}%`;

    const blueReduction = document.getElementById('metric-blue-reduction');
    if (blueReduction) blueReduction.textContent = `${theme.blueReduction}%`;

    const luminance = document.getElementById('metric-luminance');
    if (luminance) luminance.textContent = theme.luminance;

    // Update active preset button highlight
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      const btnKelvin = parseInt(btn.dataset.kelvin, 10);
      if (Math.abs(btnKelvin - this.kelvin) < 250) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update CSS snippet code block
    this.updateCssSnippet(theme);
  }

  setupControls() {
    const kelvinSlider = document.getElementById('kelvin-slider');
    if (kelvinSlider) {
      kelvinSlider.addEventListener('input', (e) => {
        this.setTemperature(parseInt(e.target.value, 10), false);
      });
    }

    // Audio button toggle
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isPlaying = this.soundEngine.toggle();
        audioBtn.classList.toggle('active', isPlaying);
        const label = audioBtn.querySelector('.btn-label');
        if (label) label.textContent = isPlaying ? 'Soundscape On' : 'Ambient Sound';
      });
    }

    // Screen Tint Overlay toggle
    const tintBtn = document.getElementById('btn-toggle-tint');
    const tintOverlay = document.getElementById('screen-tint-overlay');
    if (tintBtn && tintOverlay) {
      tintBtn.addEventListener('click', () => {
        this.isScreenTintActive = !this.isScreenTintActive;
        tintOverlay.classList.toggle('active', this.isScreenTintActive);
        tintBtn.classList.toggle('active', this.isScreenTintActive);
      });
    }

    // Fullscreen Ambient mode toggle
    const fsBtn = document.getElementById('btn-toggle-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        this.toggleFullscreenAmbient();
      });
    }
  }

  toggleFullscreenAmbient() {
    document.body.classList.toggle('fullscreen-ambient');
    const isFullscreen = document.body.classList.contains('fullscreen-ambient');
    const fsBtn = document.getElementById('btn-toggle-fullscreen');
    if (fsBtn) {
      fsBtn.classList.toggle('active', isFullscreen);
      const label = fsBtn.querySelector('.btn-label');
      if (label) label.textContent = isFullscreen ? 'Exit Ambient' : 'Mood Light';
    }

    // Also request browser full screen if supported
    if (isFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  setupPresets() {
    const container = document.getElementById('presets-grid');
    if (!container) return;

    container.innerHTML = '';
    this.presets.forEach((p, index) => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.dataset.kelvin = p.kelvin;
      btn.innerHTML = `
        <span class="preset-icon">${p.icon}</span>
        <span class="preset-name">${p.name}</span>
        <span class="preset-kelvin">${p.kelvin}K</span>
      `;
      btn.addEventListener('click', () => {
        this.setTemperature(p.kelvin, true);
      });
      container.appendChild(btn);
    });
  }

  setupCircadian() {
    const circadianSlider = document.getElementById('circadian-slider');
    const timeDisplay = document.getElementById('circadian-time-display');
    const liveSyncBtn = document.getElementById('btn-live-sync');

    const updateTimeFromHour = (hourFloat) => {
      const hours = Math.floor(hourFloat);
      const minutes = Math.floor((hourFloat - hours) * 60);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const formatted = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      if (timeDisplay) timeDisplay.textContent = formatted;

      // Calculate Circadian Kelvin Curve
      const simulatedKelvin = this.calculateCircadianKelvin(hourFloat);
      this.setTemperature(simulatedKelvin, true);
    };

    if (circadianSlider) {
      circadianSlider.addEventListener('input', (e) => {
        if (this.isLiveSyncActive) {
          this.stopLiveSync();
        }
        updateTimeFromHour(parseFloat(e.target.value));
      });
    }

    if (liveSyncBtn) {
      liveSyncBtn.addEventListener('click', () => {
        if (this.isLiveSyncActive) {
          this.stopLiveSync();
        } else {
          this.startLiveSync(circadianSlider, updateTimeFromHour);
        }
      });
    }
  }

  calculateCircadianKelvin(hour) {
    // 0h - 4h: 1200K (Candlelight midnight)
    // 4h - 7h: Smooth rise to 3500K (Sunrise)
    // 7h - 12h: Smooth rise to 6500K (Noon peak)
    // 12h - 17h: Gradual decrease 6500K -> 5000K (Afternoon)
    // 17h - 20h: Sunset golden drop 5000K -> 2400K (Sunset)
    // 20h - 24h: Evening wind-down 2400K -> 1200K (Night)
    if (hour < 4) {
      return 1200;
    } else if (hour < 7) {
      const t = (hour - 4) / 3;
      return 1200 + t * 2300;
    } else if (hour < 12) {
      const t = (hour - 7) / 5;
      return 3500 + t * 3000;
    } else if (hour < 17) {
      const t = (hour - 12) / 5;
      return 6500 - t * 1500;
    } else if (hour < 20) {
      const t = (hour - 17) / 3;
      return 5000 - t * 2600;
    } else {
      const t = (hour - 20) / 4;
      return 2400 - t * 1200;
    }
  }

  startLiveSync(slider, callback) {
    this.isLiveSyncActive = true;
    const btn = document.getElementById('btn-live-sync');
    if (btn) btn.classList.add('active');

    const tick = () => {
      const now = new Date();
      const hourFloat = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
      if (slider) slider.value = hourFloat;
      callback(hourFloat);
    };

    tick();
    this.liveClockTimer = setInterval(tick, 10000);
  }

  stopLiveSync() {
    this.isLiveSyncActive = false;
    const btn = document.getElementById('btn-live-sync');
    if (btn) btn.classList.remove('active');
    if (this.liveClockTimer) clearInterval(this.liveClockTimer);
  }

  setupSplitSlider() {
    const container = document.getElementById('split-container');
    const handle = document.getElementById('split-handle');
    const coolSide = document.getElementById('split-cool-side');
    if (!container || !handle || !coolSide) return;

    let isDragging = false;

    const setPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0.05, Math.min(0.95, pos));
      const pct = pos * 100;

      handle.style.left = `${pct}%`;
      coolSide.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
    };

    handle.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) setPosition(e.clientX);
    });

    // Touch support
    handle.addEventListener('touchstart', () => { isDragging = true; });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) setPosition(e.touches[0].clientX);
    });

    // Initial 50% clip
    coolSide.style.clipPath = `polygon(50% 0, 100% 0, 100% 100%, 50% 100%)`;
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.setTemperature(this.kelvin + 100, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.setTemperature(this.kelvin - 100, true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.setTemperature(this.kelvin + 500, true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.setTemperature(this.kelvin - 500, true);
      } else if (e.code === 'Space') {
        e.preventDefault();
        const audioBtn = document.getElementById('btn-toggle-audio');
        if (audioBtn) audioBtn.click();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        this.toggleFullscreenAmbient();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        const tintBtn = document.getElementById('btn-toggle-tint');
        if (tintBtn) tintBtn.click();
      } else if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key, 10) - 1;
        if (this.presets[index]) {
          this.setTemperature(this.presets[index].kelvin, true);
        }
      }
    });
  }

  setupDevTools() {
    const copyBtn = document.getElementById('btn-copy-css');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const theme = ColorEngine.generateTheme(this.kelvin);
        const cssString = `:root {\n` +
          `  /* KelvinFlux ${this.kelvin}K Theme Export */\n` +
          Object.entries(theme.cssVariables)
            .map(([k, v]) => `  ${k}: ${v};`)
            .join('\n') +
          `\n}`;

        navigator.clipboard.writeText(cssString).then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied CSS!';
          setTimeout(() => { copyBtn.textContent = original; }, 2000);
        });
      });
    }
  }

  updateCssSnippet(theme) {
    const snippetEl = document.getElementById('code-snippet-export');
    if (!snippetEl) return;

    snippetEl.innerHTML = 
`<span class="code-keyword">:root</span> {
  <span class="code-comment">/* ${this.kelvin}K (${theme.metadata.label}) */</span>
  <span class="code-func">--temp-kelvin</span>: <span class="code-num">${this.kelvin}</span>;
  <span class="code-func">--temp-color</span>: <span class="code-str">${theme.cssVariables['--temp-color']}</span>;
  <span class="code-func">--temp-accent</span>: <span class="code-str">${theme.cssVariables['--temp-accent']}</span>;
  <span class="code-func">--warmth</span>: <span class="code-num">${theme.warmth}%</span>;
  <span class="code-func">--blue-reduction</span>: <span class="code-num">${theme.blueReduction}%</span>;
}`;
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
