/**
 * @author bhautikj / https://github.com/bhautikj
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * Based heavily on VREffect.js: https://github.com/dmarcos/vrwebgl/blob/master/template/js/VREffect.js
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
 *
 */

THREE.VRViewerEffect = function ( renderer, mode, onError ) {
  var vrHMD;
  var vrCameraRig;
  var vrTopTransform;
  var vrMode = mode;
  var vrViewerPanoScene = 0;
  
  function gotVRDevices( devices ) {
    for ( var i = 0; i < devices.length; i ++ ) {
      if ( devices[ i ] instanceof HMDVRDevice ) {
        vrHMD = devices[ i ];
        if ( vrHMD.getEyeParameters !== undefined ) {
          var eyeParamsL = vrHMD.getEyeParameters( 'left' );
          var eyeParamsR = vrHMD.getEyeParameters( 'right' );
          if ( vrMode == 'classic' ) {
            vrCameraRig.setupClassicStereoCam( eyeParamsL.eyeTranslation, 
                                              eyeParamsR.eyeTranslation, 
                                              eyeParamsL.recommendedFieldOfView, 
                                              eyeParamsR.recommendedFieldOfView);
          } else if ( vrMode == 'panoSphere' || vrMode == 'panoCube' ) {
            vrCameraRig.setupPanoStereoCam ('left', 
                                            vrViewerPanoScene.leftView.position, 
                                            vrViewerPanoScene.rightView.position, 
                                            eyeParamsL.recommendedFieldOfView, 
                                            eyeParamsR.recommendedFieldOfView);
          }
        } else {
          if ( vrMode == 'classic' ) {
            // TODO: This is an older code path and not spec compliant.
            // It should be removed at some point in the near future.
            vrCameraRig.setupClassicStereoCam( vrHMD.getEyeTranslation( 'left' ), 
                                              vrHMD.getEyeTranslation( 'right' ), 
                                              vrHMD.getRecommendedEyeFieldOfView( 'left' ), 
                                              vrHMD.getRecommendedEyeFieldOfView( 'right' ));
          } else if ( vrMode == 'panoSphere' || vrMode == 'panoCube' ) {
            vrCameraRig.setupPanoStereoCam ('left', 
                                            vrViewerPanoScene.leftView.position, 
                                            vrViewerPanoScene.rightView.position, 
                                            vrHMD.getRecommendedEyeFieldOfView( 'left' ), 
                                            vrHMD.getRecommendedEyeFieldOfView( 'right' ));
          }
        }
        break; // We keep the first we encounter
      }
    }

    if ( vrHMD === undefined ) {
      if ( onError ) onError( 'HMD not available' );
    }
  }

  if (vrMode == 'panoSphere') {
    vrViewerPanoScene = new THREE.VRViewerPanoScene( 'sphere' ); 
  } else if ( vrMode == 'panoCube' ) {
    vrViewerPanoScene = new THREE.VRViewerPanoScene( 'cube' ); 
  }
  
  if ( navigator.getVRDevices ) {
    vrTopTransform = new THREE.Object3D();
    vrCameraRig = new THREE.VRViewerCameraRig(vrTopTransform);
    navigator.getVRDevices().then( gotVRDevices );
  }

  //

  vrCameraRig.scale = 1;

  this.setSize = function( width, height ) {
    renderer.setSize( width, height );
  };

  // fullscreen

  var isFullscreen = false;

  var canvas = renderer.domElement;
  var fullscreenchange = canvas.mozRequestFullScreen ? 'mozfullscreenchange' : 'webkitfullscreenchange';

  document.addEventListener( fullscreenchange, function ( event ) {

  isFullscreen = document.mozFullScreenElement || document.webkitFullscreenElement;

  }, false );

  this.setFullScreen = function ( boolean ) {

    if ( vrHMD === undefined ) return;
    if ( isFullscreen === boolean ) return;

    if ( canvas.mozRequestFullScreen ) {

      canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );

    } else if ( canvas.webkitRequestFullscreen ) {

      canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );

    }

  };

  //

  function fovToNDCScaleOffset( fov ) {

    var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
    var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
    var pyscale = 2.0 / ( fov.upTan + fov.downTan );
    var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
    return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

  }

  function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    var handednessScale = rightHanded ? - 1.0 : 1.0;

    // start with an identity matrix
    var mobj = new THREE.Matrix4();
    var m = mobj.elements;

    // and with scale/offset info for normalized device coords
    var scaleAndOffset = fovToNDCScaleOffset( fov );

    // X result, map clip edges to [-w,+w]
    m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
    m[ 0 * 4 + 1 ] = 0.0;
    m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
    m[ 0 * 4 + 3 ] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[ 1 * 4 + 0 ] = 0.0;
    m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
    m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
    m[ 1 * 4 + 3 ] = 0.0;

    // Z result (up to the app)
    m[ 2 * 4 + 0 ] = 0.0;
    m[ 2 * 4 + 1 ] = 0.0;
    m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
    m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

    // W result (= Z in)
    m[ 3 * 4 + 0 ] = 0.0;
    m[ 3 * 4 + 1 ] = 0.0;
    m[ 3 * 4 + 2 ] = handednessScale;
    m[ 3 * 4 + 3 ] = 0.0;

    mobj.transpose();

    return mobj;

  }

  function fovToProjection( fov, rightHanded, zNear, zFar ) {

    var DEG2RAD = Math.PI / 180.0;

    var fovPort = {
      upTan: Math.tan( fov.upDegrees * DEG2RAD ),
      downTan: Math.tan( fov.downDegrees * DEG2RAD ),
      leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
      rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
    };

    return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

  }
    

  var cameraL = new THREE.PerspectiveCamera();
  var cameraR = new THREE.PerspectiveCamera();
  
  vrCameraRig._transformCameraL.add(cameraL);
  vrCameraRig._transformCameraR.add(cameraR);
  
  // render
  this.render = function ( scene, camera ) {
    if ( Array.isArray( scene ) ) {
      onError( 'Multiple scenes not supported in VRViewerEffect' );
    }
    
    if ( vrHMD ) {
      //------------------
      // START CAMERA BLOCK
      //------------------
      if ( camera.parent === undefined ) camera.updateMatrixWorld();      
      cameraL.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVL, true, camera.near, camera.far );
      cameraR.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVR, true, camera.near, camera.far );
      vrCameraRig.update(camera);
      //------------------
      // END CAMERA BLOCK
      //------------------

      //------------------
      // START RENDER BLOCK
      // TODO: integrate monocular mode, anaglyph mode
      //------------------      
      var size = renderer.getSize();
      size.width /= 2;
      // render camera setup
      renderer.enableScissorTest( true );
      renderer.clear();
      // render left eye
      renderer.setViewport( 0, 0, size.width, size.height );
      renderer.setScissor( 0, 0, size.width, size.height );
      renderer.render( scene, cameraL );

      // render right eye
      renderer.setViewport( size.width, 0, size.width, size.height );
      renderer.setScissor( size.width, 0, size.width, size.height );
      renderer.render( scene, cameraR );
      renderer.enableScissorTest( false );
      //------------------
      // END RENDER BLOCK
      //------------------

      return;

    }

    // Regular render mode if not HMD

    if ( Array.isArray( scene ) ) scene = scene[ 0 ];

    vrCameraRig.update(camera);
    renderer.render( scene, camera );

  };  
  
  this.updatePanoSceneTexture = function(leftImgSrc, rightImgSrc, fovW, fovH) {
    if (vrViewerPanoScene != 0) {
      vrViewerPanoScene.replaceTexture(leftImgSrc, rightImgSrc, fovW, fovH);
    }
  };
};

THREE.VRViewerCameraRig = function ( parentTransform ) {
  this._topTransform = new THREE.Object3D();
  parentTransform.add(this._topTransform);
  this._hasMono = true;
  this._hasClassicStereo = false;
  this._hasPanoStereo = false;
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

  //
  // Pano camera setup: two cameras one for each L/R pano object. Slaved to
  // top transform for L/R translation. In the mono case will switch to
  // either left or right as specified by _primaryCamera.
  // 
  this._panoCameraPosL = new THREE.Vector3(); 
  this._panoCameraPosR = new THREE.Vector3(); 
  this._panoCameraScale = new THREE.Vector3(1.0,1.0,1.0);
  this._panoCameraQuaternion = new THREE.Quaternion();
  this._panoCameraDummy = new THREE.Vector3(); 
  this._primaryCamera = 'left';
  
  this.setupClassicStereoCam = function( eyeTranslationL, eyeTranslationR, eyeFOVL, eyeFOVR ) {
    // setup camera params
    this._eyeTranslationL = eyeTranslationL;
    this._eyeTranslationR = eyeTranslationR;
    this._eyeFOVL = eyeFOVL;
    this._eyeFOVR = eyeFOVR;
    
    // setup init transforms; parent to top transform
    this._transformCameraL.matrix.identity();
    this._transformCameraR.matrix.identity();

    // work out eye translations
    this._transformCameraL.translateX( this._eyeTranslationL.x * this._scale);
    this._transformCameraR.translateX( this._eyeTranslationR.x * this._scale);
        
    this._hasClassicStereo = true;
  };
  
  this.setupPanoStereoCam = function( primaryCamera, panoCameraPosL, panoCameraPosR, eyeFOVL, eyeFOVR  ) {
    this._eyeFOVL = eyeFOVL;
    this._eyeFOVR = eyeFOVR;
    this._panoCameraPosL = panoCameraPosL;
    this._panoCameraPosR = panoCameraPosR;
    this._primaryCamera = primaryCamera;
    this._hasPanoStereo = true;
  };
  
  this.update = function (camera) {
    if (this._hasClassicStereo) {
      camera.matrixWorld.decompose (this._topTransform.position, this._topTransform.quaternion, this._topTransform.scale);      
      this._topTransform.updateMatrixWorld();
      return;
    }
    
    if (this._hasPanoStereo) {
      camera.matrixWorld.decompose (this._panoCameraDummy, this._panoCameraQuaternion, this._panoCameraDummy); 
      this._transformCameraL.matrixWorld.compose(this._panoCameraPosL, this._panoCameraQuaternion, this._panoCameraScale);
      this._transformCameraL.updateMatrixWorld();
      this._transformCameraR.matrixWorld.compose(this._panoCameraPosR, this._panoCameraQuaternion, this._panoCameraScale);
      this._transformCameraR.updateMatrixWorld();
      return;
    }
  };
  
};

THREE.VRViewerPanoScene = function (sceneType) {
  this.panoSep = 2000;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.leftMat = new THREE.MeshBasicMaterial();
  this.rightMat = new THREE.MeshBasicMaterial();
  this.leftCanvas = document.createElement('canvas');
  this.rightCanvas = document.createElement('canvas');

  if (this.sceneType == 'sphere'){
    this.leftGeom = new THREE.SphereGeometry(500, 32, 32); // sphere type
    this.rightGeom = new THREE.SphereGeometry(500, 32, 32); // sphere type
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeTranslation(this.panoSep,0,0));
  } else if(this.sceneType == 'cube') {
    this.leftGeom = THREE.CubeGeometry(500, 500, 500);
    this.rightGeom = new THREE.CubeGeometry(500, 500, 500);
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeTranslation(this.panoSep,0,0));
  }
  
  this.leftView = {
    camera : new THREE.PerspectiveCamera(),
    background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
    position: new THREE.Vector3(0, 0, 0),
  };
  
  this.rightView = { 
    camera: new THREE.PerspectiveCamera(),
    background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
    position: new THREE.Vector3(this.panoSep, 0, 0),
  };
  
  this.setupMaterials = function() {
    //[panorama image texture]
    this.leftCanvas.width  = this.canvasWidth;
    this.leftCanvas.height = this.canvasHeight;
    this.rightCanvas.width  = this.canvasWidth;
    this.rightCanvas.height = this.canvasHeight;
  };
  
  this.setupScene = function() {
    this.leftObj = new THREE.Mesh(this.leftGeom, this.leftMat);
    this.scene.add(this.leftObj);
    this.rightObj = new THREE.Mesh(this.rightGeom, this.rightMat);
    this.scene.add(this.rightObj);    
  };
  
  this.setupGeomCubeTex = function() {
    //     Geom cube tex map; numbers in paren are texC array indexes
    //     (0,1)
    //     ^
    //     |  (09)---(10)---(11)
    //     |   | Front |Left |
    //     |  (06)---(07)---(08)
    //     |   | Back |Right |
    //     V  (03)---(04)---(05)
    //     |   | Top  |Bottom|
    //     |  (00)---(01)---(02)
    //     |
    //     (0,0)----U-------->(0,1)
    //     
    //     Single face:
    //     0-2  first face:  0,1,2
    //     |/|  second face: 1,3,2
    //     1-3
    
    var texC = [new THREE.Vector2(0.0, 0.0),
                 new THREE.Vector2(0.5, 0.0),
                 new THREE.Vector2(1.0, 0.0),
                 new THREE.Vector2(0.0, 0.3333333),
                 new THREE.Vector2(0.5, 0.3333333),
                 new THREE.Vector2(1.0, 0.3333333),
                 new THREE.Vector2(0.0, 0.6666666),
                 new THREE.Vector2(0.5, 0.6666666),
                 new THREE.Vector2(1.0, 0.6666666),
                 new THREE.Vector2(0.0, 1.0),
                 new THREE.Vector2(0.5, 1.0),
                 new THREE.Vector2(1.0, 1.0)];
                 
    this.leftGeom.faceVertexUvs[0] = [];
    //right
    this.leftGeom.faceVertexUvs[0][2] = [ texC[10], texC[7], texC[11] ];
    this.leftGeom.faceVertexUvs[0][3] = [ texC[7], texC[8], texC[11] ];
    //left
    this.leftGeom.faceVertexUvs[0][0] = [ texC[7], texC[4], texC[8] ];
    this.leftGeom.faceVertexUvs[0][1] = [ texC[4], texC[5], texC[8] ];
    //top
    this.leftGeom.faceVertexUvs[0][4] = [ texC[3], texC[0], texC[4] ];
    this.leftGeom.faceVertexUvs[0][5] = [ texC[0], texC[1], texC[4] ];
    //bottom
    this.leftGeom.faceVertexUvs[0][6] = [ texC[4], texC[1], texC[5] ];
    this.leftGeom.faceVertexUvs[0][7] = [ texC[1], texC[2], texC[5] ];
    //front
    this.leftGeom.faceVertexUvs[0][10] = [ texC[6], texC[3], texC[7] ];
    this.leftGeom.faceVertexUvs[0][11] = [ texC[3], texC[4], texC[7] ];
    //back
    this.leftGeom.faceVertexUvs[0][8] = [ texC[9], texC[6], texC[10] ];
    this.leftGeom.faceVertexUvs[0][9] = [ texC[6], texC[7], texC[10] ];

    this.rightGeom.faceVertexUvs[0] = [];
    //right
    this.rightGeom.faceVertexUvs[0][2] = [ texC[10], texC[7], texC[11] ];
    this.rightGeom.faceVertexUvs[0][3] = [ texC[7], texC[8], texC[11] ];
    //left
    this.rightGeom.faceVertexUvs[0][0] = [ texC[7], texC[4], texC[8] ];
    this.rightGeom.faceVertexUvs[0][1] = [ texC[4], texC[5], texC[8] ];
    //top
    this.rightGeom.faceVertexUvs[0][4] = [ texC[3], texC[0], texC[4] ];
    this.rightGeom.faceVertexUvs[0][5] = [ texC[0], texC[1], texC[4] ];
    //bottom
    this.rightGeom.faceVertexUvs[0][6] = [ texC[4], texC[1], texC[5] ];
    this.rightGeom.faceVertexUvs[0][7] = [ texC[1], texC[2], texC[5] ];
    //front
    this.rightGeom.faceVertexUvs[0][10] = [ texC[6], texC[3], texC[7] ];
    this.rightGeom.faceVertexUvs[0][11] = [ texC[3], texC[4], texC[7] ];
    //back
    this.rightGeom.faceVertexUvs[0][8] = [ texC[9], texC[6], texC[10] ];
    this.rightGeom.faceVertexUvs[0][9] = [ texC[6], texC[7], texC[10] ];   
  };
  
  this.replaceTexture = function(leftImgSrc, rightImgSrc, fovW, fovH) {
    var leftContext = this.leftCanvas.getContext('2d');
    leftContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // canvas contents will be used for a texture
    var leftTex = new THREE.Texture(this.leftCanvas);
    this.leftMat.map = leftTex;
    
    // load an image
    var leftImg = new Image();
    leftImg.src = leftImgSrc;
    // after the image is loaded, this function executes
    
    leftImg.onload = (function(mat, cw, ch) {
      return function() {
        var destWidth = cw*fovW/360.0;
        var destHeight = ch*fovH/180.0;
        var originX = cw*0.5 - 0.5*destWidth;
        var originY = ch*0.5 - 0.5*destHeight;

        leftContext.drawImage(leftImg, originX, originY, destWidth, destHeight);
        leftTex.needsUpdate = true;
        mat.map.needsUpdate = true;              
      }
    })(this.leftMat, this.canvasWidth, this.canvasHeight);
        
    //var leftMaterial = new THREE.MeshBasicMaterial( {map: leftTex, side:THREE.DoubleSide} );
    //leftMaterial.transparent = true;
    
    var rightContext = this.rightCanvas.getContext('2d');
    rightContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // canvas contents will be used for a texture
    var rightTex = new THREE.Texture(this.rightCanvas);
    this.rightMat.map = rightTex;
    
    var rightImg = new Image();
    rightImg.src = rightImgSrc;
    
    rightImg.onload = (function(mat, cw, ch) {
      return function() {
        var destWidth = cw*fovW/360.0;
        var destHeight = ch*fovH/180.0;
        var originX = cw*0.5 - 0.5*destWidth;
        var originY = ch*0.5 - 0.5*destHeight;

        rightContext.drawImage(rightImg, originX, originY, destWidth, destHeight);
        rightTex.needsUpdate = true;
        mat.map.needsUpdate = true;              
      }
    })(this.rightMat, this.canvasWidth, this.canvasHeight);
        
    //var rightMaterial = new THREE.MeshBasicMaterial( {map: rightTex, side:THREE.DoubleSide} );
    //rightMaterial.transparent = true;
  };

  

  this.leftView.camera.position = this.leftView.position;
  this.rightView.camera.position.x = this.rightView.position;

  this.scene = new THREE.Scene();

  this.sceneType = sceneType;
  if (this.sceneType == 'sphere'){
    this.canvasWidth=2048;
    this.canvasHeight=1024;
  } else if(this.sceneType == 'cube') {
    this.canvasWidth=1024;
    this.canvasHeight=3072;
    this.setupGeomCubeTex();
  }
  
  // set up scene
  this.setupMaterials();  
  this.setupScene();
};