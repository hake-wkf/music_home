/**
 * Web Audio API 仿真音频合成器
 * 模拟硬件解码芯片输出的真实背景音乐音效（柔和的环境和弦与声学反馈）
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.5; // 0.0 - 1.0
  private isMuted: boolean = false;
  private baseFrequency: number = 440;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.currentVolume * 0.15;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volPercent: number) {
    this.currentVolume = Math.max(0, Math.min(100, volPercent)) / 100;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume * 0.15;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.currentVolume * 0.15;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playTrack(frequency: number = 440, bpm: number = 90) {
    this.initContext();
    this.stop();
    this.isPlaying = true;
    this.baseFrequency = frequency;

    // 播放和弦音阶步进 (Pentatonic intervals)
    const scaleMultipliers = [1, 1.125, 1.25, 1.5, 1.667, 2];
    let noteIndex = 0;
    const intervalMs = Math.max(300, Math.floor((60 / bpm) * 1000));

    // 触发起始提示音
    this.playTone(this.baseFrequency, 0.25, 'sine');

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      const mult = scaleMultipliers[noteIndex % scaleMultipliers.length];
      const freq = this.baseFrequency * mult;
      this.playTone(freq, 0.35, 'triangle');
      noteIndex++;
    }, intervalMs);
  }

  public pause() {
    this.stop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // 播放硬件按键反馈音 (Beep)
  public playClickBeep(freq: number = 880) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // 忽略音频权限错误
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // 容错
    }
  }
}

export const audioSynth = new AudioSynthesizer();
