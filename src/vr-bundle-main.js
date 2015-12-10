// external deps
var THREE = require('./js-ext/three.js');
console.log('THREE revision: ', THREE.REVISION);

// local deps
require('./js/VRTextureDescription.js');
require('./js/VRShaderPassAnaglyph.js');
require('./js/VRViewerEffectModes.js');
require('./js/VRViewerEffect.js');
require('./js/VRViewerCameraRig.js');
require('./js/VRStereographicProjectionQuad.js');
require('./js/VRParser.js');
require('./js/VRIcons.js');
require('./js/VRStates.js');
require('./js/VRStateToggler.js');
require('./js/VRUtil.js');
require('./js/VRControllers.js');

require('./js/main.js');