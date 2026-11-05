package com.dictionaryapp

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.speech.tts.TextToSpeech
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

class PronunciationAudioModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

  private var mediaPlayer: MediaPlayer? = null
  private var tts: TextToSpeech? = null
  private var ttsReady: Boolean = false

  init {
    tts = TextToSpeech(reactContext.applicationContext, this)
  }

  override fun getName(): String = "PronunciationAudio"

  override fun onInit(status: Int) {
    if (status == TextToSpeech.SUCCESS) {
      tts?.language = Locale.US
      ttsReady = true
    }
  }

  private fun speakWithTts(word: String) {
    if (ttsReady && word.isNotBlank()) {
      tts?.speak(word, TextToSpeech.QUEUE_FLUSH, null, "dict_word_${System.currentTimeMillis()}")
    }
  }

  @ReactMethod
  fun play(word: String, audioUrl: String?, promise: Promise) {
    try {
      stopInternal()

      val hasMp3 = !audioUrl.isNullOrBlank() &&
        (audioUrl.endsWith(".mp3") || audioUrl.contains("dictionaryapi.dev/media"))

      if (hasMp3 && audioUrl != null) {
        val player = MediaPlayer()
        mediaPlayer = player
        player.setAudioAttributes(
          AudioAttributes.Builder()
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .build()
        )
        player.setDataSource(audioUrl)
        player.setOnPreparedListener { it.start() }
        player.setOnErrorListener { _, _, _ ->
          speakWithTts(word)
          true
        }
        player.prepareAsync()
        promise.resolve(true)
        return
      }

      speakWithTts(word)
      promise.resolve(true)
    } catch (e: Exception) {
      speakWithTts(word)
      promise.resolve(true)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    stopInternal()
    promise.resolve(true)
  }

  private fun stopInternal() {
    try {
      mediaPlayer?.let {
        if (it.isPlaying) {
          it.stop()
        }
        it.release()
      }
    } catch (_: Exception) {
    } finally {
      mediaPlayer = null
    }
    try {
      tts?.stop()
    } catch (_: Exception) {
    }
  }
}
