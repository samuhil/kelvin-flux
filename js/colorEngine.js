/**
 * KelvinFlux Color Engine
 * Mathematical simulation of Blackbody Planckian Radiation / Color Temperature
 * Converts Color Temperature (1,000K - 12,000K) to RGB, Hex, HSL, and Dynamic CSS Themes.
 */

export class ColorEngine {
  /**
   * Convert Kelvin temperature to RGB using Tanner Helland's algorithm
   * @param {number} kelvin - Color temperature between 1000 and 12000
   * @returns {{r: number, g: number, b: number}}
   */
  static kelvinToRGB(kelvin) {
    const temp = Math.min(Math.max(kelvin, 1000), 12000) / 100;
    let r, g, b;

    // Calculate Red
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Calculate Green
    if (temp <= 66) {
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
      g = Math.max(0, Math.min(255, g));
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
      g = Math.max(0, Math.min(255, g));
    }

    // Calculate Blue
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  }

  /**
   * Convert RGB to HEX string
   */
  static rgbToHex(r, g, b) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Convert RGB to HSL
   */
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Calculate Relative Luminance according to WCAG 2.1
   */
  static getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return (0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]).toFixed(3);
  }

  /**
   * Calculate percentage of warmth (100% = 1000K ultra-warm, 0% = 12000K ultra-cool)
   */
  static getWarmthPercentage(kelvin) {
    const min = 1000;
    const max = 12000;
    const clamped = Math.min(Math.max(kelvin, min), max);
    return Math.round(((max - clamped) / (max - min)) * 100);
  }

  /**
   * Calculate Blue Light Filter efficiency percentage
   * (Standard 6500K sRGB has high blue light; warm temps reduce blue photon energy)
   */
  static getBlueReduction(kelvin) {
    const rgb = this.kelvinToRGB(kelvin);
    const total = rgb.r + rgb.g + rgb.b || 1;
    const blueRatio = rgb.b / total;
    // At 6500K, blueRatio is approx 0.33. At 1200K, it's ~0.02.
    const baselineBlue = 0.333;
    const reduction = Math.max(0, Math.min(100, Math.round((1 - (blueRatio / baselineBlue)) * 100)));
    return reduction;
  }

  /**
   * Get semantic temperature description and ambient title
   */
  static getTemperatureMetadata(kelvin) {
    if (kelvin < 1500) {
      return {
        label: "Candlelight & Deep Ember",
        category: "Ultra Warm",
        description: "Zero blue light, melatonin-protective radiant ember glow. Ideal for pre-sleep and dark environments.",
        icon: "🔥",
        themeName: "flame"
      };
    } else if (kelvin < 2500) {
      return {
        label: "Cozy Hearth & Sunset",
        category: "Deep Warm",
        description: "Soft incandescent amber tones. Calming, intimate, and relaxing for late evenings.",
        icon: "🛋️",
        themeName: "hearth"
      };
    } else if (kelvin < 3500) {
      return {
        label: "Golden Hour Dusk",
        category: "Warm Ambient",
        description: "Gentle golden radiance, like early morning sunrise or picturesque golden hour.",
        icon: "🌅",
        themeName: "golden"
      };
    } else if (kelvin < 5000) {
      return {
        label: "Warm Studio Neutral",
        category: "Balanced Warm",
        description: "Balanced halogen white with subtle warmth. Excellent for reading, fatigue reduction, and desk focus.",
        icon: "💡",
        themeName: "studio"
      };
    } else if (kelvin < 6800) {
      return {
        label: "Standard Daylight (D65)",
        category: "True Daylight",
        description: "Reference sRGB 6500K daylight white. Maximum color fidelity, photo-editing standard.",
        icon: "☀️",
        themeName: "daylight"
      };
    } else if (kelvin < 8500) {
      return {
        label: "Overcast Sky",
        category: "Crisp Cool",
        description: "Clean, high-alert blue-tinted cool sky light. Stimulates alertness and focus.",
        icon: "☁️",
        themeName: "overcast"
      };
    } else if (kelvin < 10500) {
      return {
        label: "Glacial Arctic Frost",
        category: "Arctic Cool",
        description: "Crystalline blue alpine radiance. Sharp contrast, high vigilance, atmospheric cool glow.",
        icon: "❄️",
        themeName: "glacial"
      };
    } else {
      return {
        label: "Cyber Neon Deep Cool",
        category: "Ultra Cool",
        description: "Deep atmospheric ultraviolet-blue twilight. Futuristic, cyberpunk display immersion.",
        icon: "🌌",
        themeName: "cyber"
      };
    }
  }

  /**
   * Generates a complete CSS variable dictionary for the application UI
   * and ambient background based on temperature.
   */
  static generateTheme(kelvin) {
    const rgb = this.kelvinToRGB(kelvin);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const warmth = this.getWarmthPercentage(kelvin);
    const blueReduction = this.getBlueReduction(kelvin);
    const metadata = this.getTemperatureMetadata(kelvin);
    const luminance = this.getLuminance(rgb.r, rgb.g, rgb.b);

    // Warm colors lean towards deep dark brown/amber backgrounds
    // Cool colors lean towards deep navy/cyan dark backgrounds
    const bgHue = warmth > 50 ? 25 + (warmth - 50) * 0.2 : 210 + (50 - warmth) * 0.4;
    const bgSat = Math.round(20 + Math.abs(warmth - 50) * 0.4);
    const bgLight = 6; // deep sleek dark mode base

    const dominantColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
    const subtleTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
    const borderTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;

    // Dynamic accent color: warm has luminous amber/gold; cool has electric cyan/azure
    const accentColor = warmth > 50
      ? `hsl(${Math.round(35 + (warmth - 50) * 0.1)}, 95%, 60%)`
      : `hsl(${Math.round(195 + (50 - warmth) * 0.4)}, 90%, 62%)`;

    return {
      kelvin,
      rgb,
      hex,
      hsl,
      warmth,
      blueReduction,
      metadata,
      luminance,
      cssVariables: {
        '--kelvin-val': `${kelvin}K`,
        '--kelvin-num': kelvin,
        '--warmth-percent': `${warmth}%`,
        '--temp-color': dominantColor,
        '--temp-glow': glowColor,
        '--temp-subtle': subtleTint,
        '--temp-border': borderTint,
        '--temp-accent': accentColor,
        '--bg-main': `hsl(${bgHue}, ${bgSat}%, ${bgLight}%)`,
        '--bg-surface': `hsl(${bgHue}, ${bgSat + 5}%, ${bgLight + 4}%)`,
        '--bg-surface-elevated': `hsl(${bgHue}, ${bgSat + 8}%, ${bgLight + 8}%)`,
        '--ambient-grad-1': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 + (warmth > 50 ? 0.08 : 0.05)})`,
        '--ambient-grad-2': `hsl(${bgHue}, ${bgSat + 10}%, 4%)`
      }
    };
  }

  /**
   * Apply generated theme variables directly to document element
   */
  static applyThemeToDOM(theme) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.cssVariables)) {
      root.style.setProperty(key, value);
    }
  }
}
