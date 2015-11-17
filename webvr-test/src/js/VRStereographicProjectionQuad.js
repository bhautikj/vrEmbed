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
    //TODO: passthrough FOV
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
//TODO: render background colour if bottom layer!
//     '    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);',
    '    // exits fragment shader here',
    '    discard;',
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