(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
AnaglyphProjection = {
  
  uniforms: {
    mapLeft: { type: "t", value: 0 },
    mapRight: { type: "t", value: 0 }
  },
  
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    '  vUv = uv;',
    '  gl_Position = vec4( position, 1.0 );',    
    "}"
  ].join('\n'),

  fragmentShader: [
      "uniform sampler2D mapLeft;",
      "uniform sampler2D mapRight;",
      "varying vec2 vUv;",
      "void main() {",
      " vec4 colorL, colorR;",
      " vec2 uv = vUv;",
      " colorL = texture2D( mapLeft, uv );",
      " colorR = texture2D( mapRight, uv );",
        // http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx
      " gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;",
//        "gl_FragColor = colorL;",
      "}"  
  ].join('\n')
};

// based on http://threejs.org/examples/js/effects/AnaglyphEffect.js
ShaderPassAnaglyph = function(shader) {
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

  this.material = new THREE.ShaderMaterial({
    defines: shader.defines || {},
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  
  this.material.depthTest = false;
  this.material.depthWrite = false;
  
  var params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

  this.resize = function(width, height) {
    if ( this.anaglyphTargetL ) this.anaglyphTargetL.dispose();
    if ( this.anaglyphTargetR ) this.anaglyphTargetR.dispose();
    
    this.anaglyphTargetL = new THREE.WebGLRenderTarget( width, height, params );
    this.anaglyphTargetR = new THREE.WebGLRenderTarget( width, height, params );
    this.anaglyphTargetL.depthBuffer = false;
    this.anaglyphTargetR.depthBuffer = false;
  
    this.material.uniforms[ "mapLeft" ].value = this.anaglyphTargetL;
    this.material.uniforms[ "mapRight" ].value = this.anaglyphTargetR;
  };

  this.resize( window.innerWidth, window.innerHeight);

  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene  = new THREE.Scene();
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  this.scene.add(this.quad);
  
  this.copyMat = function () {
    this.quad.material = this.material;
  };
  
  // render loop prototype
  //this.copyMat();
  //renderer.render( this.scene, cameraL, this.anaglyphTargetL, true );
  //renderer.render( this.scene, cameraR, this.anaglyphTargetR, true );
  //renderer.render( this._scene, this._camera );
};
},{}],2:[function(require,module,exports){
TextureDescription = function () {
  this.textureSource = "";
  this.metaSource = "";
  this.isStereo = false;
  // in degrees
  this.sphereFOV = new THREE.Vector2(0.0, 0.0);
  // in degrees
  this.sphereCentre = new THREE.Vector2(0.0, 0.0);
  // in uv coords (0,1)
  this.U_r = new THREE.Vector2(0.0, 0.0);
  this.V_r = new THREE.Vector2(1.0, 1.0);
  this.U_l = new THREE.Vector2(0.0, 0.0);
  this.V_l = new THREE.Vector2(1.0, 1.0);
};
},{}],3:[function(require,module,exports){
//
// renderMode values
// --
// variables: 
// 0: [one/two] viewports (e.g. mono vs L/R viewports)
// 1: [yes/no] analgyph (e.g. full viewport, render analglyph)
// 
// Render modes:
// 0  (00): one viewport, no anaglyph
// 2  (10): two viewports, no anaglyph
// 1  (01): one viewport, anaglyph
//
var StereographicProjection = {
  uniforms: {
    textureSource: { type: "t", value: 0 },
    imageResolution: { type: "v2", value: new THREE.Vector2() },
    transform: { type: "m4", value: new THREE.Matrix4() },
    sphereToTexU: { type: "v2", value: new THREE.Vector2() },
    sphereToTexV: { type: "v2", value: new THREE.Vector2() },
    texToUV: { type: "m3", value: new THREE.Matrix3() }
  },
  
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4( position, 1.0 );',
    '}'
  ].join('\n'),

  fragmentShader: [
    '#define PI 3.141592653589793',
    'uniform vec2 imageResolution;',
    'uniform sampler2D textureSource;',
    'uniform mat4 transform;',
    'uniform vec2 sphereToTexU;',
    'uniform vec2 sphereToTexV;',
    'uniform mat3 texToUV;',

    'varying vec2 vUv;',

    'void main(void) {',
    '  //normalize uv so it is between 0 and 1',
    '  vec2 uv = vUv;',
      
    '  float aspect = imageResolution.y/imageResolution.x;',
    //FOV: scale = 1.->FOV of ~120
    //FOV: scale = .5 -> FOV of ~60
    '  float scale = .625;',
      
    '  vec2 rads = vec2(PI * 2. , PI) ;',
    '  vec2 pnt = (uv - .5) * vec2(scale, scale * aspect);',
    '  float x2y2 = pnt.x * pnt.x + pnt.y * pnt.y;',
    '  vec3 _sphere_pnt = vec3(2. * pnt, x2y2 - 1.) / (x2y2 + 1.);',
    '  vec4 sphere_pnt = vec4(_sphere_pnt, 1.);',
    '  sphere_pnt *= transform;',
      
    '  // Convert to Spherical Coordinates',
    '  float r = length(sphere_pnt);',
      
    '  float lon = atan(sphere_pnt.y, sphere_pnt.x);',
      
    '  float lat = 2.0*(acos(sphere_pnt.z / r) - PI*.5) + PI*.5;',
    '  lon = mod(lon, 2.*PI);',
    
    '  vec2 sphereCoord = vec2(lon, lat) / rads;',  
    
    '  vec2 normCoord = sphereCoord - sphereToTexU;',
    
    '  vec2 vu = sphereToTexV - sphereToTexU;',
    '  normCoord.x = normCoord.x/vu.x;',
    '  normCoord.y = normCoord.y/vu.y;',
    
    '  if (normCoord.x<0.0 || normCoord.x>1.0 || normCoord.y<0.0 || normCoord.y>1.0) {',
    '    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); ',
    '    return;',
    '  } ',
    
    '  normCoord.x = mod(normCoord.x, 1.0);',
    '  normCoord.y = mod(normCoord.y, 1.0);',

    '  vec3 texCoord = vec3(normCoord, 1.0); ',
    '  vec3 uvCoord = texToUV * texCoord ;',    
    '  gl_FragColor = texture2D(textureSource, vec2(uvCoord.x, uvCoord.y));',
    '}',    
  ].join('\n')
};

// lifted from https://github.com/borismus/webvr-boilerplate/blob/master/src/cardboard-distorter.js
var ShaderPassQuad = function(shader) {
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

  this.material = new THREE.ShaderMaterial({
    defines: shader.defines || {},
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });

  this.material.depthTest = false;
  this.material.depthWrite = false;
  
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene  = new THREE.Scene();
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
  this.scene.add(this.quad);

  this.render = function(renderFunc) {
    this.quad.material = this.material;
    renderFunc(this.scene, this.camera);
  };
  
  this.copyMat = function () {
    this.quad.material = this.material;
  };
};

THREE.VRStereographicProjectionQuad = function () {
  this.shaderPassQuad = new ShaderPassQuad(StereographicProjection);
  this.textureDescription = 0;
  this.texToUV_l = new THREE.Matrix3();
  this.texToUV_r = new THREE.Matrix3();
  
  this.resizeViewport = function (resX, resY) {
    this.shaderPassQuad.uniforms.imageResolution.value.x = resX;
    this.shaderPassQuad.uniforms.imageResolution.value.y = resY;
  };
  
  this.setupProjection = function (textureDescription, initialResolutionX, initialResolutionY) {
    if ( this.shaderPassQuad.uniforms.textureSource.value )
      this.shaderPassQuad.uniforms.textureSource.value.dispose();
    this.textureDescription = textureDescription;
    this.shaderPassQuad.uniforms.textureSource.value = THREE.ImageUtils.loadTexture( textureDescription.textureSource );
    this.shaderPassQuad.uniforms.textureSource.value.magFilter = THREE.LinearFilter;
    this.shaderPassQuad.uniforms.textureSource.value.minFilter = THREE.LinearFilter;
    this.shaderPassQuad.uniforms.textureSource.value.wrapS = THREE.MirroredRepeatWrapping;
    this.shaderPassQuad.uniforms.textureSource.value.wrapT = THREE.MirroredRepeatWrapping;
//     this.shaderPassQuad.uniforms.textureSource.value.needsUpdate = true; 

    var fovX = textureDescription.sphereFOV.x/360.0;
    var fovY = textureDescription.sphereFOV.y/180.0;
        
    this.shaderPassQuad.uniforms.sphereToTexU.value.set( 0.5 - 0.5*fovX, 0.5 - 0.5*fovY );
    this.shaderPassQuad.uniforms.sphereToTexV.value.set( 0.5 + 0.5*fovX, 0.5 + 0.5*fovY );
        
    var t_r = textureDescription.V_r.sub(textureDescription.U_r);

      
    this.texToUV_r.set( t_r.x,  0,  textureDescription.U_r.x,
                              0, t_r.y, textureDescription.U_r.y,
                              0, 0,   1.0);
    
    var t_l = textureDescription.V_l.sub(textureDescription.U_l);
    this.texToUV_l.set( t_l.x,  0,  textureDescription.U_l.x,
                              0, t_l.y, textureDescription.U_l.y,
                              0, 0,   1.0);

    this.resizeViewport(initialResolutionX, initialResolutionY);
  };
   
  this.setLeft = function() {
    this.shaderPassQuad.uniforms.texToUV.value.copy(this.texToUV_l);
  };

  this.setRight = function() {
    this.shaderPassQuad.uniforms.texToUV.value.copy(this.texToUV_r);
  };
  
  this.preRender = function(cameraObject) {
    var quat = new THREE.Quaternion();
    quat.setFromRotationMatrix(cameraObject.matrixWorld);
    quat.conjugate();  
    var fixQuat = new THREE.Quaternion();
    fixQuat.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
    quat.multiply(fixQuat);
    fixQuat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 2 );
    quat.multiply(fixQuat);

    var pitch = Math.PI * (this.textureDescription.sphereCentre.x / -180.0);
    var yaw = Math.PI * (this.textureDescription.sphereCentre.y / 180.0);
//    // pitch adjustment (pi/2 is up, -pi/2 is down)
   fixQuat.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), pitch );
   quat.multiply(fixQuat);
//    // yaw adjustment (-PI->PI)
   fixQuat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), yaw );
   quat.multiply(fixQuat);
    
    this.shaderPassQuad.uniforms.transform.value.makeRotationFromQuaternion(quat);
    this.shaderPassQuad.copyMat();
  };
  
  this.render = function(renderer) {
    renderer.render(this.shaderPassQuad.scene, this.shaderPassQuad.camera);
  };
  
  this.renderToTex = function(renderer, tex) {
    renderer.render(this.shaderPassQuad.scene, this.shaderPassQuad.camera, tex, false);
  };
};
},{}],4:[function(require,module,exports){
THREE.VRViewerCameraRig = function ( parentTransform ) {
  this._topTransform = new THREE.Object3D();
  parentTransform.add(this._topTransform);
  this._hasMono = true;
  this._hasClassicStereo = false;
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
        
    this._hasClassicStereo = true;
  };
  
  this.update = function (camera) {
    if (this._hasClassicStereo) {
      camera.matrixWorld.decompose (this._topTransform.position, this._topTransform.quaternion, this._topTransform.scale);      
      this._topTransform.updateMatrixWorld();
      return;
    }
  };
  
};
},{}],5:[function(require,module,exports){
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







},{"./ShaderPassAnaglyph.js":1}],6:[function(require,module,exports){
require('./TextureDescription.js');
require('./VRViewerEffect.js');
require('./VRViewerCameraRig.js');
require('./ShaderPassAnaglyph.js');
require('./VRStereographicProjectionQuad.js');
},{"./ShaderPassAnaglyph.js":1,"./TextureDescription.js":2,"./VRStereographicProjectionQuad.js":3,"./VRViewerCameraRig.js":4,"./VRViewerEffect.js":5}]},{},[6]);
