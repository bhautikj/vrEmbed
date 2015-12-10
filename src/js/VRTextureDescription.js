var THREE = require('../js-ext/three.js');

VRTextureDescription = function () {
  this.textureSource = "";
  this.metaSource = "";
  this.isStereo = false;
  // in degrees
  this.sphereFOV = new THREE.Vector2(0.0, 0.0);
  // in degrees
  this.sphereCentre = new THREE.Vector2(0.0, 0.0);
  // in uv coords (0,1)
  this.U_r = new THREE.Vector2(0.0, 0.0);
  this.V_r = new THREE.Vector2(1.0, 1.0);
  this.U_l = new THREE.Vector2(0.0, 0.0);
  this.V_l = new THREE.Vector2(1.0, 1.0);
};

module.exports = VRTextureDescription;