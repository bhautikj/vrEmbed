var twgl = require('../js-ext/twgl-full.js');

VRtwglQuad = function() {
  var self = this;

  this.canvas = null;
  this.glContext = null;
  this.programInfo = null;
  this.bufferInfo = null;
  this.parentElement = null;
  this.uniforms = null;
  this.fbSize = 2048;

  this.initCore = function(vs, fs) {
    this.programInfo = twgl.createProgramInfo(this.glContext , [vs, fs]);

    var arrays = {
      position: [-1, -1, 0, //bottom left
                 1, -1, 0, //bottom right
                 -1, 1, 0, //top left
                 -1, 1, 0, //top left
                 1, -1, 0, //bottom right
                 1, 1, 0 //top right
                 ],
        };

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.glContext, arrays);
  }

  this.init = function (elm, vs, fs){
    this.parentElement = elm.parentNode;
    this.canvas = document.createElement('canvas');
    elm.appendChild(this.canvas);
    this.glContext = twgl.getWebGLContext(this.canvas);

    this.initCore(vs, fs);
  }

  this.initFramebuffer = function(fbSize, glContext, vs, fs) {
    this.glContext = glContext;
    this.initCore(vs, fs);
    this.fbSize = fbSize;
    this.framebufferInfo = twgl.createFramebufferInfo(this.glContext, undefined, this.fbSize, this.fbSize);
  }

  this.getFramebufferTexture = function() {
    return this.framebufferInfo.attachments[0];
  }

  this.getFramebufferSize = function() {
    return this.fbSize;
  }

  this.resize = function() {
    // Get the canvas from the WebGL context
    var canvas = self.glContext.canvas;

    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = self.parentElement.clientWidth;
    var displayHeight = self.parentElement.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {

      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;

      // Set the viewport to match
      self.glContext.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  this.setUniforms = function(uniforms) {
      this.uniforms = uniforms;
  }

  this.render = function() {
    self.glContext.useProgram(self.programInfo.program);
    twgl.setBuffersAndAttributes(self.glContext, self.programInfo, self.bufferInfo);
    twgl.setUniforms(self.programInfo, this.uniforms);
    twgl.drawBufferInfo(self.glContext, self.glContext.TRIANGLES, self.bufferInfo);
  }

  this.renderFramebuffer = function() {
    twgl.bindFramebufferInfo(self.glContext, self.framebufferInfo);
    this.render();
    twgl.bindFramebufferInfo(self.glContext, null);
  }
}

module.exports = VRtwglQuad;
