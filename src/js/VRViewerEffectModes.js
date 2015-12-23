var THREE = require('../js-ext/three.js');

// 0  (00): one viewport, no anaglyph
// 2  (10): two viewports, no anaglyph
// 1  (01): one viewport, anaglyph

THREE.VRViewerEffectModes = {
  ONE_VIEWPORT: 0,
  ANAGLYPH: 1,
  TWO_VIEWPORTS: 2
};

module.exports = THREE.VRViewerEffectModes;
