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

/*
 * Texture transform: viewport-to-viewport
 *
 * Sphere
 * ======
 * 0------------------------+
 * |     a-----.            |
 * |     |  C  |            |
 * |     .-----b            |
 * +------------------------1
 * 
 * Parameters:
 * --
 * fovx: width of image in sphere
 * fovy: height of image in sphere
 * 
 * C: where to place in sphere
 * => a.x = C.x-0.5*fovx
 * => b.x = C.x+0.5*fovx
 * => a.y = C.y-0.5*fovy
 * => b.y = C.y+0.5*fovy
 * 
 * Texture
 * =======
 * 0--------+
 * |  u--.  |
 * |  |  |  |
 * |  .--v  |
 * +--------1
 * 
 * Parameters:
 * --
 * (u,v): supplied, corners of tex rect
 * 
 * Sphere->Texture
 * ===============
 * 
 * For an arbitrary point S on the sphere, 0<X<1, mapping to 
 * texture coordinate T:
 * 
 * Let s = (b-a)
 * Let t = (v-u)
 * 
 * First transform sphere coord to normalized texture coord using:
 * 
 *         [ s.x  0   -a.x ] 
 * n = S * [  0  s.y  -a.y ]
 *         [  0   0    0   ]
 * 
 * if n<0 || n>1, don't render it.
 * 
 * Then finally convert n to actual uv texture coord using:
 *         [ t.x  0  u.x ] 
 * T = n * [  0  t.y u.y ]
 *         [  0   0   1  ] 
 * 
 */

TextureDescription = function () {
  this.textureSource = "";
  this.metaSource = "";
  this.isStereo = false;
  // in degrees
  this.sphereFOV = new THREE.Vector2(0.0, 0.0);
  // in degrees
  this.sphereCentre = new THREE.Vector2(0.0, 0.0);
  // in uv coords (0,1)
  this.U = new THREE.Vector2(0.0, 0.0);
  this.V = new THREE.Vector2(1.0, 1.0);
};

THREE.VRViewerEffect = function ( renderer, mode, onError ) {
  var vrHMD;
  var vrCameraRig;
  var vrTopTransform;
  var renderMode = mode;
  var vrStereographicProjectionQuad = new THREE.VRStereographicProjectionQuad();
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
  
  if ( navigator.getVRDevices ) {
    vrTopTransform = new THREE.Object3D();
    vrCameraRig = new THREE.VRViewerCameraRig(vrTopTransform);
    navigator.getVRDevices().then( gotVRDevices );
  }

  //

  vrCameraRig.scale = 1;

  this.setSize = function( width, height ) {
    vrStereographicProjectionQuad.resizeViewport(width, height);
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
    
    // Render modes:
    // 0  (000): one texture, one viewport, no anaglyph
    // 1  (001): two textures, one viewport, no anaglyph
    // 2  (010): one texture, two viewports, no anaglyph
    // 3  (011): two textures, two viewports, no anaglyph
    // 4  (100): INVALID MODE one texture, one viewport, anaglyph
    // 5  (101): two textures, one viewport, anaglyph
    // 6  (110): INVALID MODE one texture, two viewports, anaglyph
    // 7  (111): INVALID MODE two textures, two viewports, anaglyph  
    
    
    if (renderMode == 0) {
      // Regular render mode if not HMD
      if ( Array.isArray( scene ) ) scene = scene[ 0 ];
      vrCameraRig.update(camera);
      // render pano
      // TODO: only run if mode says yes
      vrStereographicProjectionQuad.render(camera, renderer);
      renderer.render( scene, camera );
      return;
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
      vrStereographicProjectionQuad.render(cameraL, renderer);
      renderer.render( scene, cameraL );

      // render right eye
      renderer.setViewport( size.width, 0, size.width, size.height );
      renderer.setScissor( size.width, 0, size.width, size.height );
      vrStereographicProjectionQuad.render(cameraR, renderer);
      renderer.render( scene, cameraR );
      renderer.enableScissorTest( false );
      //------------------
      // END RENDER BLOCK
      //------------------

      return;

    }
  }; 
};

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

//
// renderMode values
// --
// variables: 
// 0: [one/two] textures (e.g. mono vs stereo textures)
// 1: [one/two] viewports (e.g. mono vs L/R viewports)
// 2: [yes/no] analgyph (e.g. full viewport, render analglyph)
// 
// Render modes:
// 0  (000): one texture, one viewport, no anaglyph
// 1  (001): two textures, one viewport, no anaglyph
// 2  (010): one texture, two viewports, no anaglyph
// 3  (011): two textures, two viewports, no anaglyph
// 4  (100): INVALID MODE one texture, one viewport, anaglyph
// 5  (101): INVALID MODE two textures, one viewport, anaglyph
// 6  (110): INVALID MODE one texture, two viewports, anaglyph
// 7  (111): INVALID MODE two textures, two viewports, anaglyph
//
var StereographicProjection = {
  uniforms: {
    textureSource: { type: "t", value: 0 },
    imageResolution: { type: "v2", value: new THREE.Vector2() },
    transform: { type: "m4", value: new THREE.Matrix4() },
    sphereToTex: { type: "m3", value: new THREE.Matrix3() },
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
    'uniform mat3 sphereToTex;',
    'uniform mat3 texToUV;',

    'varying vec2 vUv;',

    'void main(void) {',
    '  //normalize uv so it is between 0 and 1',
    '  vec2 uv = vUv;',
      
    '  float aspect = imageResolution.y/imageResolution.x;',
    '  float scale = 1.;',
      
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

    '  // deal with discontinuity in atan. robust-ish. this ',
    '  // makes it robusty. Adds robustiness.',
    '  if (abs(sphere_pnt.y)<1e-3 && abs(sphere_pnt.x-1.0)<1.) ',
    '    lon = 0.0; ',
    
    '  vec3 sphereCoord = vec3(vec2(lon, lat) / rads, 1.0);',    
    '  vec3 texCoord = sphereCoord * sphereToTex;',
    
    '  if (texCoord.x<0.0 || texCoord.x>1.0 || texCoord.y<0.0 || texCoord.y>1.0) {',
    '    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); ',
    '    return;',
    '  } ',

    '  vec3 uvCoord = texCoord * texToUV;',    
    '  gl_FragColor = texture2D(textureSource, vec2(uvCoord.x, uvCoord.y));',
    '}',    
  ].join('\n')
};

// lifted from https://github.com/borismus/webvr-boilerplate/blob/master/src/cardboard-distorter.js
var ShaderPass = function(shader) {
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
  this.shaderPass = new ShaderPass(StereographicProjection);
  
  this.resizeViewport = function (resX, resY) {
    this.shaderPass.uniforms.imageResolution.value.x = resX;
    this.shaderPass.uniforms.imageResolution.value.y = resY;
  };
  
  this.setupProjection = function (textureDescription, initialResolutionX, initialResolutionY) {
    this.shaderPass.uniforms.textureSource.value = THREE.ImageUtils.loadTexture( textureDescription.textureSource );

    var fovX = textureDescription.sphereFOV.x/360.0;
    var fovY = textureDescription.sphereFOV.y/180.0;
    var cX = textureDescription.sphereCentre.x/360.0;
    var cY = textureDescription.sphereCentre.y/180.0;   
    
    var a = new THREE.Vector2(cX-0.5*fovX, cY-0.5*fovY);
    
//     alert(fovX + "," + fovY + "," + -1.0*a.x + "," + -1.0*a.y);
    
//     this.shaderPass.uniforms.sphereToTex.value.set( 1.0/fovX,  0,  0.0,
//                                                    0,  1.0/fovY, 0.0,
//                                                    -1.0*a.x, -1.0*a.y,   1.0);
    
    this.shaderPass.uniforms.sphereToTex.value.set( 360.0/textureDescription.sphereFOV.x,  0.0,  0.0,
                                                   0.0,  180.0/textureDescription.sphereFOV.y, 0.0,
                                                   -1.5,   -0.5,   1.0);
    
    var t = textureDescription.V.sub(textureDescription.U);
    this.shaderPass.uniforms.texToUV.value.set( t.x,  0,  -1.0*textureDescription.U.x,
                                                0,  t.y, -1.0*textureDescription.U.y,
                                                0,   0,   1.0);

    this.resizeViewport(initialResolutionX, initialResolutionY);
  };
    
  this.render = function(cameraObject, renderer) {
    var quat = new THREE.Quaternion();
    quat.setFromRotationMatrix(cameraObject.matrixWorld);
    quat.conjugate();  
    var fixQuat = new THREE.Quaternion();
    fixQuat.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
    quat.multiply(fixQuat);
    fixQuat.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 2 );
    quat.multiply(fixQuat);
    
    this.shaderPass.uniforms.transform.value.makeRotationFromQuaternion(quat);
    this.shaderPass.copyMat();
    renderer.render(this.shaderPass.scene, this.shaderPass.camera);
  };
};
