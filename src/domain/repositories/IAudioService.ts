export interface AudioPlaybackState {
  isPlaying: boolean;
  progress: number;
  durationMs: number;
  currentTimeMs: number;
  sourceUrl?: string;
  error?: string;
}

export type AudioStateListener = (state: AudioPlaybackState) => void;

export interface IAudioService {
  playWordAudio(word: string, audioUrl?: string): Promise<void>;
  stop(): Promise<void>;
  subscribe(listener: AudioStateListener): () => void;
  getBestAudioUrl(word: string, phoneticsAudioUrls: string[]): string;
}
