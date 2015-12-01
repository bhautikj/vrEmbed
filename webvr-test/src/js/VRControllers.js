function VRLookControlBase() {
  var self = this;
  this.eulerX = 0.0;
  this.eulerY = 0.0;
  this.eulerZ = 0.0;
  this.camera = null;
}

VRLookControlBase.prototype.updateBase = function() {
    if (this.camera == null){
      alert("OH GODS");
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
//   console.log(this.eulerY);
  this.updateBase();
}

VRLookController = function() {
  var self = this;
  this.angle = 0;
  this.idleCameraSpinner = new VRIdleCameraSpinner();
  
  this.setCamera = function(camera){
    self.idleCameraSpinner.setCamera(camera);
  };
  
  this.update = function() {
    if (self.idleCameraSpinner==null)
      return;

    self.idleCameraSpinner.update();
  };
  
};