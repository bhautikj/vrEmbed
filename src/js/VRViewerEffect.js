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

var VRShaderPassAnaglyph = require('./VRShaderPassAnaglyph.js');
var VRViewerCameraRig = require('./VRViewerCameraRig.js');

// 0  (00): one viewport, no anaglyph
// 2  (10): two viewports, no anaglyph
// 1  (01): one viewport, anaglyph

THREE.VRViewerEffectModes = {
  ONE_VIEWPORT: 0,
  ANAGLYPH: 1,
  TWO_VIEWPORTS: 2
};

THREE.VRViewerEffect = function ( renderer, mode, onError ) {
  var vrHMD;
  var vrCameraRig;
  var vrTopTransform;
  var renderMode = mode;
  var vrStereographicProjectionQuads = [];
  var shaderPassAnaglyph = new VRShaderPassAnaglyph();
  var textureDesc = [];
  
  this.setStereographicProjection = function (textureDescription) {
    var vrStereographicProjectionQuad = new THREE.VRStereographicProjectionQuad();
    vrStereographicProjectionQuad.setupProjection(textureDescription, 
                                                  window.innerWidth, 
                                                  window.innerHeight);
    vrStereographicProjectionQuads.push(vrStereographicProjectionQuad);    
  };
  
  this.setRenderMode = function (mode) {
    renderMode = mode;
  };
  
  function setupClassicStereoCam( ) {
    var INTERPUPILLARY_DISTANCE = 0.06;
    var DEFAULT_MAX_FOV_LEFT_RIGHT = 40.0;
    vrCameraRig.setupClassicStereoCam( INTERPUPILLARY_DISTANCE*-0.5, 
                                      INTERPUPILLARY_DISTANCE*0.5, 
                                      DEFAULT_MAX_FOV_LEFT_RIGHT, 
                                      DEFAULT_MAX_FOV_LEFT_RIGHT);
  }
  
  vrTopTransform = new THREE.Object3D();
  vrCameraRig = new THREE.VRViewerCameraRig(vrTopTransform);
  //setupClassicStereoCam();
  //

  vrCameraRig.scale = 1;

  this.setSize = function( width, height ) {
    for (i=0; i<vrStereographicProjectionQuads.length; i++){
      vrStereographicProjectionQuads[i].resizeViewport(width, height);
    }
    shaderPassAnaglyph.resize(width, height);
    renderer.setSize( width, height );
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
    
    finalRenderMode = renderMode;
    
    // Render modes:
    // 0  (00): one viewport, no anaglyph
    // 2  (10): two viewports, no anaglyph
    // 1  (01): one viewport, anaglyph
    
    
    if (finalRenderMode == THREE.VRViewerEffectModes.ONE_VIEWPORT) {
      // Regular render mode if not HMD
      if ( Array.isArray( scene ) ) scene = scene[ 0 ];
      // render pano
      // TODO: only run if mode says yes
      vrCameraRig.update(camera);
      for (i=0; i<vrStereographicProjectionQuads.length; i++){
        vrStereographicProjectionQuads[i].setLeft();
        vrStereographicProjectionQuads[i].preRender(camera);
        vrStereographicProjectionQuads[i].render(renderer);
      }
      
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
//     cameraL.updateMatrix();
//     cameraR.updateMatrix();

    //------------------
    // END CAMERA BLOCK
    //------------------
    
    //------------------
    // START RENDER BLOCK
    //------------------    
    // render camera setup

    // two viewport render
    if ( finalRenderMode == THREE.VRViewerEffectModes.TWO_VIEWPORTS ) {
      renderer.enableScissorTest( true );
      renderer.clear();
      var size = renderer.getSize();
      size.width /= 2;      // render left eye
      renderer.setViewport( 0, 0, size.width, size.height );
      renderer.setScissor( 0, 0, size.width, size.height );
      
      for (i=0; i<vrStereographicProjectionQuads.length; i++){
        vrStereographicProjectionQuads[i].setLeft();
        vrStereographicProjectionQuads[i].preRender(cameraL);
        vrStereographicProjectionQuads[i].render(renderer);
      }
      
      renderer.render( scene, cameraL );

      // render right eye
      renderer.setViewport( size.width, 0, size.width, size.height );
      renderer.setScissor( size.width, 0, size.width, size.height );
      for (i=0; i<vrStereographicProjectionQuads.length; i++){
        vrStereographicProjectionQuads[i].setRight();
        vrStereographicProjectionQuads[i].preRender(cameraR);
        vrStereographicProjectionQuads[i].render(renderer);
      }
      renderer.render( scene, cameraR );
      renderer.enableScissorTest( false );
    } else if (finalRenderMode == THREE.VRViewerEffectModes.ANAGLYPH) {
      renderer.clear();
      for (i=0; i<vrStereographicProjectionQuads.length; i++){
        vrStereographicProjectionQuads[i].setLeft();
        vrStereographicProjectionQuads[i].preRender(cameraL);
        vrStereographicProjectionQuads[i].renderToTex(renderer, shaderPassAnaglyph.anaglyphTargetL);
      }
      renderer.render( scene, cameraL, shaderPassAnaglyph.anaglyphTargetL );

      // render right eye
      for (i=0; i<vrStereographicProjectionQuads.length; i++){
        vrStereographicProjectionQuads[i].setRight();
        vrStereographicProjectionQuads[i].preRender(cameraR);
        vrStereographicProjectionQuads[i].renderToTex(renderer, shaderPassAnaglyph.anaglyphTargetR);
      }
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






