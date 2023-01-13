import { CursorTargettingSystem } from "./cursor-targetting-system";
import { PositionAtBorderSystem } from "../components/position-at-border";
import { BoneVisibilitySystem } from "../components/bone-visibility";
import { AnimationMixerSystem } from "../components/animation-mixer";
import { UVScrollSystem } from "../components/uv-scroll";
import { CursorTogglingSystem } from "./cursor-toggling-system";
import { PhysicsSystem } from "./physics-system";
import { ConstraintsSystem } from "./constraints-system";
import { TwoPointStretchingSystem } from "./two-point-stretching-system";
import { SingleActionButtonSystem, HoldableButtonSystem, HoverButtonSystem } from "./button-systems";
import { DrawingMenuSystem } from "./drawing-menu-system";
import { HoverMenuSystem } from "./hover-menu-system";
import { SuperSpawnerSystem } from "./super-spawner-system";
import { HapticFeedbackSystem } from "./haptic-feedback-system";
import { SoundEffectsSystem } from "./sound-effects-system";
import { ScenePreviewCameraSystem } from "./scene-preview-camera-system";
import { InteractionSfxSystem } from "./interaction-sfx-system";
import { CameraSystem } from "./camera-system";
import { CharacterControllerSystem } from "./character-controller-system";
import { waitForShadowDOMContentLoaded } from "../utils/async-utils";
import { CursorPoseTrackingSystem } from "./cursor-pose-tracking";
import { ScaleInScreenSpaceSystem } from "./scale-in-screen-space";
import { AudioSettingsSystem } from "./audio-settings-system";
import { EnterVRButtonSystem } from "./enter-vr-button-system";
import { MediaPresenceSystem } from "./media-presence-system";
import { MediaTextSystem } from "./media-text-system";
import { AudioSystem } from "./audio-system";
import { MediaStreamSystem } from "./media-stream-system";
import { WrappedEntitySystem } from "./wrapped-entity-system";
import { DomSerializeSystem } from "./dom-serialize-system";
import { TerrainSystem } from "./terrain-system";
import { AtmosphereSystem } from "./atmosphere-system";
import { UIAnimationSystem } from "./ui-animation-system";
import { AvatarSystem } from "./avatar-system";
import { SkyBeamSystem } from "./sky-beam-system";
import { HelpersSystem } from "./helpers-system";
import { MediaInteractionSystem } from "./media-interaction-system";
import { CameraRotatorSystem } from "./camera-rotator-system";
import { KeyboardTipSystem } from "./keyboard-tip-system";
import { AutoQualitySystem } from "./auto-quality-system";
import { VoxSystem } from "./vox-system";
import { VoxmojiSystem } from "./voxmoji-system";
import { ProjectileSystem } from "./projectile-system";
import { LauncherSystem } from "./launcher-system";
import { BuilderSystem } from "./builder-system";
import { PasteSystem } from "./paste-system";
import { ExternalCameraSystem } from "./external-camera-system";
import { DirectorSystem } from "./director-system";
import { UndoSystem } from "./undo-system";

AFRAME.registerSystem("hubs-systems", {
  init() {
    waitForShadowDOMContentLoaded().then(() => {
      this.DOMContentDidLoad = true;
    });
    this.cursorTogglingSystem = new CursorTogglingSystem();
    this.interactionSfxSystem = new InteractionSfxSystem();
    this.superSpawnerSystem = new SuperSpawnerSystem();
    this.cursorTargettingSystem = new CursorTargettingSystem(this.el);
    this.positionAtBorderSystem = new PositionAtBorderSystem();
    this.cameraSystem = new CameraSystem(this.el);
    this.autoQualitySystem = new AutoQualitySystem(this.el);
    this.audioSystem = new AudioSystem(this.el, this.autoQualitySystem);
    this.soundEffectsSystem = new SoundEffectsSystem(this.el);
    this.atmosphereSystem = new AtmosphereSystem(this.el, this.soundEffectsSystem);
    this.voxmojiSystem = new VoxmojiSystem(this.el, this.atmosphereSystem);
    this.physicsSystem = new PhysicsSystem(this.el.object3D, this.atmosphereSystem);
    this.voxSystem = new VoxSystem(this.el, this.cursorTargettingSystem, this.physicsSystem, this.cameraSystem);
    this.constraintsSystem = new ConstraintsSystem(this.physicsSystem);
    this.twoPointStretchingSystem = new TwoPointStretchingSystem();
    this.singleActionButtonSystem = new SingleActionButtonSystem();
    this.holdableButtonSystem = new HoldableButtonSystem();
    this.hoverButtonSystem = new HoverButtonSystem();
    this.hoverMenuSystem = new HoverMenuSystem();
    this.hapticFeedbackSystem = new HapticFeedbackSystem();
    this.scenePreviewCameraSystem = new ScenePreviewCameraSystem();
    this.drawingMenuSystem = new DrawingMenuSystem(this.el);
    this.cursorPoseTrackingSystem = new CursorPoseTrackingSystem();
    this.scaleInScreenSpaceSystem = new ScaleInScreenSpaceSystem();
    this.audioSettingsSystem = new AudioSettingsSystem(this.el);
    this.enterVRButtonSystem = new EnterVRButtonSystem(this.el);
    this.mediaInteractionSystem = new MediaInteractionSystem(this.el, this.soundEffectsSystem);
    this.animationMixerSystem = new AnimationMixerSystem();
    this.boneVisibilitySystem = new BoneVisibilitySystem();
    this.uvScrollSystem = new UVScrollSystem();
    this.mediaStreamSystem = new MediaStreamSystem(this.el);
    this.terrainSystem = new TerrainSystem(this.el, this.atmosphereSystem, this.cameraSystem);
    this.skyBeamSystem = new SkyBeamSystem(this.el, this.terrainSystem);
    this.wrappedEntitySystem = new WrappedEntitySystem(
      this.el,
      this.atmosphereSystem,
      this.skyBeamSystem,
      this.terrainSystem
    );
    this.domSerializeSystem = new DomSerializeSystem(this.el);
    this.projectileSystem = new ProjectileSystem(
      this.el,
      this.voxmojiSystem,
      this.physicsSystem,
      this.wrappedEntitySystem,
      this.soundEffectsSystem
    );
    this.builderSystem = new BuilderSystem(
      this.el,
      this.el.systems.userinput,
      this.soundEffectsSystem,
      this.cursorTargettingSystem
    );
    this.characterController = new CharacterControllerSystem(this.el, this.terrainSystem, this.builderSystem);
    this.mediaPresenceSystem = new MediaPresenceSystem(this.el, this.characterController, this.terrainSystem);
    this.mediaTextSystem = new MediaTextSystem(this.el);
    this.uiAnimationSystem = new UIAnimationSystem(this.el, this.atmosphereSystem);
    this.avatarSystem = new AvatarSystem(this.el, this.atmosphereSystem);
    this.cameraRotatorSystem = new CameraRotatorSystem(this.el);
    this.keyboardTipSystem = new KeyboardTipSystem(this.el, this.cameraSystem);
    this.helpersSystem = new HelpersSystem(this.el);
    this.launcherSystem = new LauncherSystem(
      this.el,
      this.projectileSystem,
      this.el.systems.userinput,
      this.characterController,
      this.soundEffectsSystem
    );
    this.pasteSystem = new PasteSystem(this.el);
    this.externalCameraSystem = new ExternalCameraSystem(
      this.el,
      this.atmosphereSystem,
      this.terrainSystem,
      this.cameraSystem,
      this.avatarSystem,
      this.wrappedEntitySystem
    );
    this.directorSystem = new DirectorSystem();
    this.undoSystem = new UndoSystem();

    this.firstTickTime = null;
    this.selfUpdateInterval = null;

    // Some systems should keep running even when the scene is paused.
    setInterval(() => {
      if (this.el.is("off") || !this.el.object3D.isPlaying) {
        this.beginUpdatingSelfAsync();
      }
    }, 1000);

    window.SYSTEMS = this;
  },

  beginUpdatingSelfAsync() {
    if (this.selfUpdateInterval) return;

    let lastTime = performance.now();

    // Update at 60 hz
    this.selfUpdateInterval = setInterval(() => {
      const now = performance.now();
      const dt = now - lastTime;
      const t = now - this.firstTickTime;
      lastTime = now;

      this.domSerializeSystem.tick();
      this.soundEffectsSystem.tick();
      this.mediaTextSystem.tick();
      this.uiAnimationSystem.tick(t, dt);
      this.avatarSystem.tick(t, dt); // For UI animations
      this.keyboardTipSystem.tick();
    }, 1000.0 / 60.0);
  },

  stopUpdatingSelfAsync() {
    if (this.selfUpdateInterval) {
      clearInterval(this.selfUpdateInterval);
      this.selfUpdateInterval = null;
    }
  },

  tick(t, dt) {
    if (this.firstTickTime === null) {
      this.firstTickTime = performance.now();
    }

    if (!this.DOMContentDidLoad) return;
    this.stopUpdatingSelfAsync();

    const systems = AFRAME.scenes[0].systems;
    systems.userinput.tick2();
    systems.interaction.tick2();

    // We run this earlier in the frame so things have a chance to override properties run by animations
    this.animationMixerSystem.tick(dt);

    this.pasteSystem.tick(t);
    this.cameraRotatorSystem.tick();
    this.characterController.tick(t, dt);
    this.wrappedEntitySystem.tick();
    this.domSerializeSystem.tick();
    this.cursorTogglingSystem.tick(systems.interaction, systems.userinput, this.el);
    this.interactionSfxSystem.tick(systems.interaction, systems.userinput, this.soundEffectsSystem);
    this.superSpawnerSystem.tick();
    this.cursorPoseTrackingSystem.tick();
    this.voxSystem.tick(t, dt); // Vox system may generate targetting meshes
    this.cameraSystem.tick(this.el, dt); // May update targets if inspecting
    this.cursorTargettingSystem.tick(t);
    this.positionAtBorderSystem.tick();
    this.scaleInScreenSpaceSystem.tick();
    this.constraintsSystem.tick();
    this.twoPointStretchingSystem.tick();
    this.singleActionButtonSystem.tick();
    this.holdableButtonSystem.tick();
    this.hoverButtonSystem.tick();
    this.drawingMenuSystem.tick();
    this.hoverMenuSystem.tick();
    this.hapticFeedbackSystem.tick(
      this.twoPointStretchingSystem,
      this.singleActionButtonSystem.didInteractLeftThisFrame,
      this.singleActionButtonSystem.didInteractRightThisFrame
    );
    this.soundEffectsSystem.tick();
    this.scenePreviewCameraSystem.tick();
    this.physicsSystem.tick(dt);
    this.enterVRButtonSystem.tick();
    this.uvScrollSystem.tick(dt);
    this.terrainSystem.tick();
    this.atmosphereSystem.tick(dt);
    this.mediaInteractionSystem.tick(t, dt);
    this.mediaPresenceSystem.tick();
    this.mediaTextSystem.tick();
    this.uiAnimationSystem.tick(t, dt);
    this.avatarSystem.tick(t, dt);
    this.skyBeamSystem.tick(t, dt);
    this.voxmojiSystem.tick(t, dt);
    this.projectileSystem.tick(t, dt);
    this.keyboardTipSystem.tick();
    this.autoQualitySystem.tick(t, dt);
    this.helpersSystem.tick(t, dt);
    this.launcherSystem.tick(t, dt);
    this.builderSystem.tick(t, dt);
    this.directorSystem.tick(t, dt);
    this.undoSystem.tick(t, dt);

    // We run this late in the frame so that its the last thing to have an opinion about the scale of an object
    this.boneVisibilitySystem.tick();
  },

  tock(t, dt) {
    this.externalCameraSystem.tock(t, dt);
  },

  remove() {
    this.cursorTargettingSystem.remove();
  }
});
