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

var VRStates = require('./VRStates.js');

THREE.VRViewerCameraRig = function () {
  this._topTransform = new THREE.Object3D();
  this._hasMono = true;
  this._scale = 1.0;
  this._centerCam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.3, 10000);
  this._leftCam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.3, 10000);
  this._rightCam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.3, 10000);
  this.scene = null;

  //
  // Classic stereo camera setup: parent transform with two child cameras
  //
  this._transformCameraL = new THREE.Object3D();
  this._transformCameraR = new THREE.Object3D();
  this._topTransform.add(this._transformCameraL);
  this._topTransform.add(this._transformCameraR);

  this._eyeTranslationL = 0;
  this._eyeFOVL = 0;
  this._eyeTranslationR = 0;
  this._eyeFOVR = 0;

  this._topTransform.matrix.identity();
  this._transformCameraL.matrix.identity();
  this._transformCameraR.matrix.identity();

  this.connectCameras = function() {
    this._topTransform.add(this._centerCam);
    this._transformCameraL.add(this._leftCam);
    this._transformCameraR.add(this._rightCam);
  };

  this.disconnectCameras = function() {
    this._topTransform.remove(this._centerCam);
    this._transformCameraL.remove(this._leftCam);
    this._transformCameraR.remove(this._rightCam);
  };

  this.init = function(scene) {
    this.scene = scene;
    this.connectCameras();
    this.scene.add (this._topTransform);
  };

  this.dispose = function() {
    this.disconnectCameras();
    this.scene.remove (this._topTransform);
  };

  this.setupClassicStereoCam = function( eyeTranslationL, eyeTranslationR, eyeFOVL, eyeFOVR ) {
    // setup camera params
    this._eyeTranslationL = eyeTranslationL;
    this._eyeTranslationR = eyeTranslationR;
    this._eyeFOVL = eyeFOVL;
    this._eyeFOVR = eyeFOVR;

    // work out eye translations
    this._transformCameraL.translateX( this._eyeTranslationL * this._scale);
    this._transformCameraR.translateX( this._eyeTranslationR * this._scale);
    this._transformCameraL.updateMatrix();
    this._transformCameraR.updateMatrix();
  };

  this.setRotation = function (quat) {
    this._topTransform.quaternion.copy( quat );
    this._topTransform.updateMatrix();
  };

  this.setPosition = function (pos) {
    this._topTransform.position.copy( pos );
    this._topTransform.updateMatrix();
  };

  this.resizeCamera = function(width, height, state) {
    switch(state){
      case VRStates.INACTIVE:
      case VRStates.WINDOWED:
      case VRStates.FULLSCREEN:
        this._centerCam.aspect = width / height;
        this._centerCam.updateProjectionMatrix();
        break;
      case VRStates.WINDOWED_ANAGLYPH:
      case VRStates.FULLSCREEN_ANAGLYPH:
        this._leftCam.aspect = width / height;
        this._leftCam.updateProjectionMatrix();
        this._rightCam.aspect = width / height;
        this._rightCam.updateProjectionMatrix();
        break;
      case VRStates.CARDBOARD:
        this._leftCam.aspect = width * 0.5 / height;
        this._leftCam.updateProjectionMatrix();
        this._rightCam.aspect = width * 0.5 / height;
        this._rightCam.updateProjectionMatrix();
        break;
    }

  };
};
