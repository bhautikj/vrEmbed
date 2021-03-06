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
  this.baseMat = twgl.m4.identity();

  twgl.m4.rotateX(this.baseMat, Math.PI, this.baseMat);
  //roll
  twgl.m4.rotateX(this.baseMat, this.eulerX, this.baseMat);
  //pitch
  twgl.m4.rotateY(this.baseMat, this.eulerY, this.baseMat);
  //yaw
  twgl.m4.rotateZ(this.baseMat, this.eulerZ, this.baseMat);

  twgl.m4.copy(this.baseMat, cameraMatrix);
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

VRIdleSpinner.prototype.update = function(cameraMatrix, resetHeading){
  if (resetHeading == true) {
    this.eulerZ = 0.0;
  }
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
  this.decayMode = false;
  this.decayMult = 0.9;
  this.dX = 0;
  this.dY = 0;
}

VRMouseSpinner.prototype = new VRLookControlBase();

VRMouseSpinner.prototype.mouseMove = function(dX, dY, pX, pY){
  this.eulerY = this.eulerY + (dY * 0.01);
  this.eulerZ = this.eulerZ - (dX * 0.01);
  this.dX = dX;
  this.dY = dY;
}

VRMouseSpinner.prototype.startDecay = function() {
  this.decayMode = true;
  this.dX = parseFloat(this.dX);
  this.dY = parseFloat(this.dY);
}

VRMouseSpinner.prototype.update = function(cameraMatrix, resetHeading){
  if (resetHeading == true) {
    this.eulerZ = 0.0;
  }

  if (this.decayMode == true) {
    this.mouseMove(this.dX*this.decayMult, this.dY*this.decayMult, 0, 0);
    if (Math.abs(this.dX)<1e-6 && Math.abs(this.dY)<1e-6) {
      this.decayMode = false;
    }
  }

	this.updateBase(cameraMatrix);
}

VRGyroSpinner = function() {
  this.deviceOrientation = null;
  this.screenOrientation = window.orientation;

  window.addEventListener('deviceorientation', this.onDeviceOrientationChange_.bind(this), true);
  window.addEventListener('orientationchange', this.onScreenOrientationChange_.bind(this), true);

  this.baseRotation = twgl.m4.identity();
  this.screenTransform = twgl.m4.identity();

  this.yawOffset = 0;

  this.init = false;
}

VRGyroSpinner.prototype = new VRLookControlBase();

VRGyroSpinner.prototype.onDeviceOrientationChange_ = function(deviceOrientation) {
  this.deviceOrientation = deviceOrientation;
};

VRGyroSpinner.prototype.onScreenOrientationChange_ = function(screenOrientation) {
  this.screenOrientation = window.orientation;
};

// VRGyroSpinner.prototype.hasGyro = function() {
//   if(window.DeviceOrientationEvent) {
//     if (this.deviceorientation == null) {
//       return false;
//     }
//
//     if (this.deviceOrientation.alpha == null ||
//         this.deviceOrientation.beta == null ||
//         this.deviceOrientation.gamma ==null) {
//           return false;
//         }
//   }
//   return true;
// };


VRGyroSpinner.prototype.update = function(cameraMatrix, resetOffset){
  if (this.deviceOrientation == null)
    return;

  // document.getElementById("log").innerHTML = " alpha:  " + Math.floor(this.deviceOrientation.alpha) +
  //                                            " beta:   " + Math.floor(this.deviceOrientation.beta) +
  //                                            " gamma:  " + Math.floor(this.deviceOrientation.gamma) +
  //                                            " orient: " + Math.floor(this.screenOrientation);

  var rotMat = vrRotMath.gyroToMat(this.deviceOrientation.alpha,
    this.deviceOrientation.beta,
    this.deviceOrientation.gamma,
    this.screenOrientation,
    resetOffset);
  twgl.m4.copy(rotMat[0], cameraMatrix);

  var eulerAng = vrRotMath.matToEuler(rotMat);
  // yaw
  this.eulerX = rotMat[1];
  // pitch
  this.eulerY = rotMat[2];
  this.eulerZ = 0;
}

VRGyroSpinner.prototype.isMobile = function() {
  // bail if no gyro
  if (!window.DeviceOrientationEvent)
    return false;

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
  this.pointer = null;

  this.setCamera = function(camera){
    self.camera = camera;
  };

  this.mouseMove = function(dx, dy, px, py) {
    self.vrMouseSpinner.mouseMove(dx, dy, px, py);
    this.pointer = [px,py];
  };

  this.mouseStop = function() {
    this.pointer = null;
    self.vrMouseSpinner.startDecay();
  };

  this.checkModes = function() {
//     this.mode = VRLookMode.GYRO;
    if (this.vrGyroSpinner.isMobile())
      this.mode = VRLookMode.GYRO;
    else
      this.mode = VRLookMode.MOUSE;
  };

  this.update = function(resetHeading) {
    this.checkModes();

    switch(this.mode) {
      case VRLookMode.MOUSE:
        this.vrMouseSpinner.update(this.camera, resetHeading);
        this.euler = this.vrMouseSpinner.getEuler();
        break;
      case VRLookMode.IDLESPINNER:
        this.vrIdleSpinner.update(this.camera, resetHeading);
        this.euler = this.vrIdleSpinner.getEuler();
        break;
      case VRLookMode.GYRO:
        this.vrGyroSpinner.update(this.camera, resetHeading);
        this.euler = this.vrGyroSpinner.getEuler();
        break;
    }
  };

  this.isGyro = function() {
    return this.mode == VRLookMode.GYRO;
  }

  // return yaw, pitch, roll in degrees
  this.getHeading = function() {
    if(this.mode==VRLookMode.GYRO)
      return [this.euler[0], this.euler[1], this.euler[2]];
    else
      return [(-180.0*this.euler[2]/Math.PI),
              -180.0*this.euler[1]/Math.PI,
              180.0*this.euler[0]/Math.PI];
  }
};

module.exports = VRLookController;
