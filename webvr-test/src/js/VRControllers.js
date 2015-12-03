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


VRIdleCameraSpinner = function() {
}

VRIdleCameraSpinner.prototype = new VRLookControlBase();

VRIdleCameraSpinner.prototype.update = function(){
  this.setEuler(0, this.eulerY+0.01, 0);
  this.updateBase();
}


VRMouseSpinner = function() {  
}

VRMouseSpinner.prototype = new VRLookControlBase();

VRMouseSpinner.prototype.mouseMove = function(dX, dY){
  this.eulerX += dX;
  this.eulerY += dY;
}

VRMouseSpinner.prototype.update = function(){
  this.updateBase();
}


VRLookController = function() {
  var self = this;
  this.angle = 0;
  this.vrMouseSpinner = new VRMouseSpinner();
  
  this.setCamera = function(camera){
    self.vrMouseSpinner.setCamera(camera);
  };
  
  this.mouseMove = function(dx, dy) {
    self.vrMouseSpinner.mouseMove(dx, dy);
  };
  
  this.update = function() {
    if (self.vrMouseSpinner==null)
      return;

    self.vrMouseSpinner.update();
  };
};