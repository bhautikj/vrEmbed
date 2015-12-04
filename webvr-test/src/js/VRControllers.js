function VRLookControlBase() {
  var self = this;
  this.eulerX = 0.0;
  this.eulerY = 0.0;
  this.eulerZ = 0.0;
  this.camera = null;
}

VRLookControlBase.prototype.updateBase = function() {
    if (this.camera == null){
      return;
    }
    
//     alert(this.eulerY);
    var devm = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(this.eulerX, this.eulerY, this.eulerZ));
    this.camera.quaternion.copy( devm );
};

VRLookControlBase.prototype.setEuler = function(x,y,z) {
  this.eulerX = x;
  this.eulerY = y;
  this.eulerZ = z;
};

VRLookControlBase.prototype.setCamera = function(camera) {
  this.camera = camera;
};

VRLookControlBase.prototype.dispose = function() {
  this.camera = null;
};


VRIdleSpinner = function() {
}

VRIdleSpinner.prototype = new VRLookControlBase();

VRIdleSpinner.prototype.update = function(){
  this.setEuler(0, this.eulerY+0.01, 0);
  this.updateBase();
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

VRMouseSpinner.prototype.update = function(){
  this.updateBase();
}



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
  this.camera = null;
  this.mode = VRLookMode.MOUSE;
  
  this.setMode = function(mode) {
    switch(mode){
      case VRLookMode.MOUSE:
        self.vrIdleSpinner.setCamera(null);
        self.vrMouseSpinner.setCamera(self.camera);
        break;
      case VRLookMode.IDLESPINNER:
        self.vrIdleSpinner.setCamera(self.camera);
        self.vrMouseSpinner.setCamera(null);
        break;
    };
  }
  
  this.setCamera = function(camera){
    self.camera = camera;
    self.setMode(self.mode);
  };
  
  this.mouseMove = function(dx, dy) {
    self.vrMouseSpinner.mouseMove(dx, dy);
  };
  
  this.update = function() {
    self.vrMouseSpinner.update();
    self.vrIdleSpinner.update();
  };
  
  self.setMode(self.mode);
  
};