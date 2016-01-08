VRtwglQuad = require('./VRtwglQuad.js');
twgl = require('../js-ext/twgl-full.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

// equations - see: http://stackoverflow.com/a/1185413
var fs = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
//"  uv = 2.*uv;\n"+
"  float lat = uv.y;\n"+
"  float lon = uv.x;\n"+
"  vec4 sphere_pnt = vec4(cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat), 1.);\n"+
"  sphere_pnt *= transform;\n"+
"  float finalLat = asin(sphere_pnt.z);\n"+
"  float finalLon = atan(sphere_pnt.y, sphere_pnt.x);\n"+
"  gl_FragColor = texture2D(textureSource, vec2(finalLon, finalLat));\n"+
"}\n"


VRtwglQuadStereoProjection = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.uniforms = {
    resolution:[0,0],
    textureSource:null,
    transform:twgl.m4.identity()
  };

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fs);
    //twgl.m4.rotateZ(this.uniforms.transform, 0, this.uniforms.transform); // yaw
    //var axis = twgl.v3.create(0,1,0);
    //twgl.m4.axisRotate(this.uniforms.transform, axis, Math.PI/2, this.uniforms.transform);
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.render = function() {
    this.uniforms["resolution"] = [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight];
    //twgl.m4.rotateX(this.uniforms.transform, 0.01, this.uniforms.transform);


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
