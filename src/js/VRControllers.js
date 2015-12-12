var THREE = require('../js-ext/three.js');

var Util = require('./VRutil.js');
var util = new Util();

function VRLookControlBase() {
  var self = this;
  this.eulerX = 0.0;
  this.eulerY = 0.0;
  this.eulerZ = 0.0;
}

VRLookControlBase.prototype.updateBase = function(cameraObject) { 
    var devm = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(this.eulerX, this.eulerY, this.eulerZ, 'YXZ'));
    cameraObject.quaternion.copy( devm );
    cameraObject.updateMatrix();
};

VRLookControlBase.prototype.setEuler = function(x,y,z) {
  this.eulerX = x;
  this.eulerY = y;
  this.eulerZ = z;
};

VRIdleSpinner = function() {
}

VRIdleSpinner.prototype = new VRLookControlBase();

VRIdleSpinner.prototype.update = function(cameraObject){
  this.setEuler(0, this.eulerY+0.01, 0);
  this.updateBase(cameraObject);
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
  this.eulerX = Math.min(Math.max(-Math.PI / 2, this.eulerX - dY * 0.01), Math.PI / 2);
  this.eulerY = this.eulerY - dX * 0.01;
}

VRMouseSpinner.prototype.update = function(cameraObject){
  this.updateBase(cameraObject);
}

// this implementation based heavily on: https://github.com/borismus/webvr-polyfill/blob/master/src/orientation-position-sensor-vr-device.js
VRGyroSpinner = function() {
  this.deviceOrientation = null;
  this.screenOrientation = window.orientation;
  
  window.addEventListener('deviceorientation', this.onDeviceOrientationChange_.bind(this));
  window.addEventListener('orientationchange', this.onScreenOrientationChange_.bind(this));
  
  // Helper objects for calculating orientation.
  this.finalQuaternion = new THREE.Quaternion();
  this.tmpQuaternion = new THREE.Quaternion();
  this.deviceEuler = new THREE.Euler();
  this.screenTransform = new THREE.Quaternion();
  // -PI/2 around the x-axis.
  this.worldTransform = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

  // The quaternion for taking into account the reset position.
  this.resetTransform = new THREE.Quaternion();  
  
  this.init = false;
}

VRGyroSpinner.prototype = new VRLookControlBase();

VRGyroSpinner.prototype.onDeviceOrientationChange_ = function(deviceOrientation) {
  this.deviceOrientation = deviceOrientation;
};

VRGyroSpinner.prototype.onScreenOrientationChange_ = function(screenOrientation) {
  this.screenOrientation = window.orientation;
};

VRGyroSpinner.prototype.getOrientation = function() {
  if (this.deviceOrientation == null) {
    return null;
  }

  this.init = true;
  
  // Rotation around the z-axis.
  var alpha = THREE.Math.degToRad(this.deviceOrientation.alpha);
  // Front-to-back (in portrait) rotation (x-axis).
  var beta = THREE.Math.degToRad(this.deviceOrientation.beta);
  // Left to right (in portrait) rotation (y-axis).
  var gamma = THREE.Math.degToRad(this.deviceOrientation.gamma);
  var orient = THREE.Math.degToRad(this.screenOrientation);

  // Use three.js to convert to quaternion. Lifted from
  // https://github.com/richtr/threeVR/blob/master/js/DeviceOrientationController.js
  this.deviceEuler.set(beta, alpha, -gamma, 'YXZ');
  this.tmpQuaternion.setFromEuler(this.deviceEuler);
  this.minusHalfAngle = -orient / 2;
  this.screenTransform.set(0, Math.sin(this.minusHalfAngle), 0, Math.cos(this.minusHalfAngle));
  // Take into account the reset transformation.
  this.finalQuaternion.copy(this.resetTransform);
  // And any rotations done via touch events.
  //this.finalQuaternion.multiply(this.touchPanner.getOrientation());
  this.finalQuaternion.multiply(this.tmpQuaternion);
  this.finalQuaternion.multiply(this.screenTransform);
  this.finalQuaternion.multiply(this.worldTransform);

  return this.finalQuaternion;
};


VRGyroSpinner.prototype.update = function(cameraObject){
  var orient = this.getOrientation();
  if (orient == null)
    return;
  cameraObject.quaternion.copy( orient );
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