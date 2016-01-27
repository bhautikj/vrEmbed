VRtwglQuad = require('./VRtwglQuad.js');
var twgl = require('../js-ext/twgl-full.js');

var vsTex = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fsTex = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = texture2D(textureSource, uv);\n"+
"}\n";

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  if (uv.x>0.5 && uv.y>0.5)\n"+
"    gl_FragColor = vec4( 0.0, 0.0, 1.0, 1.0 );\n"+
"  else\n"+
"    gl_FragColor = vec4( uv.x,uv.y, 0.0, 1.0 );\n"+
"}\n";


VRtwglQuadTestBuffer = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.vrtwglQuadFb = null;

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vsTex, fsTex);

    this.vrtwglQuadFb = new VRtwglQuad();
    this.vrtwglQuadFb.initFramebuffer(2048, this.vrtwglQuad.glContext, vs, fs);

    //var gl = this.vrtwglQuad.glContext;
    //this.glTex = twgl.createTexture(gl, {min: gl.LINEAR,mag: gl.LINEAR, src: 'rheingauer_dom.jpg'});
  }

  this.getContainer = function() {
    return this.vrtwglQuad.container;
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.render = function() {
    var uniformsFb = {
      resolution: [2048, 2048]
    };

    self.vrtwglQuadFb.setUniforms(uniformsFb);
    self.vrtwglQuadFb.renderFramebuffer();

    var uniforms = {
      resolution: [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight],
      textureSource: self.vrtwglQuadFb.getFramebufferTexture() //this.glTex
    };

    self.vrtwglQuad.setUniforms(uniforms);
    self.vrtwglQuad.render();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

}

module.exports = VRtwglQuadTestBuffer;
