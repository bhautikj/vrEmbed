/**
  Copyright 2015 Bhautik J Joshi

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/

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
