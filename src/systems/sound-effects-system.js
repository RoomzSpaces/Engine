import { parseUrlAndCheckRelative } from "../utils/url-utils";
import { setMatrixWorld } from "../utils/three-utils";
import { preflightUrl } from "../utils/media-utils";

import URL_TICK from "!!url-loader!../assets/sfx/click.wav";
import URL_TICK_DOWN from "!!url-loader!../assets/sfx/click-down.wav";
import URL_TICK_ALT from "!!url-loader!../assets/sfx/click-alt.wav";
import URL_TOGGLE_TICK from "!!url-loader!../assets/sfx/tick.mp3";
import URL_QUICK_TURN from "!!url-loader!../assets/sfx/quick-turn.mp3";
import URL_TAP_MELLOW from "!!url-loader!../assets/sfx/tap-mellow.mp3";
import URL_PEN_SPAWN from "!!url-loader!../assets/sfx/pen-spawn.mp3";
import URL_PEN_DRAW from "!!url-loader!../assets/sfx/pen-draw.mp3";
import URL_CAMERA_SNAPSHOT from "!!url-loader!../assets/sfx/photo-snap.mp3";
import URL_WELCOME from "!!url-loader!../assets/sfx/welcome.mp3";
import URL_QUACK from "!!url-loader!../assets/sfx/quack.mp3";
import URL_SPECIAL_QUACK from "!!url-loader!../assets/sfx/special-quack.mp3";
import URL_POP from "!!url-loader!../assets/sfx/pop.mp3";
import URL_FREEZE from "!!url-loader!../assets/sfx/freeze.mp3";
import URL_TACK from "!!url-loader!../assets/sfx/tack.mp3";
import URL_QUIET_POP from "!!url-loader!../assets/sfx/quiet-pop.mp3";
import URL_PARTICLES from "!!url-loader!../assets/sfx/particles.mp3";
import URL_VACUUM from "!!url-loader!../assets/sfx/vacuum.mp3";
import URL_SPAWN_EMOJI from "!!url-loader!../assets/sfx/emoji.mp3";
import URL_LAUNCHER_1 from "!!url-loader!../assets/sfx/launcher1.mp3";
import URL_LAUNCHER_2 from "!!url-loader!../assets/sfx/launcher2.mp3";
import URL_LAUNCHER_3 from "!!url-loader!../assets/sfx/launcher3.mp3";
import URL_LAUNCHER_4 from "!!url-loader!../assets/sfx/launcher4.mp3";
import URL_LAUNCHER_5 from "!!url-loader!../assets/sfx/launcher5.mp3";
import URL_LAUNCHER_BIG from "!!url-loader!../assets/sfx/launcher-big.mp3";
import URL_FART_1 from "!!url-loader!../assets/sfx/fart1.mp3";
import URL_FART_2 from "!!url-loader!../assets/sfx/fart2.mp3";
import URL_FART_3 from "!!url-loader!../assets/sfx/fart3.mp3";
import URL_FART_4 from "!!url-loader!../assets/sfx/fart4.mp3";
import URL_FART_5 from "!!url-loader!../assets/sfx/fart5.mp3";
import URL_FART_BIG from "!!url-loader!../assets/sfx/fart-big.mp3";

let soundEnum = 0;
export const SOUND_HOVER_OR_GRAB = soundEnum++;
export const SOUND_RELEASE = soundEnum++;
export const SOUND_THAW = soundEnum++;
export const SOUND_PEN_STOP_DRAW = soundEnum++;
export const SOUND_PEN_UNDO_DRAW = soundEnum++;
export const SOUND_PEN_CHANGE_COLOR = soundEnum++;
export const SOUND_TOGGLE_MIC = soundEnum++;
export const SOUND_TELEPORT_START = soundEnum++;
export const SOUND_TELEPORT_END = soundEnum++;
export const SOUND_WAYPOINT_START = soundEnum++;
export const SOUND_WAYPOINT_END = soundEnum++;
export const SOUND_SNAP_ROTATE = soundEnum++;
export const SOUND_SPAWN_PEN = soundEnum++;
export const SOUND_PEN_START_DRAW = soundEnum++;
export const SOUND_CAMERA_TOOL_TOOK_SNAPSHOT = soundEnum++;
export const SOUND_ENTER_SCENE = soundEnum++;
export const SOUND_QUACK = soundEnum++;
export const SOUND_SPECIAL_QUACK = soundEnum++;
export const SOUND_CHAT_MESSAGE = soundEnum++;
export const SOUND_FREEZE = soundEnum++;
export const SOUND_PIN = soundEnum++;
export const SOUND_MEDIA_LOADING = soundEnum++;
export const SOUND_MEDIA_LOADED = soundEnum++;
export const SOUND_MEDIA_REMOVED = soundEnum++;
export const SOUND_CAMERA_TOOL_COUNTDOWN = soundEnum++;
export const SOUND_PREFERENCE_MENU_HOVER = soundEnum++;
export const SOUND_SPAWN_EMOJI = soundEnum++;
export const SOUND_LAUNCHER_1 = soundEnum++;
export const SOUND_LAUNCHER_2 = soundEnum++;
export const SOUND_LAUNCHER_3 = soundEnum++;
export const SOUND_LAUNCHER_4 = soundEnum++;
export const SOUND_LAUNCHER_5 = soundEnum++;
export const SOUND_LAUNCHER_BIG = soundEnum++;
export const SOUND_FART_1 = soundEnum++;
export const SOUND_FART_2 = soundEnum++;
export const SOUND_FART_3 = soundEnum++;
export const SOUND_FART_4 = soundEnum++;
export const SOUND_FART_5 = soundEnum++;
export const SOUND_FART_BIG = soundEnum++;
export const SOUND_EMOJI_BURST = soundEnum++;
export const SOUND_EMOJI_EQUIP = soundEnum++;
export const SOUND_NOTIFICATION = soundEnum++;
export const SOUND_LOCK = soundEnum++;
export const SOUND_UNLOCK = soundEnum++;
export const SOUND_AMBIENCE = soundEnum++;

// Safari doesn't support the promise form of decodeAudioData, so we polyfill it.
function decodeAudioData(audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

async function fetchAudioFromUrl(url, audioContext) {
  const [, isRelativeUrl] = parseUrlAndCheckRelative(url);
  let accessibleContentUrl;

  if (url.startsWith("data:")) {
    accessibleContentUrl = url;
  } else {
    if (isRelativeUrl) {
      accessibleContentUrl = await window.APP.atomAccessManager.contentUrlForRelativePath(decodeURIComponent(url));
    } else {
      const preflightResponse = await preflightUrl(url);
      accessibleContentUrl = preflightResponse.accessibleContentUrl;
    }
  }

  const response = await fetch(accessibleContentUrl);
  const arrayBuffer = await response.arrayBuffer();
  return await decodeAudioData(audioContext, arrayBuffer);
}

export class SoundEffectsSystem {
  constructor(scene) {
    this.pendingAudioSourceNodes = [];
    this.pendingAudioStartTimes = [];
    this.pendingPositionalAudios = [];

    this.monoSourceFinalizers = [];
    this.positionalSourceFinalizers = [];

    this.positionalAudiosStationary = [];
    this.positionalAudiosFollowingObject3Ds = [];

    this.audioContext = THREE.AudioContext.getContext();
    this.scene = scene;

    this.sounds = new Map();

    this.isDisabled = window.APP.store.state.preferences.disableSoundEffects;
    window.APP.store.addEventListener("statechanged", () => {
      const shouldBeDisabled = window.APP.store.state.preferences.disableSoundEffects;
      if (shouldBeDisabled && !this.isDisabled) {
        this.stopAllPositionalAudios();
        // TODO: Technically we should stop any other sounds that have been started,
        // but we do not hold references to these and they're short-lived so I didn't bother.
      }
      this.isDisabled = shouldBeDisabled;
    });

    this.lastPlayTime = performance.now();

    setInterval(() => {
      // If the app is backgrounded, the tick() method will stop being called
      // and so we should run it manually so sounds continue to play.
      if (performance.now() - this.lastPlayTime > 200.0) {
        this.playPendingSounds();
      }
    }, 250);

    this.scene.addEventListener(
      "didConnectToNetworkedScene",
      () => {
        const soundsAndUrls = [
          [SOUND_HOVER_OR_GRAB, URL_TICK],
          [SOUND_RELEASE, URL_TICK_DOWN],
          [SOUND_THAW, URL_TICK],
          [SOUND_PEN_STOP_DRAW, URL_TICK],
          [SOUND_PEN_UNDO_DRAW, URL_TICK],
          [SOUND_PEN_CHANGE_COLOR, URL_TICK],
          [SOUND_TOGGLE_MIC, URL_TOGGLE_TICK],
          [SOUND_CAMERA_TOOL_COUNTDOWN, URL_TICK],
          [SOUND_TELEPORT_END, URL_QUICK_TURN],
          [SOUND_WAYPOINT_START, URL_QUICK_TURN],
          [SOUND_WAYPOINT_END, URL_TICK],
          [SOUND_SNAP_ROTATE, URL_TAP_MELLOW],
          [SOUND_SPAWN_PEN, URL_PEN_SPAWN],
          [SOUND_PEN_START_DRAW, URL_PEN_DRAW],
          [SOUND_CAMERA_TOOL_TOOK_SNAPSHOT, URL_CAMERA_SNAPSHOT],
          [SOUND_ENTER_SCENE, URL_WELCOME],
          [SOUND_QUACK, URL_QUACK],
          [SOUND_SPECIAL_QUACK, URL_SPECIAL_QUACK],
          [SOUND_CHAT_MESSAGE, URL_POP],
          [SOUND_FREEZE, URL_FREEZE],
          [SOUND_PIN, URL_TACK],
          [SOUND_MEDIA_LOADING, URL_PARTICLES],
          [SOUND_MEDIA_LOADED, URL_QUIET_POP],
          [SOUND_MEDIA_REMOVED, URL_VACUUM],
          [SOUND_PREFERENCE_MENU_HOVER, URL_FREEZE],
          [SOUND_SPAWN_EMOJI, URL_SPAWN_EMOJI],
          [SOUND_LAUNCHER_1, URL_LAUNCHER_1],
          [SOUND_LAUNCHER_2, URL_LAUNCHER_2],
          [SOUND_LAUNCHER_3, URL_LAUNCHER_3],
          [SOUND_LAUNCHER_4, URL_LAUNCHER_4],
          [SOUND_LAUNCHER_5, URL_LAUNCHER_5],
          [SOUND_LAUNCHER_BIG, URL_LAUNCHER_BIG],
          [SOUND_FART_1, URL_FART_1],
          [SOUND_FART_2, URL_FART_2],
          [SOUND_FART_3, URL_FART_3],
          [SOUND_FART_4, URL_FART_4],
          [SOUND_FART_5, URL_FART_5],
          [SOUND_FART_BIG, URL_FART_BIG],
          [SOUND_EMOJI_BURST, URL_QUIET_POP],
          [SOUND_EMOJI_EQUIP, URL_TICK_ALT],
          [SOUND_NOTIFICATION, URL_QUIET_POP],
          [SOUND_LOCK, URL_TACK],
          [SOUND_UNLOCK, URL_TICK_ALT]
        ];

        // Fetch the ambient audio URL from the meta tags
        const ambientAudioUrl = document
          .querySelector("meta[name='webspace.environment.ambience']")
          ?.getAttribute("content");

        if (ambientAudioUrl) {
          soundsAndUrls.push([SOUND_AMBIENCE, ambientAudioUrl]);
        }
        const loading = new Map();
        const load = url => {
          let audioBufferPromise = loading.get(url);

          if (!audioBufferPromise) {
            audioBufferPromise = fetchAudioFromUrl(url, this.audioContext);
            loading.set(url, audioBufferPromise);
          }

          return audioBufferPromise;
        };

        soundsAndUrls.map(([sound, url]) => {
          load(url)
            .then(audioBuffer => {
              this.sounds.set(sound, audioBuffer);
            })
            .catch(e => {
              console.warn("Error loading sound", e);
            });
        });
      },
      { once: true }
    );
  }

  hasLoadedSound(sound) {
    return this.sounds.has(sound);
  }

  getSoundDuration(sound) {
    return this.sounds.get(sound).duration;
  }

  enqueueSound(sound, loop, startAt = 0) {
    if (this.isDisabled) return null;
    const audioBuffer = this.sounds.get(sound);
    if (!audioBuffer) return null;
    // The nodes are very inexpensive to create, according to
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.loop = loop;
    this.pendingAudioSourceNodes.push(source);
    this.pendingAudioStartTimes.push(startAt);

    this.monoSourceFinalizers.push(() => {
      if (!loop) {
        source.disconnect();
      }
    });

    return source;
  }

  enqueuePositionalSound(sound, loop) {
    if (this.isDisabled) return null;
    const audioBuffer = this.sounds.get(sound);
    if (!audioBuffer) return null;

    const disablePositionalAudio = window.APP.store.state.preferences.audioOutputMode === "audio";
    const positionalAudio = disablePositionalAudio
      ? new THREE.Audio(this.scene.audioListener)
      : new THREE.PositionalAudio(this.scene.audioListener);
    positionalAudio.setBuffer(audioBuffer);
    positionalAudio.loop = loop;
    this.pendingPositionalAudios.push(positionalAudio);

    this.positionalSourceFinalizers.push(() => {
      if (!loop) {
        positionalAudio.disconnect();
      }
    });

    return positionalAudio;
  }

  playPositionalSoundAt(sound, position, loop) {
    const positionalAudio = this.enqueuePositionalSound(sound, loop);
    if (!positionalAudio) return null;
    positionalAudio.position.copy(position);
    positionalAudio.matrixWorldNeedsUpdate = true;
    this.positionalAudiosStationary.push(positionalAudio);
  }

  playPositionalSoundFollowing(sound, object3D, loop) {
    const positionalAudio = this.enqueuePositionalSound(sound, loop);
    if (!positionalAudio) return null;
    this.positionalAudiosFollowingObject3Ds.push({ positionalAudio, object3D });
    return positionalAudio;
  }

  playSoundOneShot(sound) {
    return this.enqueueSound(sound, false);
  }

  playSoundLooped(sound) {
    return this.enqueueSound(sound, true);
  }

  playSoundLoopedWithGain(sound, startAt = 0) {
    if (this.isDisabled) return null;
    const audioBuffer = this.sounds.get(sound);
    if (!audioBuffer) return null;

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = audioBuffer;
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.loop = true;
    this.pendingAudioSourceNodes.push(source);
    this.pendingAudioStartTimes.push(startAt);

    // NOTE if you use this, disconnect() will not be called automaticlaly
    // for you because the source node is not connected to the destination
    this.monoSourceFinalizers.push(() => {});

    return { gain, source };
  }

  stopSoundNode(node) {
    const index = this.pendingAudioSourceNodes.indexOf(node);
    if (index !== -1) {
      this.monoSourceFinalizers[index]();
      this.pendingAudioSourceNodes.splice(index, 1);
      this.pendingAudioStartTimes.splice(index, 1);
      this.monoSourceFinalizers.splice(index, 1);
    } else {
      node.stop();
      node.disconnect();
    }
  }

  stopPositionalAudio(inPositionalAudio) {
    const pendingIndex = this.pendingPositionalAudios.indexOf(inPositionalAudio);
    if (pendingIndex !== -1) {
      this.positionalSourceFinalizers[pendingIndex]();
      this.pendingPositionalAudios.splice(pendingIndex, 1);
      this.positionalSourceFinalizers.splice(pendingIndex, 1);
    } else {
      if (inPositionalAudio.isPlaying) {
        inPositionalAudio.stop();
      }

      if (inPositionalAudio.parent) {
        inPositionalAudio.removeFromParent();
      }
    }
    this.positionalAudiosStationary = this.positionalAudiosStationary.filter(
      positionalAudio => positionalAudio !== inPositionalAudio
    );
    this.positionalAudiosFollowingObject3Ds = this.positionalAudiosFollowingObject3Ds.filter(
      ({ positionalAudio }) => positionalAudio !== inPositionalAudio
    );
  }

  stopAllPositionalAudios() {
    for (let i = this.positionalAudiosStationary.length - 1; i >= 0; i--) {
      const positionalAudio = this.positionalAudiosStationary[i];
      this.stopPositionalAudio(positionalAudio);
    }

    for (let i = this.positionalAudiosFollowingObject3Ds.length - 1; i >= 0; i--) {
      const positionalAudioAndObject3D = this.positionalAudiosFollowingObject3Ds[i];
      const positionalAudio = positionalAudioAndObject3D.positionalAudio;
      this.stopPositionalAudio(positionalAudio);
    }
  }

  tick() {
    this.playPendingSounds();
  }

  playPendingSounds() {
    this.lastPlayTime = performance.now();

    if (this.isDisabled) {
      return;
    }

    for (let i = 0; i < this.pendingAudioSourceNodes.length; i++) {
      const sourceNode = this.pendingAudioSourceNodes[i];
      sourceNode.start(0, this.pendingAudioStartTimes[i]);

      // Finalizers run after the first playthrough, will remove wiring to destination for non-looped audio.
      const finalizer = this.monoSourceFinalizers[i];
      setTimeout(finalizer, sourceNode.buffer.duration * 1000.0 + 1000.0);
    }

    this.pendingAudioSourceNodes.length = 0;
    this.pendingAudioStartTimes.length = 0;
    this.monoSourceFinalizers.length = 0;

    for (let i = 0; i < this.pendingPositionalAudios.length; i++) {
      const pendingPositionalAudio = this.pendingPositionalAudios[i];
      this.scene.object3D.add(pendingPositionalAudio);
      pendingPositionalAudio.play();

      // Finalizers run after the first playthrough, will remove wiring to destination for non-looped audio.
      const finalizer = this.positionalSourceFinalizers[i];
      setTimeout(finalizer, pendingPositionalAudio.buffer.duration * 1000.0 + 1000.0);
    }

    this.pendingPositionalAudios.length = 0;
    this.positionalSourceFinalizers.length = 0;

    for (let i = this.positionalAudiosStationary.length - 1; i >= 0; i--) {
      const positionalAudio = this.positionalAudiosStationary[i];
      if (!positionalAudio.isPlaying) {
        this.stopPositionalAudio(positionalAudio);
      }
    }

    for (let i = this.positionalAudiosFollowingObject3Ds.length - 1; i >= 0; i--) {
      const positionalAudioAndObject3D = this.positionalAudiosFollowingObject3Ds[i];
      const positionalAudio = positionalAudioAndObject3D.positionalAudio;
      const object3D = positionalAudioAndObject3D.object3D;
      if (!positionalAudio.isPlaying || !object3D.parent) {
        this.stopPositionalAudio(positionalAudio);
      } else {
        object3D.updateMatrices();
        setMatrixWorld(positionalAudio, object3D.matrixWorld);
      }
    }
  }
}
