var THREE = require('../js-ext/three.js');

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
THREE.VRShaderPassAnaglyph = function() {
  var shader = AnaglyphProjection;

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
};

module.exports = THREE.VRShaderPassAnaglyph;