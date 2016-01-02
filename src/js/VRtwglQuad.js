var twgl = require('../js-ext/twgl.js');

VRtwglQuad = function() {
  this.canvas = null;
  this.glContext = null;
  this.programInfo = null;
  this.bufferInfo = null;
  this.parentElement = null;
  var self = this;

  this.init = function (elm, vs, fs){
    this.parentElement = elm.parentNode;
    this.canvas = document.createElement('canvas');
    elm.appendChild(this.canvas);

    this.glContext = twgl.getWebGLContext(this.canvas);
    this.programInfo = twgl.createProgramInfo(this.glContext , [vs, fs]);

    var arrays = {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.glContext, arrays);
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

  this.render = function() {
    //console.log(self.glContext.canvas.width, self.glContext.canvas.height);
    //console.log(self.canvas.clientWidth, self.canvas.clientHeight);
    var uniforms = {
      resolution: [self.canvas.clientWidth, self.canvas.clientHeight],
    };

    self.glContext.useProgram(self.programInfo.program);
    twgl.setBuffersAndAttributes(self.glContext, self.programInfo, self.bufferInfo);
    twgl.setUniforms(self.programInfo, uniforms);
    twgl.drawBufferInfo(self.glContext, self.glContext.TRIANGLES, self.bufferInfo);
    // console.log("RENDER");
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }
}

module.exports = VRtwglQuad;
