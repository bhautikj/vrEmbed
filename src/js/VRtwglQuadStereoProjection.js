VRtwglQuad = require('./VRtwglQuad.js');
twgl = require('../js-ext/twgl-full.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = -1.*gl_FragCoord.xy / resolution;\n"+
"  gl_FragColor = texture2D(textureSource, vec2(uv.x, uv.y));\n"+
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
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: textureDescription.textureSource,
      crossOrigin: "", // either this or use twgl.setDefaults
    });

    this.uniforms["textureSource"] = tex;
  }


}

module.exports = VRtwglQuadStereoProjection;
