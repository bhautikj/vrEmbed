function VRLookControlBase() {
  this.callbacks = {};
}

VRLookControlBase.prototype.update = function() {
};

// TODO:
// set camera
// dispose
// update

VRLookController = function() {
  var self = this;
  this.camera = null;
  this.angle = 0;
  
  
  this.setCamera = function(camera){
    self.camera = camera;
  };
  
  this.update = function() {
    if (self.camera==null)
      return;
    
    self.angle += 0.01;
    var devm = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, self.angle, self.angle));
    self.camera.quaternion.copy( devm );
  };
  
};