#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridgeModule.h>

@interface RCTPronunciationAudio : NSObject <RCTBridgeModule>
@property (nonatomic, strong) AVPlayer *audioPlayer;
@property (nonatomic, strong) AVSpeechSynthesizer *synthesizer;
@end

@implementation RCTPronunciationAudio

RCT_EXPORT_MODULE(PronunciationAudio);

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (instancetype)init
{
  if (self = [super init]) {
    _synthesizer = [[AVSpeechSynthesizer alloc] init];
  }
  return self;
}

- (void)configureAudioSession
{
  NSError *sessionError = nil;
  AVAudioSession *session = [AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryPlayback
                  mode:AVAudioSessionModeDefault
               options:AVAudioSessionCategoryOptionDuckOthers
                 error:&sessionError];
  [session setActive:YES error:&sessionError];
}

- (void)speakWithTTS:(NSString *)word
{
  if (!word || word.length == 0) {
    return;
  }
  [self configureAudioSession];
  if ([self.synthesizer isSpeaking]) {
    [self.synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
  }

  AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:word];
  AVSpeechSynthesisVoice *voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
  if (!voice) {
    voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-GB"];
  }
  utterance.voice = voice;
  utterance.rate = 0.46f;
  utterance.pitchMultiplier = 1.0f;
  utterance.volume = 1.0f;

  [self.synthesizer speakUtterance:utterance];
}

RCT_EXPORT_METHOD(play:(NSString *)word
                  audioUrl:(NSString *)audioUrl
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self configureAudioSession];

    if (self.audioPlayer) {
      [self.audioPlayer pause];
      self.audioPlayer = nil;
    }
    if ([self.synthesizer isSpeaking]) {
      [self.synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }

    BOOL hasDirectMp3 = (audioUrl != nil &&
                         audioUrl.length > 0 &&
                         ([audioUrl hasSuffix:@".mp3"] || [audioUrl containsString:@"dictionaryapi.dev/media"]));

    if (hasDirectMp3) {
      NSURL *url = [NSURL URLWithString:audioUrl];
      if (url) {
        AVPlayerItem *item = [AVPlayerItem playerItemWithURL:url];
        self.audioPlayer = [AVPlayer playerWithPlayerItem:item];
        self.audioPlayer.volume = 1.0f;
        [self.audioPlayer play];

        // Fallback to native TTS if remote MP3 fails to load
        NSString *wordCopy = [word copy];
        __weak typeof(self) weakSelf = self;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
          __strong typeof(weakSelf) strongSelf = weakSelf;
          if (!strongSelf || strongSelf.audioPlayer.currentItem != item) {
            return;
          }
          if (item.status == AVPlayerItemStatusFailed || item.error != nil) {
            [strongSelf speakWithTTS:wordCopy];
          }
        });

        resolve(@(YES));
        return;
      }
    }

    [self speakWithTTS:word];
    resolve(@(YES));
  });
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self.audioPlayer) {
      [self.audioPlayer pause];
      self.audioPlayer = nil;
    }
    if ([self.synthesizer isSpeaking]) {
      [self.synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
    resolve(@(YES));
  });
}

@end
