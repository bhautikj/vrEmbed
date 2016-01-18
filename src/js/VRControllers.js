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

//via: http://osgjs.org/docs/annotated-source/FirstPersonManipulatorDeviceOrientationController.html
var degtorad = Math.PI / 180.0;
// assumed yxz rotation order
var quatFromEuler = function ( x, y, z  ) {
	var quat = [];
  var c1 = Math.cos( x / 2 );
  var c2 = Math.cos( y / 2 );
  var c3 = Math.cos( z / 2 );
  var s1 = Math.sin( x / 2 );
  var s2 = Math.sin( y / 2 );
  var s3 = Math.sin( z / 2 );

	quat[ 0 ] = s1 * c2 * c3 + c1 * s2 * s3;
	quat[ 1 ] = c1 * s2 * c3 - s1 * c2 * s3;
	quat[ 2 ] = c1 * c2 * s3 - s1 * s2 * c3;
	quat[ 3 ] = c1 * c2 * c3 + s1 * s2 * s3;

	return quat;
};

var quatIentity = function () {
	return [0.,0.,0.,1.];
}

var quatMult = function (a, b) {
	var result = [];
  var ax = a[ 0 ];
  var ay = a[ 1 ];
  var az = a[ 2 ];
  var aw = a[ 3 ];

  var bx = b[ 0 ];
  var by = b[ 1 ];
  var bz = b[ 2 ];
  var bw = b[ 3 ];

  result[ 0 ] = ax * bw + ay * bz - az * by + aw * bx;
  result[ 1 ] = -ax * bz + ay * bw + az * bx + aw * by;
  result[ 2 ] = ax * by - ay * bx + az * bw + aw * bz;
  result[ 3 ] = -ax * bx - ay * by - az * bz + aw * bw;
  return result;
}

var quatToRotationMatrix = function(q, dstMat) {
  var qX = q[0];
  var qY = q[1];
  var qZ = q[2];
  var qW = q[3];

  var qWqW = qW * qW;
  var qWqX = qW * qX;
  var qWqY = qW * qY;
  var qWqZ = qW * qZ;
  var qXqW = qX * qW;
  var qXqX = qX * qX;
  var qXqY = qX * qY;
  var qXqZ = qX * qZ;
  var qYqW = qY * qW;
  var qYqX = qY * qX;
  var qYqY = qY * qY;
  var qYqZ = qY * qZ;
  var qZqW = qZ * qW;
  var qZqX = qZ * qX;
  var qZqY = qZ * qY;
  var qZqZ = qZ * qZ;

  var d = qWqW + qXqX + qYqY + qZqZ;

  var arr = [
    (qWqW + qXqX - qYqY - qZqZ) / d,
     2 * (qWqZ + qXqY) / d,
     2 * (qXqZ - qWqY) / d, 0,
    2 * (qXqY - qWqZ) / d,
     (qWqW - qXqX + qYqY - qZqZ) / d,
     2 * (qWqX + qYqZ) / d, 0,
     2 * (qWqY + qXqZ) / d,
     2 * (qYqZ - qWqX) / d,
     (qWqW - qXqX - qYqY + qZqZ) / d, 0,
    0, 0, 0, 1];

  twgl.m4.copy(arr, dstMat);
};

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
    twgl.m4.rotateX(this.baseMat,this.eulerX, this.baseMat);
    //yaw
    twgl.m4.rotateY(this.baseMat,this.eulerY, this.baseMat);
    //pitch
    twgl.m4.rotateZ(this.baseMat,this.eulerZ, this.baseMat);
    twgl.m4.copy(this.baseMat, cameraMatrix);

		twgl.m4.rotateY(cameraMatrix, Math.PI/2, cameraMatrix);
		twgl.m4.rotateZ(cameraMatrix, Math.PI, cameraMatrix);
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
  this.setEuler(0, this.eulerY-0.01, 0);
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

		// document.getElementById("log").innerHTML = " a:" + Math.floor(this.deviceOrientation.alpha) +
		// 																					" b:" + Math.floor(this.deviceOrientation.beta) +
		// 																					" g:" + Math.floor(this.deviceOrientation.gamma);

		var alpha = this.deviceOrientation.alpha * degtorad;
    var beta = this.deviceOrientation.beta * degtorad;
    var gamma = this.deviceOrientation.gamma * degtorad;
    var screenAngle = this.screenOrientation * degtorad;

    var quat = quatFromEuler( beta, alpha, -gamma );
    var minusHalfAngle = -screenAngle / 2.0;
		var screenTransform = quatIentity();
		screenTransform[ 1 ] = Math.sin( minusHalfAngle );
    screenTransform[ 3 ] = Math.cos( minusHalfAngle );

		// var worldTransform = [-Math.sqrt( 0.5 ), 0.0, 0.0, Math.sqrt( 0.5 )];
		quat = quatMult( quat, screenTransform );
		// quat = quatMult( quat, worldTransform );

		quatToRotationMatrix(quat, cameraMatrix);

		twgl.m4.rotateX(cameraMatrix,Math.PI/2.,cameraMatrix);
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
