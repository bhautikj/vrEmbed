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

twgl = require('../js-ext/twgl-full.js');

var Util = require('./VRutil.js');
var util = new Util();

// deviceorientation to rotation matrix
// via: https://dev.opera.com/articles/w3c-device-orientation-usage/
var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function setBaseRotationMatrix( alpha, beta, gamma, mat ) {
	var _x = beta  ? beta  * degtorad : 0; // beta value
	var _y = gamma ? gamma * degtorad : 0; // gamma value
	var _z = alpha ? alpha * degtorad : 0; // alpha value

	var cX = Math.cos( _x );
	var cY = Math.cos( _y );
	var cZ = Math.cos( _z );
	var sX = Math.sin( _x );
	var sY = Math.sin( _y );
	var sZ = Math.sin( _z );

	//
	// ZXY-ordered rotation matrix construction.
	//

	var m11 = cZ * cY - sZ * sX * sY;
	var m12 = - cX * sZ;
	var m13 = cY * sZ * sX + cZ * sY;

	var m21 = cY * sZ + cZ * sX * sY;
	var m22 = cZ * cX;
	var m23 = sZ * sY - cZ * cY * sX;

	var m31 = - cX * sY;
	var m32 = sX;
	var m33 = cX * cY;

  // twgl is column - major relative to this scheme
  mat[0] = m11;
  mat[1] = m21;
  mat[2] = m31;
  mat[3] = 0.0;
  mat[4] = m12;
  mat[5] = m22;
  mat[6] = m32;
  mat[7] = 0.0;
  mat[8] = m13;
  mat[9] = m23;
  mat[10] = m33;
  mat[11] = 0.0;
  mat[12] = 0.0;
  mat[13] = 0.0;
  mat[14] = 0.0;
  mat[15] = 1.0;

  return mat;
};

function setScreenTransformationMatrix( screenOrientation, mat ) {
	var orientationAngle = screenOrientation ? screenOrientation * degtorad : 0;

	var cA = Math.cos( orientationAngle );
	var sA = Math.sin( orientationAngle );

	// Construct our screen transformation matrix
  mat[0] = cA;
  mat[1] = sA;
  mat[2] = 0;
  mat[3] = 0;
  mat[4] = -1.0*sA;
  mat[5] = cA;
  mat[6] = 0.0;
  mat[7] = 0.0;
  mat[8] = 0.0;
  mat[9] = 0.0;
  mat[10] = 1.0;
  mat[11] = 0.0;
  mat[12] = 0.0;
  mat[13] = 0.0;
  mat[14] = 0.0;
  mat[15] = 1.0;
  return mat;
}


function VRLookControlBase() {
  var self = this;
  this.eulerX = 0.0;
  this.eulerY = 0.0;
  this.eulerZ = 0.0;
  this.baseMat = twgl.m4.identity();
}

VRLookControlBase.prototype.updateBase = function(cameraMatrix) {
    twgl.m4.identity(this.baseMat);
    //roll
    twgl.m4.rotateX(this.baseMat,this.eulerX),this.baseMat;
    //yaw
    twgl.m4.rotateY(this.baseMat,this.eulerY, this.baseMat);
    //pitch
    twgl.m4.rotateZ(this.baseMat,this.eulerZ, this.baseMat);
    twgl.m4.copy(this.baseMat, cameraMatrix);
};

VRLookControlBase.prototype.setEuler = function(x,y,z) {
  this.eulerX = x;
  this.eulerY = y;
  this.eulerZ = z;
};

VRIdleSpinner = function() {
}

VRIdleSpinner.prototype = new VRLookControlBase();

VRIdleSpinner.prototype.update = function(cameraMatrix){
  this.setEuler(0, 0, this.eulerZ+0.01);
  this.updateBase(cameraMatrix);
}

var VRIdleSpinnerFactory = (function () {
    var instance;

    function createInstance() {
        var object = new VRIdleSpinner();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


VRMouseSpinner = function() {
}

VRMouseSpinner.prototype = new VRLookControlBase();

VRMouseSpinner.prototype.mouseMove = function(dX, dY){
  this.eulerY = Math.min(Math.max(-Math.PI / 2, this.eulerX - dY * 0.01), Math.PI / 2);
  this.eulerZ = this.eulerY - dX * 0.01;
}

VRMouseSpinner.prototype.update = function(cameraMatrix){
  this.updateBase(cameraMatrix);
}

// this implementation based heavily on: https://github.com/borismus/webvr-polyfill/blob/master/src/orientation-position-sensor-vr-device.js
VRGyroSpinner = function() {
  this.deviceOrientation = null;
  this.screenOrientation = window.orientation;

  window.addEventListener('deviceorientation', this.onDeviceOrientationChange_.bind(this));
  window.addEventListener('orientationchange', this.onScreenOrientationChange_.bind(this));
  /*
  // Helper objects for calculating orientation.
  this.finalQuaternion = new THREE.Quaternion();
  this.tmpQuaternion = new THREE.Quaternion();
  this.deviceEuler = new THREE.Euler();
  this.screenTransform = new THREE.Quaternion();
  // -PI/2 around the x-axis.
  this.worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

  // The quaternion for taking into account the reset position.
  this.resetTransform = new THREE.Quaternion();
  */

  this.baseRotation = twgl.m4.identity();
  this.screenTransform = twgl.m4.identity();

  this.init = false;
}

VRGyroSpinner.prototype = new VRLookControlBase();

VRGyroSpinner.prototype.onDeviceOrientationChange_ = function(deviceOrientation) {
  this.deviceOrientation = deviceOrientation;
};

VRGyroSpinner.prototype.onScreenOrientationChange_ = function(screenOrientation) {
  this.screenOrientation = window.orientation;
};

VRGyroSpinner.prototype.update = function(cameraMatrix){
  if (this.deviceOrientation == null)
    return;
  this.baseRotation = setBaseRotationMatrix(this.deviceOrientation.alpha,
                                            this.deviceOrientation.beta,
                                            this.deviceOrientation.gamma,
                                            this.baseMat);
  this.screenTransform = setScreenTransformationMatrix(this.screenOrientation,
                                                       this.screenTransform);
  twgl.m4.multiply(this.baseRotation, this.screenTransform, this.baseMat);

  //twgl.m4.rotateX(this.baseMat, Math.PI/2, this.baseMat);
  //twgl.m4.rotateX(this.baseMat, Math.PI/2, this.baseMat);
  // twgl.m4.rotateZ(this.baseMat, Math.PI/2, this.baseMat);

  twgl.m4.copy(this.baseMat, cameraMatrix);
}

VRGyroSpinner.prototype.isMobile = function() {
  return util.isMobile();
}

mobileAndTabletcheck = function() {

}

var VRGyroSpinnerFactory = (function () {
    var instance;

    function createInstance() {
        var object = new VRGyroSpinner();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


VRLookMode = {
  MOUSE: 0,
  IDLESPINNER: 1,
  GYRO: 2
}

VRLookController = function() {
  var self = this;
  this.angle = 0;
  this.vrMouseSpinner = new VRMouseSpinner();
  this.vrIdleSpinner = VRIdleSpinnerFactory.getInstance();
  this.vrGyroSpinner = VRGyroSpinnerFactory.getInstance();

  this.camera = null;
  this.mode = VRLookMode.IDLESPINNER;

  this.setCamera = function(camera){
    self.camera = camera;
  };

  this.mouseMove = function(dx, dy) {
    self.vrMouseSpinner.mouseMove(dx, dy);
  };

  this.checkModes = function() {
//     this.mode = VRLookMode.GYRO;
    if (this.vrGyroSpinner.isMobile())
      this.mode = VRLookMode.GYRO;
    else
      this.mode = VRLookMode.IDLESPINNER;
  };

  this.update = function() {
    this.checkModes();

    switch(this.mode) {
      case VRLookMode.MOUSE:
        self.vrMouseSpinner.update(this.camera);
        break;
      case VRLookMode.IDLESPINNER:
        self.vrIdleSpinner.update(this.camera);
        break;
      case VRLookMode.GYRO:
        self.vrGyroSpinner.update(this.camera);
        break;
    }
  };
};

module.exports = VRLookController;
