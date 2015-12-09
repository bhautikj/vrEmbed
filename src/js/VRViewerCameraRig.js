THREE.VRViewerCameraRig = function (leftCam, centerCam, rightCam) {
  this._topTransform = new THREE.Object3D();
  this._hasMono = true;
  this._scale = 1.0;
  this._centerCam = centerCam;
  this._leftCam = leftCam;
  this._rightCam = rightCam;
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
};