import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ProgressBar, Surface } from 'react-native-paper';
import { DI_TOKENS } from '../../di/container';
import { AudioPlaybackState } from '../../domain/repositories/IAudioService';
import { useContainer } from '../context/ServiceContext';
import { theme } from '../theme/theme';

interface AudioPlayerBarProps {
  word: string;
  phoneticsAudioUrls: string[];
}

export function AudioPlayerBar({
  word,
  phoneticsAudioUrls,
}: AudioPlayerBarProps) {
  const container = useContainer();
  const audioService = useMemo(
    () => container.resolve(DI_TOKENS.AudioService),
    [container],
  );

  const [playback, setPlayback] = useState<AudioPlaybackState>({
    isPlaying: false,
    progress: 0,
    durationMs: 1600,
    currentTimeMs: 0,
  });

  useEffect(() => {
    return audioService.subscribe(setPlayback);
  }, [audioService]);

  const audioUrl = useMemo(
    () => audioService.getBestAudioUrl(word, phoneticsAudioUrls),
    [audioService, word, phoneticsAudioUrls],
  );

  const handlePress = async () => {
    if (playback.isPlaying) {
      await audioService.stop();
    } else {
      await audioService.playWordAudio(word, audioUrl);
    }
  };

  const progressValue =
    playback.progress > 0
      ? Math.min(1, Math.max(0, playback.progress))
      : 0.72;

  return (
    <Surface style={styles.container} elevation={1}>
      <TouchableOpacity
        testID="audio-play-button"
        accessibilityRole="button"
        activeOpacity={0.7}
        style={styles.playButton}
        onPress={handlePress}>
        <View style={styles.iconContainer}>
          {playback.isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.triangleOuter}>
              <View style={styles.triangleInner} />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.trackContainer} testID="audio-progress-fill">
        <ProgressBar
          progress={progressValue}
          color={theme.colors.progressFill}
          style={styles.progressBar}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.colors.primaryLight,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangleOuter: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.primary,
  },
  triangleInner: {
    position: 'absolute',
    left: -14,
    top: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.primaryLight,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 14,
    height: 18,
  },
  pauseBar: {
    width: 4.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  trackContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.progressTrack,
  },
});
