import ACTION_BUTTON_9_URL from "!!url-loader!./assets/hud/action_button.9.png";
import BUTTON_9_URL from "!!url-loader!./assets/hud/button.9.png";
import PLAY_URL from "!!url-loader!./assets/video-overlay/play.png";
import PLAY_HOVER_URL from "!!url-loader!./assets/video-overlay/play-hover.png";
import PAUSE_URL from "!!url-loader!./assets/video-overlay/pause.png";
import PAUSE_HOVER_URL from "!!url-loader!./assets/video-overlay/pause-hover.png";
import CURSOR_URL from "!!url-loader!./assets/images/cursor.svg";

export default `
    <a-scene
        embedded
        loading-screen="enabled: false"
        effects
        hubs-systems
        capture-system
        listed-media
        local-audio-analyser
        class="grab-cursor"
        renderer="
            antialias: false;
            colorManagement: true;
            sortObjects: true;
            physicallyCorrectLights: true;
            alpha: false;
            webgl2: true;
            multiview: false;"
        mute-mic="eventSrc: a-scene; toggleEvents: action_mute"
        personal-space-bubble="debug: false;"
        environment-map
        set-max-resolution
        media-presenting-scene
        light="defaultLightsEnabled: false"
    >
        <a-assets>
            <img style="display: none;" id="action-button" crossorigin="anonymous" src="${ACTION_BUTTON_9_URL}">
            <img style="display: none;" id="button" crossorigin="anonymous" src="${BUTTON_9_URL}">
            <img style="display: none;" id="video-play" crossorigin="anonymous" src="${PLAY_URL}">
            <img style="display: none;" id="video-play-hover" crossorigin="anonymous" src="${PLAY_HOVER_URL}">
            <img style="display: none;" id="video-pause" crossorigin="anonymous" src="${PAUSE_URL}">
            <img style="display: none;" id="video-pause-hover" crossorigin="anonymous" src="${PAUSE_HOVER_URL}">
            <img style="display: none;" id="cursor-image" crossorigin="anonymous" src="${CURSOR_URL}">

            <template id="remote-avatar">
                <a-entity networked-avatar ik-root player-info wrapped-entity visible="false">
                    <a-entity class="camera"></a-entity>

                    <a-entity visible="false" class="left-controller"></a-entity>

                    <a-entity visible="false" class="right-controller"></a-entity>

                    <a-entity class="model" gltf-model-plus="inflate: true">
                        <template data-name="AvatarRoot">
                            <a-entity
                                ik-controller="instanceHeads: true"
                                networked-audio-analyser
                            ></a-entity>
                        </template>

                        <template data-name="Neck">
                            <a-entity>
                                <a-entity
                                    billboard
                                    class="nametag"
                                    text="align: center; color: #ddd"
                                    position="0 1 0"
                                    scale="6 6 6"
                                ></a-entity>
                                <a-entity
                                    visible="false"
                                    class="identityName"
                                    text="align: center; color: #ddd"
                                    position="0 0.8 0"
                                    scale="3 3 3"
                                ></a-entity>
                            </a-entity>
                        </template>

                        <template data-name="Spine">
                            <a-entity personal-space-invader="radius: 0.2; useMaterial: true;" bone-visibility>
                            </a-entity>
                        </template>

                        <template data-name="Head">
                            <a-entity
                                avatar-audio-source="rolloffFactor: 10.0; refDistance: 10.0;"
                                avatar-volume-controls
                                body-helper="type: kinematic; collisionFilterGroup: 4; collisionFilterMask: 17;"
                                shape-helper="type: sphere; fit: manual; sphereRadius: 0.5;"
                            ></a-entity>
                        </template>

                        <template data-name="LeftHand">
                            <a-entity visible="false"></a-entity>
                        </template>

                        <template data-name="RightHand">
                            <a-entity visible="false"></a-entity>
                        </template>
                    </a-entity>
                </a-entity>
            </template>

            <template id="static-media">
                <a-entity
                    body-helper="type: static; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 17;"
                >
                </a-entity>
            </template>

            <template id="static-controlled-media">
                <a-entity
                    class="interactable"
                    body-helper="type: static; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 17;"
                    is-remote-hover-target
                    position-at-box-shape-border__freeze="target:.freeze-menu;"
                    tags="isStatic: true; togglesHoveredActionSet: true; inspectable: true;"
                    listed-media
                >
                </a-entity>
            </template>

            <template id="interactable-media">
                <a-entity
                    class="interactable"
                    body-helper="type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 31;"
                    set-unowned-body-kinematic
                    is-remote-hover-target
                    tags="isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; inspectable: true;"
                    destroy-at-extreme-distances
                    scalable-when-grabbed
                    floaty-object="gravitySpeedLimit: 0; modifyGravityOnRelease: true; autoLockOnLoad: true;"
                    set-yxz-order
                    hoverable-visuals="enableSweepingEffect: false"
                    listed-media
                    use-audio-system-settings
                    wrapped-entity
                    dom-serialized-entity
                >
                </a-entity>
            </template>

            <template id="linked-media">
                <a-entity
                    class="interactable"
                    body-helper="type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 31;"
                    is-remote-hover-target
                    tags="togglesHoveredActionSet: true; inspectable: true;"
                    set-unowned-body-kinematic
                    set-yxz-order
                >
                    <a-entity class="ui interactable-ui">
                    </a-entity>
                </a-entity>
            </template>

            <template id="interactable-pen">
                <a-entity
                    class="pen interactable"
                    body-helper="type: dynamic; mass: 0.001; collisionFilterGroup: 1; collisionFilterMask: 31; gravity: 0 0 0;"
                    gltf-model-plus="src: #drawing-pen; inflate: true;"
                    owned-object-limiter="counter: #pen-counter"
                    set-unowned-body-kinematic
                    is-remote-hover-target
                    tags="isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; isPen: true;"
                    floaty-object="modifyGravityOnRelease: true; autoLockOnLoad: true; gravitySpeedLimit: 0; reduceAngularFloat: true;"
                    scale="0.5 0.5 0.5"
                    action-to-remove__pen="path: /actions/pen/remove;"
                    position-at-border="target:.pen-menu"
                    set-yxz-order
                >
                    <a-entity
                        id="pen"
                        position="0 -0.18 0"
                        pen="camera: #avatar-pov-node; drawingManager: #drawing-manager"
                        pen-laser
                    ></a-entity>
                    <a-entity class="ui delete-button pen-menu" visibility-while-frozen="withinDistance: 100; withPermission: spawn_drawing" >
                        <a-entity mixin="rounded-button" is-remote-hover-target tags="singleActionButton: true" remove-networked-object-button position="0 0 0.001">
                            <a-entity
                                sprite
                                icon-button="image: remove-action.png; hoverImage: remove-action.png;"
                                scale="0.165 0.165 0.165"
                                position="0 0 0.001"
                            ></a-entity>
                        </a-entity>
                    </a-entity>
                </a-entity>
            </template>

            <template id="interactable-camera">
                <a-entity
                    class="interactable"
                    body-helper="type: dynamic; mass: 0.001; collisionFilterGroup: 1; collisionFilterMask: 8;"
                    camera-tool
                    is-remote-hover-target
                    tags="isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true;"
                    shape-helper="type: box; fit: manual; halfExtents: 0.22 0.14 0.1; offset: 0 0.02 0;"
                    floaty-object="autoLockOnRelease: true; autoLockOnLoad: true;"
                    owned-object-limiter="counter: #camera-counter"
                    set-unowned-body-kinematic
                    scalable-when-grabbed
                    position-at-border="target:.camera-menu; isFlat: true"
                    set-yxz-order
                >
                </a-entity>
            </template>

            <template id="interactable-drawing">
                <a-entity
                    class="drawing"
                    networked-drawing
                    is-remote-hover-target
                >
                </a-entity>
            </template>

            <template id="pager-hover-menu">
                <a-entity class="ui interactable-ui hover-container" visible="false">
                    <a-entity class="page-label" position="0 -0.6 0" text="value:.; width:2; align:center;" text-raycast-hack></a-entity>
                </a-entity>
            </template>

            <!-- TODO: All of these positions are assuming 16:9 - need to actually reposition based on video resolution -->

            <template id="video-hover-menu">
                <a-entity class="ui interactable-ui hover-container" visible="false">
                    <a-entity class="video-volume-label" text="value: 0%; anchor: center; align: center; color: #ccc; letterSpacing: 4;" text-raycast-hack position="0.0 0.20 0.0015" scale="1.0 1.0 1.0"></a-entity>
                    <a-entity class="video-time-label" text="value: 0; anchor: center; align: center; color: #aaa;" text-raycast-hack position="0.35 -0.24 0" scale="0.75 0.75 0.75"></a-entity>
                    <a-image
                        is-remote-hover-target
                        tags="singleActionButton: true; isHoverMenuChild: true;"
                        icon-button="image: #video-pause; hoverImage: #video-pause-hover; activeImage: #video-play; activeHoverImage: #video-play-hover"
                        scale="0.1 0.1 0.1"
                        position="-0.40 -0.21 0.005"
                        class="ui video-playpause-button"
                    ></a-image>
                </a-entity>
            </template>


            <template id="hubs-destination-hover-menu">
                <a-entity class="ui interactable-ui hover-container" visible="false">
                    <a-entity mixin="rounded-text-action-button ui" is-remote-hover-target tags="singleActionButton: true; isHoverMenuChild: true;" open-media-button position="0 -0.125 0.001">
                        <a-entity text="value:value; width:1.5; align:center;" text-raycast-hack position="0 0 0.02"></a-entity>
                    </a-entity>
                </a-entity>
            </template>

            <template id="link-hover-menu">
                <a-entity class="ui interactable-ui hover-container" visible="false">
                </a-entity>
            </template>

            <template id="photo-hover-menu">
                <a-entity class="ui interactable-ui hover-container" visible="false">
                </a-entity>
            </template>

            <template id="video-unmute">
                <a-entity
                    class="ui interactable-ui hover-container unmute-ui"
                    position="0 0 0.1"
                    visibility-while-frozen="visible: false; withinDistance: 100; requireHoverOnNonMobile: false;"
                >
                    <a-entity is-remote-hover-target tags="singleActionButton:true;" mixin="rounded-text-button" slice9="width: 0.4" unmute-video-button position="0 -0.5 0.001">
                        <a-entity text="value:unmute; width:2; align:center;" text-raycast-hack position="0 0 0.02"></a-entity>
                    </a-entity>
                </a-entity>
            </template>

            <a-mixin id="rounded-text-button"
                slice9="
                    width: 0.45;
                    height: 0.2;
                    left: 64;
                    top: 64;
                    right: 66;
                    bottom: 66;
                    opacity: 1.0;
                    src: #button"
            ></a-mixin>

            <a-mixin id="rounded-button"
                slice9="
                    width: 0.2;
                    height: 0.2;
                    left: 64;
                    top: 64;
                    right: 66;
                    bottom: 66;
                    opacity: 1.0;
                    src: #button"
            ></a-mixin>

            <a-mixin id="rounded-text-action-button"
                slice9="
                    width: 0.45;
                    height: 0.2;
                    left: 64;
                    top: 64;
                    right: 66;
                    bottom: 66;
                    opacity: 1.0;
                    src: #action-button"
            ></a-mixin>

            <a-mixin id="rounded-action-button"
                slice9="
                    width: 0.2;
                    height: 0.2;
                    left: 64;
                    top: 64;
                    right: 66;
                    bottom: 66;
                    opacity: 1.0;
                    src: #action-button"
            ></a-mixin>
        </a-assets>

        <!-- HACK - We use this object to trigger initial batch preparation -->
        <a-entity id="batch-prep" visible="false"></a-entity>

        <a-entity id="pen-counter" networked-counter="max: 10;"></a-entity>

        <a-entity id="camera-counter" networked-counter="max: 1;"></a-entity>

        <a-entity id="drawing-manager" drawing-manager="penSpawner: #pen-spawner"></a-entity>

        <a-entity
            id="right-cursor-controller"
            cursor-controller="cursor: #right-cursor; cursorVisual: #right-cursor-visual; camera: #avatar-pov-node;"
        ></a-entity>

        <a-entity
            id="left-cursor-controller"
            cursor-controller="cursor: #left-cursor; cursorVisual: #left-cursor-visual; camera: #avatar-pov-node;"
        ></a-entity>

        <a-sphere
            id="right-cursor"
            material="shader: flat; visible: false;"
            radius="0.01"
            segments-width="9"
            segments-height="9"
            body-helper="type: kinematic; disableCollision: true; collisionFilterGroup: 8; collisionFilterMask: 0; scaleAutoUpdate: false; activationState: disable_deactivation;"
            shape-helper="type: sphere; sphereRadius: 0.02; fit: manual;">
            <a-circle
                id="right-cursor-visual"
                radius="0.02"
                material="shader: flat; src: #cursor-image; depthTest: false; opacity: 0.9;"
                scale-in-screen-space="baseScale: 0.10 0.10 0.10; addedScale: 0.4 0.4 0.4;"
                billboard>
            </a-circle>
        </a-sphere>

        <a-sphere
            id="left-cursor"
            material="shader: flat; visible: false"
            radius="0.01"
            segments-width="9"
            segments-height="9"
            body-helper="type: kinematic; disableCollision: true; collisionFilterGroup: 8; collisionFilterMask: 0; scaleAutoUpdate: false; activationState: disable_deactivation;"
            shape-helper="type: sphere; sphereRadius: 0.02; fit: manual;">
            <a-circle
                id="left-cursor-visual"
                radius="0.02"
                material="shader: flat; src: #cursor-image; depthTest: false; opacity: 0.9;"
                scale-in-screen-space="baseScale: 0.10 0.10 0.10; addedScale: 0.4 0.4 0.4;"
                billboard>
            </a-circle>
        </a-sphere>

        <!-- Avatar Rig -->
        <a-entity
            id="avatar-rig"
            ik-root
            periodic-full-syncs
            player-info
            set-yxz-order
            visible="false"
        >
            <a-entity
                id="avatar-pov-node"
                class="camera"
                personal-space-bubble="radius: 0.4;"
                rotation
                camera-rotator
                set-yxz-order
                position="0 1.6 0"
            >
            </a-entity>

            <a-entity
                id="player-left-controller"
                class="left-controller"
                track-pose="path: /actions/leftHand/matrix"
                visibility-by-path="path: /actions/leftHand/matrix"
                hand-controls2="left"
                teleporter="start: /actions/leftHand/startTeleport; confirm: /actions/leftHand/stopTeleport; collisionEntities: [nav-mesh]"
                body-helper="type: kinematic; emitCollisionEvents: false; disableCollision: true; collisionFilterGroup: 8; collisionFilterMask: 3; activationState: disable_deactivation; scaleAutoUpdate: false;"
                shape-helper="type: box; fit: manual; halfExtents: 0.03 0.04 0.05; offset: 0 0 -0.04"
                set-yxz-order
            >
            </a-entity>

            <a-entity
                id="player-right-controller"
                class="right-controller"
                track-pose="path: /actions/rightHand/matrix"
                visibility-by-path="path: /actions/rightHand/matrix"
                hand-controls2="right"
                teleporter="start: /actions/rightHand/startTeleport; confirm: /actions/rightHand/stopTeleport; collisionEntities: [nav-mesh]"
                body-helper="type: kinematic; emitCollisionEvents: false; disableCollision: true; collisionFilterGroup: 8; collisionFilterMask: 3; activationState: disable_deactivation; scaleAutoUpdate: false;"
                shape-helper="type: box; fit: manual; halfExtents: 0.03 0.04 0.05; offset: 0 0 -0.04"
                set-yxz-order
            >
            </a-entity>

            <a-entity gltf-model-plus="inflate: true;" class="model">
                <template data-name="AvatarRoot">
                    <a-entity
                        ik-controller="alwaysUpdate: true; instanceHeads: true; isSelf: true;"
                        disable-frustum-culling
                        hand-pose__left
                        hand-pose__right
                        hand-pose-controller__left="networkedAvatar:#avatar-rig;eventSrc:#player-left-controller"
                        hand-pose-controller__right="networkedAvatar:#avatar-rig;eventSrc:#player-right-controller"
                    ></a-entity>
                </template>

                <template data-name="Neck">
                    <a-entity>
                        <a-entity class="nametag" visible="false" text ></a-entity>
                    </a-entity>
                </template>
                <template data-name="Spine">
                    <a-entity>
                        <a-entity class="chest-image" scale="0.18 0.18 0.18" position="0 -0.025 0.13"></a-entity>
                    </a-entity>
                </template>
                <template data-name="Head">
                    <a-entity id="avatar-head" visible="false" bone-visibility="updateWhileInvisible: true;"></a-entity>
                </template>

                <template data-name="LeftHand">
                    <a-entity bone-visibility="updateWhileInvisible: true;" hover-visuals="hand: left;"></a-entity>
                </template>

                <template data-name="RightHand">
                    <a-entity bone-visibility="updateWhileInvisible: true;" hover-visuals="hand: right;"></a-entity>
                </template>

            </a-entity>
        </a-entity>

        <a-entity
            id="pen-spawner"
            action-to-event="path: /actions/spawnPen; event: spawn_pen; withPermission: spawn_drawing"
            super-spawner="
                template: #interactable-pen;
                spawnEvent: spawn_pen;
                animateFromCursor: true;
                spawnScale: 0.5, 0.5, 0.5;
                "
        ></a-entity>

        <a-entity id="viewing-rig" set-yxz-order camera-rotator>
            <a-entity
                id="viewing-camera"
                camera="near: 0.05; far: 26;"
                set-active-camera
                rotation
                fader
                set-yxz-order
                >
            </a-entity>
        </a-entity>
    </a-scene>
`;
