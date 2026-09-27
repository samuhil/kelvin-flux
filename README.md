# ✨ KelvinFlux — Dynamic Cool to Warm Ambient Display Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg)](package.json)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange.svg)](js/soundEngine.js)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-brightgreen.svg)](.github/workflows/deploy.yml)
[![Standard](https://img.shields.io/badge/Code-Vanilla_ES6%2B-yellow.svg)](js/app.js)

> A cinematic ambient display studio and color temperature engine that dynamically transforms your entire screen environment from **molten candlelight warmth (1,000K)** to **arctic glacial cool (12,000K)**.

Featuring real-time Planckian blackbody mathematics, generative particle shaders, procedural Web Audio soundscapes, circadian rhythm synchronization, and interactive perceptual display tests.

---

## 🌟 Features Overview

### 1. 🌡️ Blackbody Planckian Color Engine (`1,000K – 12,000K`)
* Mathematically models radiation of an idealized blackbody radiator based on Tanner Helland's algorithm and CIE standard illuminants.
* Dynamically calculates **RGB, Hex, HSL, Relative Luminance (WCAG 2.1)**, and **Blue Light Reduction percentage**.
* Injects reactive CSS custom properties (`--temp-color`, `--temp-glow`, `--bg-main`, `--temp-accent`) directly into `:root`.

### 2. 🌌 Generative Ambient Atmosphere Canvas
* High-performance 60 FPS HTML5 canvas with device pixel ratio scaling.
* **Warm Spectrum (< 4,500K)**: Buoyant rising embers, flickering firefly sparks, heat shimmer waves, and golden-red bokeh.
* **Cool Spectrum (> 6,500K)**: Descending crystalline snowflakes, aurora filaments, glacial ice sparkles, and frosty drift.
* **Interactive Physics**: Cursor interactions softly radiate and deflect particles.

### 3. 🎧 Procedural Web Audio Soundscapes (Zero Audio Files!)
* Generates atmospheric audio in real time using the **Web Audio API**:
  * **Warm Mode**: Soothing crackling campfire embers (burst-filtered noise) and an analog 110Hz sub-drone.
  * **Cool Mode**: Whistling high-altitude arctic wind (pink noise modulated by slow LFOs and resonant bandpass filters).
* Seamless real-time crossfading as you drag the temperature slider.

### 4. ⏰ Circadian Rhythm Simulator & Live Sync
* 24-Hour Day/Night scrubber:
  * **06:00 AM**: Peach sunrise (3,000K)
  * **12:00 PM**: Bright solar daylight (6,500K D65)
  * **06:00 PM**: Amber golden hour (2,400K)
  * **11:00 PM – 04:00 AM**: Deep melatonin-protecting candlelight (1,200K)
* **Live Clock Sync**: Automatically matches your display temperature to your actual local system time.

### 5. 🖥️ Interactive Display Showcase Modules
* **Split-Screen Drag Comparison**: Side-by-side interactive divider comparing ultra-warm (2,000K) against glacial cool (10,500K).
* **Reading Comfort & Fatigue Tester**: Real-time sample typography testing legibility across spectrums.
* **Syntax Code Highlighter**: Dynamic code preview illustrating warm vs cool editor themes.
* **Fullscreen Mood Light Mode (`F`)**: Turns your display into an ambient wall wash, video call ring light, or bedtime nightlight.
* **Screen Tint Overlay (`T`)**: High-efficiency display filter with multiplier blending.

---

## 🎨 Built-in Temperature Presets

| Key | Preset | Temp | Spectrum | Description |
|:---:|:---|:---:|:---|:---|
| `1` | 🔥 **Candlelight** | 1,200K | Ultra Warm | Zero blue light, optimal for deep evening & sleep prep. |
| `2` | 🛋️ **Cozy Hearth** | 2,000K | Deep Warm | Incandescent amber, intimate living room atmosphere. |
| `3` | 🌅 **Golden Hour** | 3,200K | Warm Ambient | Radiance of dusk & early sunrise. |
| `4` | 💡 **Studio Neutral** | 4,500K | Balanced Warm | Halogen glow, balanced contrast, low eye fatigue. |
| `5` | ☀️ **True Daylight** | 6,500K | True Daylight | Reference sRGB D65 daylight, accurate color calibration. |
| `6` | ☁️ **Overcast Sky** | 8,000K | Crisp Cool | High alertness, crisp blue-shifted sky light. |
| `7` | ❄️ **Glacial Frost** | 10,500K | Arctic Cool | Alpine crystalline clarity, high vigilance. |
| `8` | 🌌 **Cyber Deep Cool** | 12,000K | Ultra Cool | Neon ultraviolet-blue twilight immersion. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `←` / `→` | Fine-tune temperature by ±100 Kelvin |
| `↑` / `↓` | Coarse-tune temperature by ±500 Kelvin |
| `1` – `8` | Instantly jump to Ambiance Presets |
| `Space` | Toggle Procedural Ambient Soundscape |
| `F` | Toggle Fullscreen Ambient Mood Light Mode |
| `T` | Toggle Full-screen Tint Filter Overlay |

---

## 📐 Mathematical Formulation

The engine approximates the **Planckian Locus** using Tanner Helland’s piecewise algorithmic derivation of blackbody temperature $T$ (where $t = T / 100$):

```
For Red (t ≤ 66):   R = 255
For Red (t > 66):   R = 329.6987 × (t - 60)^(-0.1332)

For Green (t ≤ 66): G = 99.4708 × ln(t) - 161.1195
For Green (t > 66): G = 288.1221 × (t - 60)^(-0.0755)

For Blue (t ≥ 66):  B = 255
For Blue (t ≤ 19):  B = 0
For Blue (19<t<66): B = 138.5177 × ln(t - 10) - 305.0447
```

---

## 🚀 Quick Start & Usage

This project has **zero external build dependencies**. It runs natively in any modern browser!

### Option A: Open directly
Simply double-click [`index.html`](index.html) or drag it into Chrome, Edge, Firefox, or Safari.

### Option B: Local Web Server
```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve .
```
Visit `http://localhost:8080` in your browser.

---

## 📤 Push this Repository to GitHub

To push this repository to your personal or organization GitHub account:

```bash
# 1. Create a new repository on https://github.com/new named 'kelvin-flux'
# 2. Link your local repository to GitHub:
git remote add origin https://github.com/samuhil/kelvin-flux.git

# 3. Rename default branch to main and push:
git branch -M main
git push -u origin main
```

### Enable Free GitHub Pages Hosting
1. Go to your repo on GitHub: **Settings** > **Pages**.
2. Under **Build and deployment**, select **GitHub Actions** (the included `.github/workflows/deploy.yml` will automatically build and publish your site upon each push!).

---

## 📁 Repository Structure

```
kelvin-flux/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages CI/CD workflow
├── assets/                 # Icons, vector badges, and media
├── css/
│   └── style.css           # Glassmorphism, animations, responsive design
├── js/
│   ├── app.js              # Application coordinator & event bindings
│   ├── colorEngine.js      # Blackbody Planckian locus mathematical engine
│   ├── particles.js        # Generative atmosphere & ember/frost particles
│   └── soundEngine.js      # Procedural Web Audio synthesizer (fire & wind)
├── .gitignore              # Ignored files & temp directories
├── index.html              # Main interactive UI dashboard
├── LICENSE                 # MIT License
├── package.json            # Project manifest & npm scripts
└── README.md               # Documentation & specifications
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
