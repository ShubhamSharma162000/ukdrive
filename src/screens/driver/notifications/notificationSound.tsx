import { useEffect, useRef } from 'react';
import { AppState, Vibration } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let sharedSound: Sound | null = null;
let isLoaded = false;
let isPlaying = false;

export function useRideNotificationSound() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log('🔊 [AUDIO INIT] Loading sound');

    sharedSound = new Sound('ride_alert.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('❌ Sound load failed:', error);
        return;
      }

      isLoaded = true;
      sharedSound?.setNumberOfLoops(-1);
      sharedSound?.setVolume(1);
      console.log('✅ Sound ready');
    });

    // ✅ Stop sound when app goes background
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, []);

  const play = () => {
    if (!sharedSound || !isLoaded || isPlaying) return;

    isPlaying = true;

    // ✅ Strong vibration pattern (emergency-grade)
    Vibration.vibrate([0, 500, 200, 500]);

    sharedSound.play(success => {
      if (!success) console.error('❌ Playback failed');
    });
  };

  const stop = () => {
    if (!sharedSound) return;

    sharedSound.stop();
    Vibration.cancel();
    isPlaying = false;
  };

  return { play, stop };
}
