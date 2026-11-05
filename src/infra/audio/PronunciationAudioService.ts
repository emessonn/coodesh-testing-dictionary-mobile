import { NativeModules } from 'react-native';
import {
  AudioPlaybackState,
  AudioStateListener,
  IAudioService,
} from '../../domain/repositories/IAudioService';

const TTS_FALLBACK_URL = 'https://code.responsivevoice.org/getvoice.php';

interface NativePronunciationAudioModule {
  play(word: string, audioUrl?: string): Promise<boolean>;
  stop(): Promise<boolean>;
}

function getNativeAudioModule(): NativePronunciationAudioModule | undefined {
  return NativeModules?.PronunciationAudio as
    | NativePronunciationAudioModule
    | undefined;
}

export class PronunciationAudioService implements IAudioService {
  private state: AudioPlaybackState = {
    isPlaying: false,
    progress: 0,
    durationMs: 1600,
    currentTimeMs: 0,
  };

  private listeners = new Set<AudioStateListener>();
  private intervalRef: ReturnType<typeof setInterval> | null = null;

  getBestAudioUrl(word: string, phoneticsAudioUrls: string[]): string {
    const apiAudio = phoneticsAudioUrls.find(
      url => typeof url === 'string' && url.trim().length > 0,
    );

    if (apiAudio) {
      return apiAudio.startsWith('//') ? `https:${apiAudio}` : apiAudio;
    }

    const term = encodeURIComponent(word.trim().toLowerCase());
    return `${TTS_FALLBACK_URL}?t=${term}&tl=en-US&sv=g1&vn=&pitch=0.5&rate=0.5&vol=1`;
  }

  async playWordAudio(word: string, audioUrl?: string): Promise<void> {
    await this.stop();

    const targetUrl =
      audioUrl && audioUrl.trim().length > 0
        ? audioUrl
        : this.getBestAudioUrl(word, []);

    const durationMs = Math.min(2200, Math.max(1100, word.length * 190));
    const tickMs = 50;

    this.emit({
      isPlaying: true,
      progress: 0,
      durationMs,
      currentTimeMs: 0,
      sourceUrl: targetUrl,
      error: undefined,
    });

    const nativeAudio = getNativeAudioModule();
    if (nativeAudio?.play) {
      nativeAudio.play(word, targetUrl).catch(() => {});
    }

    this.intervalRef = setInterval(() => {
      const elapsed = this.state.currentTimeMs + tickMs;
      if (elapsed >= durationMs) {
        this.clearTimer();
        this.emit({
          ...this.state,
          isPlaying: false,
          progress: 1,
          currentTimeMs: durationMs,
        });
      } else {
        this.emit({
          ...this.state,
          isPlaying: true,
          currentTimeMs: elapsed,
          progress: Math.min(1, elapsed / durationMs),
        });
      }
    }, tickMs);
  }

  async stop(): Promise<void> {
    this.clearTimer();
    const nativeAudio = getNativeAudioModule();
    if (nativeAudio?.stop) {
      nativeAudio.stop().catch(() => {});
    }
    this.emit({
      ...this.state,
      isPlaying: false,
      progress: 0,
      currentTimeMs: 0,
    });
  }

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private clearTimer(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private emit(nextState: AudioPlaybackState): void {
    this.state = nextState;
    this.listeners.forEach(fn => fn(this.state));
  }
}
