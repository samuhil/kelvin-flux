/**
 * KelvinFlux Ambient Particle & Atmosphere Engine
 * Generates an interactive visual atmosphere adapting seamlessly between:
 * - Ultra Warm: Rising thermal embers, flickering firefly sparks, cozy radiant heat shimmer
 * - Studio Neutral: Gentle floating luminous dust particles
 * - Ultra Cool: Descending crystalline snowflakes, aurora filaments, glacial ice sparkles
 */

export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 120;
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    // Atmospheric parameters
    this.kelvin = 6500;
    this.warmth = 50; // 0 to 100
    this.rgb = { r: 255, g: 255, b: 255 };

    // Mouse interactivity
    this.mouse = { x: -1000, y: -1000, active: false };

    // Animation frame
    this.animId = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });

    // Populate initial particles
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticle(randomY = false) {
    const isWarm = this.warmth > 50;
    const size = Math.random() * 3.5 + 1.2;

    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : (isWarm ? this.height + 20 : -20),
      size: size,
      baseSize: size,
      // Warm floats up; Cool falls down like snow/ice
      vx: (Math.random() - 0.5) * 1.2,
      vy: isWarm ? -(Math.random() * 1.5 + 0.6) : (Math.random() * 1.5 + 0.5),
      alpha: Math.random() * 0.7 + 0.3,
      flickerSpeed: Math.random() * 0.05 + 0.02,
      flickerPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      points: Math.random() > 0.6 ? 6 : 4 // For cool snowflakes
    };
  }

  setTemperature(kelvin, rgb, warmth) {
    this.kelvin = kelvin;
    this.rgb = rgb;
    this.warmth = warmth;

    // Adjust particle velocities based on temperature
    const isWarm = this.warmth > 50;
    this.particles.forEach(p => {
      if (isWarm) {
        if (p.vy > 0) p.vy = -Math.abs(p.vy); // Float upwards
      } else {
        if (p.vy < 0) p.vy = Math.abs(p.vy); // Drift downwards
      }
    });
  }

  update() {
    const isWarm = this.warmth > 50;
    const warmthRatio = this.warmth / 100; // 1 = ultra warm, 0 = ultra cool

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Oscillating lateral drift
      p.flickerPhase += p.flickerSpeed;
      p.x += p.vx + Math.sin(p.flickerPhase) * 0.4;
      p.y += p.vy;
      p.rotation += p.spin;

      // Mouse interaction (repel gently)
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 3;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Recycle particles outside viewport
      if (isWarm && p.y < -30) {
        this.particles[i] = this.createParticle(false);
      } else if (!isWarm && p.y > this.height + 30) {
        this.particles[i] = this.createParticle(false);
      }

      if (p.x < -30) p.x = this.width + 20;
      if (p.x > this.width + 30) p.x = -20;
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isWarm = this.warmth > 50;
    const { r, g, b } = this.rgb;

    for (const p of this.particles) {
      const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.flickerPhase) * 0.25);

      if (isWarm) {
        // Render glowing ember / fire spark
        const glowRadius = p.size * 3.5;
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha})`);
        grad.addColorStop(0.4, `rgba(${r}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 50)}, ${currentAlpha * 0.5})`);
        grad.addColorStop(1, `rgba(${r}, 0, 0, 0)`);

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Hot solid core
        this.ctx.fillStyle = `rgba(255, 255, 230, ${currentAlpha * 0.9})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Render crystalline ice snowflake / frost spark
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);

        // Soft outer frost halo
        const glowRadius = p.size * 2.8;
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.8})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, 255, 0)`);

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Crystalline cross/star
        this.ctx.strokeStyle = `rgba(240, 250, 255, ${currentAlpha})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        const rays = p.points;
        for (let j = 0; j < rays; j++) {
          const angle = (j * Math.PI * 2) / rays;
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(Math.cos(angle) * (p.size * 1.8), Math.sin(angle) * (p.size * 1.8));
        }
        this.ctx.stroke();

        this.ctx.restore();
      }
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
