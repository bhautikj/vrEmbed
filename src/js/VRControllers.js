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

var Util = require('./VRUtil.js');
var util = new Util();

var VRRotMath = require('./VRRotMath.js');
var vrRotMath = new VRRotMath();

function VRLookControlBase() {
  var self = this;
  this.eulerX = 0.0;
  this.eulerY = 0.0;
  this.eulerZ = 0.0;
  this.baseMat = twgl.m4.identity();
}

VRLookControlBase.prototype.updateBase = function(cameraMatrix) {
  var rotMat = twgl.m4.identity();

  twgl.m4.copy(rotMat, cameraMatrix);
  // twgl.m4.rotateY(cameraMatrix, Math.PI/2, cameraMatrix);
  twgl.m4.rotateX(cameraMatrix, Math.PI/2, cameraMatrix);
  twgl.m4.rotateZ(cameraMatrix, Math.PI/2, cameraMatrix);
  twgl.m4.rotateX(cameraMatrix, Math.PI, cameraMatrix);

  //roll
  twgl.m4.rotateX(cameraMatrix, this.eulerX, cameraMatrix);
  //pitch
  twgl.m4.rotateY(cameraMatrix, this.eulerY, cameraMatrix);
  //yaw
  twgl.m4.rotateZ(cameraMatrix, this.eulerZ, cameraMatrix);
};

VRLookControlBase.prototype.setEuler = function(x,y,z) {
  this.eulerX = x;
  this.eulerY = y;
  this.eulerZ = z;
};

VRLookControlBase.prototype.getEuler = function() {
  return [this.eulerX, this.eulerY, this.eulerZ];
};

VRIdleSpinner = function() {
}

VRIdleSpinner.prototype = new VRLookControlBase();

VRIdleSpinner.prototype.update = function(cameraMatrix){
  this.setEuler(0, this.eulerZ-0.01, 0);
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
  this.eulerY = this.eulerY + (dY * 0.01);
  this.eulerZ = this.eulerZ - (dX * 0.01);
}

VRMouseSpinner.prototype.update = function(cameraMatrix){
	this.updateBase(cameraMatrix);
}

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

  var rotMat = vrRotMath.gyroToMat(this.deviceOrientation.alpha,
    this.deviceOrientation.beta,
    this.deviceOrientation.gamma,
    this.screenOrientation);
  twgl.m4.copy(rotMat, cameraMatrix);

  var eulerAng = vrRotMath.matToEuler(rotMat);
  this.eulerX = eulerAng[0];
  this.eulerY = eulerAng[1];
  this.eulerZ = eulerAng[2];
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
  this.mode = VRLookMode.MOUSE;
  this.euler = [0,0,0];

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
      this.mode = VRLookMode.MOUSE;
  };

  this.update = function() {
    this.checkModes();

    switch(this.mode) {
      case VRLookMode.MOUSE:
        this.vrMouseSpinner.update(this.camera);
        this.euler = this.vrMouseSpinner.getEuler();
        break;
      case VRLookMode.IDLESPINNER:
        this.vrIdleSpinner.update(this.camera);
        this.euler = this.vrIdleSpinner.getEuler();
        break;
      case VRLookMode.GYRO:
        this.vrGyroSpinner.update(this.camera);
        this.euler = this.vrGyroSpinner.getEuler();
        break;
    }
  };

  // return yaw, pitch, roll in degrees
  this.getHeading = function() {
    if(this.mode==VRLookMode.GYRO)
      return [(180.0*this.euler[0]/Math.PI + 270.0)%360.0 - 180.0,
              -180.0*this.euler[2]/Math.PI,
              -180.0*this.euler[1]/Math.PI + 90.0];
    else
      return [-180.0*this.euler[2]/Math.PI,
              -180.0*this.euler[1]/Math.PI,
              180.0*this.euler[0]/Math.PI];
  }
};

module.exports = VRLookController;
