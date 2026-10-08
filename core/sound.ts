// The click of a wooden bead, synthesised on the fly: no audio files to download, works offline.
// Muted when the user turns sounds off in settings.

let context: AudioContext | null = null;
let enabled = true;

export const setSoundEnabled = (on: boolean) => { enabled = on; };

export const playBeadClick = () => {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    // A short burst of noise through a resonant filter: a dry "tock"
    const length = Math.floor(context.sampleRate * 0.03);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 400;
    filter.Q.value = 6;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
  } catch {
    /* no audio available: stay silent */
  }
};

// A short soft beep, marking each number in Flash Anzan
export const playBeep = () => {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    /* no audio available */
  }
};
