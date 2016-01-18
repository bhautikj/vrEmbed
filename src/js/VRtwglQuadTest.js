VRtwglQuad = require('./VRtwglQuad.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  gl_FragColor = vec4( uv.x,uv.y, 0.0, 1.0 );\n"+
"}\n";


VRtwglQuadTest = function() {
  var self = this;
  this.vrtwglQuad = null;

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fs);
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.getContainer = function() {
    return this.vrtwglQuad.container;
  }

  this.render = function() {
    var uniforms = {
      resolution: [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight],
    };

    self.vrtwglQuad.setUniforms(uniforms);
    self.vrtwglQuad.render();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

}

module.exports = VRtwglQuadTest;
