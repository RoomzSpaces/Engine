import { paths } from "../paths";
import { ArrayBackedSet } from "../array-backed-set";
import { isInEditableField, CURSOR_LOCK_STATES, getCursorLockState } from "../../../utils/dom-utils";
import { isInQuillEditor } from "../../../utils/quill-utils";
import { isLockedMedia } from "../../../utils/media-utils";
import { BRUSH_TYPES, BRUSH_MODES } from "../../../constants";

export class KeyboardDevice {
  constructor() {
    this.seenKeys = new ArrayBackedSet();
    this.seenCodes = new ArrayBackedSet();
    this.keys = new Map();
    this.codes = new Map();
    this.events = [];

    ["keydown", "keyup"].forEach(x =>
      // React handles events at UI dom node, so capture there
      // Otherwise capture at root
      [document, UI].forEach(dom => {
        dom.addEventListener(x, e => {
          if (!e.key) return;
          let pushEvent = true;
          if (!AFRAME.scenes[0]) return;

          const scene = AFRAME.scenes[0];
          const canvas = scene.canvas;
          const store = window.APP.store;
          const isGameFocused = DOM_ROOT.activeElement === canvas || DOM_ROOT.activeElement === null;

          // Do not allow ctrl-Z, ctrl-B (bookmarks) when game focused
          if ((e.key === "z" || e.key === "b") && (e.ctrlKey || e.altKey) && isGameFocused) {
            e.preventDefault();
          }

          // Prevent default on control key press *after* R to prevent reload during rotation/roll
          if (e.ctrlKey && e.type === "keydown" && this.codes.get("keyr")) {
            e.preventDefault();
          }

          // In builder mode or in the vox editor, we allow you to hold alt to get an eye dropper
          // Not preventing default here will cause the browser menu to be focused on windows
          if (e.code === "AltLeft" || e.code === "AltRight") {
            e.preventDefault();
          }

          // Alt Keybindings are needed here, because user input system for hotkeys doesn't work for modifier conflicts. :P
          if (SYSTEMS.builderSystem.enabled && e.type === "keydown") {
            if (e.altKey) {
              if (e.code === "KeyF") {
                SYSTEMS.builderSystem.setBrushType(BRUSH_TYPES.FACE);
                e.preventDefault();
              } else if (e.code === "KeyV") {
                SYSTEMS.builderSystem.setBrushType(BRUSH_TYPES.VOXEL);
                e.preventDefault();
              } else if (e.code === "KeyB") {
                SYSTEMS.builderSystem.setBrushType(BRUSH_TYPES.BOX);
                e.preventDefault();
              } else if (e.code === "KeyC") {
                SYSTEMS.builderSystem.setBrushType(BRUSH_TYPES.CENTER);
                e.preventDefault();
              } else if (e.code === "KeyT") {
                SYSTEMS.builderSystem.setBrushMode(BRUSH_MODES.ADD);
                e.preventDefault();
              } else if (e.code === "KeyR") {
                SYSTEMS.builderSystem.setBrushMode(BRUSH_MODES.REMOVE);
                e.preventDefault();
              } else if (e.code === "KeyG") {
                SYSTEMS.builderSystem.setBrushMode(BRUSH_MODES.PAINT);
                e.preventDefault();
              } else if (e.code === "Digit1") {
                SYSTEMS.builderSystem.toggleMirrorX();
                e.preventDefault();
              } else if (e.code === "Digit2") {
                SYSTEMS.builderSystem.toggleMirrorY();
                e.preventDefault();
              } else if (e.code === "Digit3") {
                SYSTEMS.builderSystem.toggleMirrorZ();
                e.preventDefault();
              } else if (e.code === "KeyZ") {
                SYSTEMS.builderSystem.doUndo();
                e.preventDefault();
              } else if (e.code === "KeyY") {
                SYSTEMS.builderSystem.doRedo();
                e.preventDefault();
              }
            }
          }

          if (isGameFocused && e.key === "Tab") {
            // Tab is used for object movement
            e.preventDefault();
          }

          if (e.type === "keydown" && e.key === "Escape") {
            // Blur focused elements when a popup menu is open so it is closed
            if (isInEditableField()) {
              canvas.focus();
              e.preventDefault();
              e.stopPropagation(); // To prevent double prcess
            } else {
              // On ESC, show panels if necessary when in unlocked cursor mode.
              if (getCursorLockState() === CURSOR_LOCK_STATES.UNLOCKED_PERSISTENT) {
                SYSTEMS.uiAnimationSystem.expandSidePanels();
              }
            }
          }

          // Handle enter here to avoid repeats
          if (e.type === "keydown" && e.key === "Enter" && !e.repeat) {
            // Space without widen, show or hide chat.
            if (scene.is("entered")) {
              if (!isInEditableField()) {
                scene.emit("action_chat_entry");
                store.handleActivityFlag("chat");
                e.preventDefault();
              } else {
                // If enter is entered while inside of chat message entry input, and it's empty, blur it.
                const el = DOM_ROOT.activeElement;

                if (el.classList.contains("blur-on-empty-space") && el.value === "") {
                  canvas.focus();
                  e.preventDefault();

                  // This is needed to prevent enter being proceseed twice and toggling.
                  e.stopPropagation();
                }
              }
            }
          }

          // ` in text editor blurs it, also non-modifier key @ for japanese keyboards since ` is missing
          // ` when editing vox exits inspector
          // ` otherwise toggles panels
          if (e.type === "keydown" && (e.code === "Backquote" || (e.key === "@" && e.code === "BracketLeft"))) {
            if (isInQuillEditor()) {
              window.APP.store.handleActivityFlag("mediaTextEditClose");
              // Without this, quill grabs focus when others types
              DOM_ROOT.activeElement.parentElement.__quill.quill.blur();
              canvas.focus();
              pushEvent = false; // Prevent primary action this tick if cursor still over 3d text page
              e.preventDefault();
              e.stopPropagation(); // Prevent double process
            } else if (SYSTEMS.cameraSystem.isInspecting() && !isInEditableField()) {
              // HACK if we uninspect this tick the media interaction system will run thinking
              // inspection wasn't happening, and will re-trigger.
              setTimeout(() => SYSTEMS.cameraSystem.uninspect(), 25);
            } else if (!isInEditableField() && getCursorLockState() === CURSOR_LOCK_STATES.UNLOCKED_PERSISTENT) {
              const interaction = AFRAME.scenes[0].systems.interaction;

              const hovered =
                interaction.state.leftHand.hovered ||
                interaction.state.rightHand.hovered ||
                interaction.state.rightRemote.hovered ||
                interaction.state.leftRemote.hovered;

              const held =
                interaction.state.leftHand.held ||
                interaction.state.rightHand.held ||
                interaction.state.rightRemote.held ||
                interaction.state.leftRemote.held;

              // Ignore widen when holding, since this is used for snapping.
              const heldOrHoveredOnNonLocked = held || (hovered && !isLockedMedia(hovered));

              if (!heldOrHoveredOnNonLocked) {
                SYSTEMS.uiAnimationSystem.toggleSidePanels();
              }
            }
          }

          // / in create popup blurs it
          if (
            e.type === "keydown" &&
            e.key === "/" &&
            DOM_ROOT.activeElement?.classList.contains("create-select-selection-search-input")
          ) {
            canvas.focus();
            pushEvent = false; // Prevent primary action this tick if cursor still over 3d text page
            e.preventDefault();
            e.stopPropagation(); // Preven double process
          }

          // Block browser hotkeys for chat command, media browser and freeze
          if (
            (e.type === "keydown" && e.key === "/" && !isInEditableField()) || // Cancel slash in create select input since it hides it
            (e.ctrlKey &&
              (e.code === "Digit1" ||
                e.code === "Digit2" ||
                e.code === "Digit3" ||
                e.code === "Digit4" ||
                e.code === "Digit5" ||
                e.code === "Digit6" ||
                e.code === "Digit7" ||
                e.code === "Digit8" ||
                e.code === "Digit9" ||
                e.code === "Digit0")) ||
            (e.key === " " && isGameFocused) // Disable spacebar scrolling in main window
          ) {
            e.preventDefault();
          }

          // Process event with user input system
          if (pushEvent) {
            this.events.push(e);
          }
        });
      })
    );
    ["blur"].map(x => window.addEventListener(x, this.events.push.bind(this.events)));
  }

  write(frame) {
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      if (event.type === "blur") {
        this.keys.clear();
        this.codes.clear();
        this.seenKeys.clear();
        this.seenCodes.clear();
      } else {
        const key = event.key.toLowerCase();
        const code = event.code.toLowerCase();
        const isDown = event.type === "keydown";
        this.keys.set(key, isDown);
        this.codes.set(code, isDown);

        this.seenKeys.add(key);
        this.seenCodes.add(code);

        if (event.ctrlKey) {
          this.keys.set("control", true);
          this.seenKeys.add("control");
        } else {
          this.keys.set("control", false);
        }

        if (event.altKey) {
          this.keys.set("alt", true);
          this.seenKeys.add("alt");
        } else {
          this.keys.set("alt", false);
        }

        if (event.metaKey) {
          this.keys.set("meta", true);
          this.seenKeys.add("meta");
        } else {
          this.keys.set("meta", false);
        }

        if (event.shiftKey) {
          this.keys.set("shift", true);
          this.seenKeys.add("shift");
        } else {
          this.keys.set("shift", false);
        }
      }
    }

    this.events.length = 0;
    let hasAnyKeys = false;

    for (let i = 0; i < this.seenKeys.items.length; i++) {
      const key = this.seenKeys.items[i];
      const path = paths.device.keyboard.key(key);
      frame.setValueType(path, this.keys.get(key));

      if (this.keys.get(key)) {
        hasAnyKeys = true;
      }
    }

    for (let i = 0; i < this.seenCodes.items.length; i++) {
      const code = this.seenCodes.items[i];
      const path = paths.device.keyboard.code(code);
      frame.setValueType(path, this.codes.get(code));

      if (this.codes.get(code)) {
        hasAnyKeys = true;
      }
    }

    frame.setValueType(paths.device.keyboard.any, hasAnyKeys);
  }
}
