"use strict"

var twgl = require('../js-ext/twgl.js');

VRtwglQuad = function() {
  this.canvas = null;
  this.glContext = null;
  this.programInfo = null;
  this.bufferInfo = null;

  this.init = function (elm, vs, fs){
    this.canvas = document.createElement('canvas');
    elm.appendChild(this.canvas);

    this.glContext = twgl.getWebGLContext(canvas);
    this.programInfo = twgl.createProgramInfo(this.glContext , [vs, fs]);

    var arrays = {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.glContext, arrays);
  }

  this.resize = function(width, height) {
    // dummy op, not w/h actually needed with twgl
    twgl.resizeCanvasToDisplaySize(this.glContext.canvas);
  }

  this.render = function() {
    var uniforms = {
      resolution: [this.glContext.canvas.width, this.glContext.canvas.height],
    };

    this.glContext.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(this.glContext, this.programInfo, this.bufferInfo);
    twgl.setUniforms(this.programInfo, uniforms);
    twgl.drawBufferInfo(this.glContext, gl.TRIANGLES, this.bufferInfo);
  }
}

module.exports = VRtwglQuad;
