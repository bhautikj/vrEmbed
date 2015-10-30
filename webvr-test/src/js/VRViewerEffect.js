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

require('./ShaderPassAnaglyph.js');

THREE.VRViewerEffect = function ( renderer, mode, onError ) {
  var vrHMD;
  var vrCameraRig;
  var vrTopTransform;
  var renderMode = mode;
  var vrStereographicProjectionQuad = new THREE.VRStereographicProjectionQuad();
  var shaderPassAnaglyph = new ShaderPassAnaglyph(AnaglyphProjection);
  var textureDesc = [];
  
  this.setStereographicProjection = function (textureDescription) {
    textureDesc.push(textureDescription);    
    vrStereographicProjectionQuad.setupProjection(textureDescription, 
                                                  window.innerWidth, 
                                                  window.innerHeight);
  };
  
  this.setRenderMode = function (mode) {
    renderMode = mode;
  };
  
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
  
  vrTopTransform = new THREE.Object3D();
  vrCameraRig = new THREE.VRViewerCameraRig(vrTopTransform);
  if ( navigator.getVRDevices ) {
    navigator.getVRDevices().then( gotVRDevices );
  }
  //

  vrCameraRig.scale = 1;

  this.setSize = function( width, height ) {
    vrStereographicProjectionQuad.resizeViewport(width, height);
    shaderPassAnaglyph.resize(width, height);
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

  this.isFullscreenMode = function () {
    return isFullscreen;
  }
  
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
    
    finalRenderMode = renderMode;
    
    // fallback modes if HMD unavailable
    if (!vrHMD) {
      if (renderMode == 2) {
        finalRenderMode = 0;
      }
    }
    
    
    // Render modes:
    // 0  (00): one viewport, no anaglyph
    // 2  (10): two viewports, no anaglyph
    // 1  (01): one viewport, anaglyph
    
    
    if (finalRenderMode == 0) {
      // Regular render mode if not HMD
      if ( Array.isArray( scene ) ) scene = scene[ 0 ];
      // render pano
      // TODO: only run if mode says yes
      vrCameraRig.update(camera);
      vrStereographicProjectionQuad.setLeft();
      vrStereographicProjectionQuad.preRender(camera);
      vrStereographicProjectionQuad.render(renderer);
      renderer.render( scene, camera );
      return;
    }
    
    //------------------
    // START CAMERA BLOCK
    //------------------
    if ( camera.parent === undefined ) {
      camera.updateMatrixWorld();      
    }
    cameraL.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVL, true, camera.near, camera.far );
    cameraR.projectionMatrix = fovToProjection( vrCameraRig._eyeFOVR, true, camera.near, camera.far );
    vrCameraRig.update(camera);
    //------------------
    // END CAMERA BLOCK
    //------------------
    
    //------------------
    // START RENDER BLOCK
    //------------------    
    // render camera setup

    // two viewport render
    if ( finalRenderMode == 2 ) {
      renderer.enableScissorTest( true );
      renderer.clear();
      var size = renderer.getSize();
      size.width /= 2;      // render left eye
      renderer.setViewport( 0, 0, size.width, size.height );
      renderer.setScissor( 0, 0, size.width, size.height );
      vrStereographicProjectionQuad.setLeft();
      vrStereographicProjectionQuad.preRender(cameraL);
      vrStereographicProjectionQuad.render(renderer);
      renderer.render( scene, cameraL );

      // render right eye
      renderer.setViewport( size.width, 0, size.width, size.height );
      renderer.setScissor( size.width, 0, size.width, size.height );
      vrStereographicProjectionQuad.setRight();
      vrStereographicProjectionQuad.preRender(cameraR);
      vrStereographicProjectionQuad.render(renderer);
      renderer.render( scene, cameraR );
      renderer.enableScissorTest( false );
    } else if (finalRenderMode == 1) {
      renderer.clear();
      vrStereographicProjectionQuad.setLeft();
      vrStereographicProjectionQuad.preRender(cameraL);
      vrStereographicProjectionQuad.renderToTex(renderer, shaderPassAnaglyph.anaglyphTargetL);
      renderer.render( scene, cameraL, shaderPassAnaglyph.anaglyphTargetL );

      // render right eye
      vrStereographicProjectionQuad.setRight();
      vrStereographicProjectionQuad.preRender(cameraR);
      vrStereographicProjectionQuad.renderToTex(renderer, shaderPassAnaglyph.anaglyphTargetR);
      renderer.render( scene, cameraR, shaderPassAnaglyph.anaglyphTargetR  );
      shaderPassAnaglyph.copyMat();
      
      renderer.render( shaderPassAnaglyph.scene, shaderPassAnaglyph.camera );
    }
  

    //------------------
    // END RENDER BLOCK
    //------------------

    return;

  }; 
};






