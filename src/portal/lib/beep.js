let ctx;

// Audible scan feedback so the operator doesn't need to look at the screen.
export function beep(ok = true) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = ok ? "sine" : "square";
    osc.frequency.value = ok ? 880 : 200;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.08 : 0.35));
  } catch {
    // Audio blocked or unsupported: the on-screen message still shows the result.
  }
}
