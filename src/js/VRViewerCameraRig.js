THREE.VRViewerCameraRig = function ( parentTransform ) {
  this._topTransform = new THREE.Object3D();
  parentTransform.add(this._topTransform);
  this._hasMono = true;
  this._scale = 1.0;
  
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

  this._transformCameraL.matrix.identity();
  this._transformCameraR.matrix.identity();
    
  this.setupClassicStereoCam = function( eyeTranslationL, eyeTranslationR, eyeFOVL, eyeFOVR ) {
    // setup camera params
    this._eyeTranslationL = eyeTranslationL;
    this._eyeTranslationR = eyeTranslationR;
    this._eyeFOVL = eyeFOVL;
    this._eyeFOVR = eyeFOVR;
    
    // work out eye translations
    this._transformCameraL.translateX( this._eyeTranslationL.x * this._scale);
    this._transformCameraR.translateX( this._eyeTranslationR.x * this._scale);
  };
  
  this.update = function (camera) {
//     camera.matrixWorld.decompose (this._topTransform.position, this._topTransform.quaternion, this._topTransform.scale);      
//     this._topTransform.matrixAutoUpdate = false;
//     this._topTransform.updateMatrixWorld();
    
//         your_object.position = start_position;
//     your_object.quaternion = quaternion;
//     your_object.updateMatrix();
//     or
//         your_object.matrix.setRotationFromQuaternion(quaternion);
//     your_object.matrix.setPosition(start_position);
//     your_object.matrixAutoUpdate = false;
    
    return;
  };
};

module.exports = THREE.VRViewerCameraRig;
