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

THREE.VRViewerCameraRig = function ( parentTransform ) {
  this._topTransform = new THREE.Object3D();
  parentTransform.add(this._topTransform);
  this._availableModes = [];
  this._availableModes.push("mono");
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
  this._transformPanoCameraL = new THREE.Object3D(); 
  this._transformPanoCameraL = new THREE.Object3D(); 
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
        
    this._availableModes.push("classicStereo");
  }
  
  this.setupPanoStereoCam = function( primaryCamera ) {
    this._primaryCamera = primaryCamera;
    this._availableModes.push("panoStereo");
  }
  
};

THREE.VRViewerEffect = function ( renderer, onError ) {

  var vrHMD;
  var vrCameraRig;
  var vrTopTransform;

  function gotVRDevices( devices ) {

    for ( var i = 0; i < devices.length; i ++ ) {

      if ( devices[ i ] instanceof HMDVRDevice ) {

        vrHMD = devices[ i ];

        if ( vrHMD.getEyeParameters !== undefined ) {

          var eyeParamsL = vrHMD.getEyeParameters( 'left' );
          var eyeParamsR = vrHMD.getEyeParameters( 'right' );

          vrCameraRig.setupClassicStereoCam( eyeParamsL.eyeTranslation, 
                                             eyeParamsR.eyeTranslation, 
                                             eyeParamsL.recommendedFieldOfView, 
                                             eyeParamsR.recommendedFieldOfView);

        } else {

          // TODO: This is an older code path and not spec compliant.
          // It should be removed at some point in the near future.
          vrCameraRig.setupClassicStereoCam( vrHMD.getEyeTranslation( 'left' ), 
                                             vrHMD.getEyeTranslation( 'right' ), 
                                             vrHMD.getRecommendedEyeFieldOfView( 'left' ), 
                                             vrHMD.getRecommendedEyeFieldOfView( 'right' ));
        }

        break; // We keep the first we encounter

      }

    }

    if ( vrHMD === undefined ) {

      if ( onError ) onError( 'HMD not available' );

    }

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
    
  // render

  var cameraL = new THREE.PerspectiveCamera();
  var cameraR = new THREE.PerspectiveCamera();
  vrCameraRig._transformCameraL.add(cameraL);
  vrCameraRig._transformCameraR.add(cameraR);
  
  this.render = function ( scene, camera ) {
    if ( Array.isArray( scene ) ) {
      onError( 'Multiple scenes not supported in VRViewerEffect' );
    }
    
    if ( vrHMD ) {
      //------------------
      // START CAMERA BLOCK
      // TODO: pano camera handling
      //------------------
      if ( camera.parent === undefined ) camera.updateMatrixWorld();
      
      cameraL.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVL, true, camera.near, camera.far );
      cameraR.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVR, true, camera.near, camera.far );
      camera.matrixWorld.decompose (vrCameraRig._topTransform.position, vrCameraRig._topTransform.quaternion, vrCameraRig._topTransform.scale);
      vrCameraRig._topTransform.updateMatrixWorld();
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

    renderer.render( scene, camera );

  };  

};