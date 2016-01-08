VRtwglQuad = require('./VRtwglQuad.js');
twgl = require('../js-ext/twgl-full.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = 1. - uv.y;\n"+
"  vec2 uvOfs = vec2(.5,.5);\n"+
//"  vec2 pnt = (uv - uvOfs) * vec2(scale, scale * aspect);",
"  vec2 pnt = (2.*uv - uvOfs);\n"+
"  float x2y2 = pnt.x * pnt.x + pnt.y * pnt.y;\n"+
"  vec3 _sphere_pnt = vec3(2. * pnt, x2y2 - 1.) / (x2y2 + 1.);\n"+
"  vec4 sphere_pnt = vec4(_sphere_pnt, 1.);\n"+
"  vec2 rads = vec2(PI * 2. , PI) ;\n"+
"  // Convert to Spherical Coordinates\n"+
"  float r = length(sphere_pnt);\n"+
"  float lon = atan(sphere_pnt.y, sphere_pnt.x);\n"+
"  float lat = 2.0*(acos(sphere_pnt.z / r) - PI*.5) + PI*.5;\n"+
"  lon = mod(lon, 2.*PI);\n"+
"  vec2 sphereCoord = vec2(lon, lat) / rads;\n"+
//"  gl_FragColor = texture2D(textureSource, vec2(uv.x, uv.y));\n"+
"  gl_FragColor = texture2D(textureSource, sphereCoord);\n"+
"}\n"


VRtwglQuadStereoProjection = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.uniforms = {
    resolution:[0,0],
    textureSource:null
  };

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fs);
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.render = function() {
    this.uniforms["resolution"] = [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight];

    self.vrtwglQuad.setUniforms(this.uniforms);
    self.vrtwglQuad.render();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

  this.setupProjection = function (textureDescription) {
    var gl = self.vrtwglQuad.glContext;
    var tex = twgl.createTexture(gl, {
      min: gl.LINEAR,
      mag: gl.LINEAR,
      src: textureDescription.textureSource,
      crossOrigin: "", // either this or use twgl.setDefaults
    });

    this.uniforms["textureSource"] = tex;
  }


}

module.exports = VRtwglQuadStereoProjection;
