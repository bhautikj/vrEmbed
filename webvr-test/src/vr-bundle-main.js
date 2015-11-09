
require('./js/TextureDescription.js');
require('./js/VRViewerEffect.js');
require('./js/VRViewerCameraRig.js');
require('./js/ShaderPassAnaglyph.js');
require('./js/VRStereographicProjectionQuad.js');

// 
// //   three.js 3d library
// require('./js-ext/three.js');
// 
// //   VRControls.js acquires positional information from connected VR devices and applies the transformations to a three.js camera object.
require('./js-ext/VRControls.min.js');
// 
// //enable HMD mode without being mobile device
// //forces WebVRPolyfill.prototype.isCardboardCompatible to return true
window.CARDBOARD_DEBUG = true;
// 
// //   A polyfill for WebVR using the Device{Motion,Orientation}Event API.
require('./js-ext/webvr-polyfill.min.js');
// 
// //   Helps enter and exit VR mode, provides best practices while in VR.
require('./js-ext/webvr-manager.min.js');

// 
// 
// /*
//  * Debug parameters.
//  */
// 
// Enable distortion everywhere.
//WEBVR_FORCE_DISTORTION = true;
// Override the distortion background color.
//WEBVR_BACKGROUND_COLOR = new THREE.Vector4(1, 0, 0, 1);
// Change the tracking prediction mode; normally 2 but its laggy as all hell
// on normal phones so wind it back to 0.
WEBVR_PREDICTION_MODE = 0;
// In prediction mode, change how far into the future to predict.
//WEBVR_PREDICTION_TIME_MS = 100;// </script>

require('./js/VRParser.js');
require('./js/VRState.js');
