import confetti from 'canvas-confetti';

export function triggerTaskConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { x: originX, y: originY },
    colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
    ticks: 200,
    gravity: 1.2,
    scalar: 0.9,
  });
}

export function triggerMegaCelebration() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
