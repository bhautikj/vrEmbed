var twgl = require('../js-ext/twgl-full.js');

VRtwglQuad = function() {
  var self = this;

  this.container = null;
  this.canvas = null;
  this.canvas2d = null;
  this.glContext = null;
  this.programInfo = null;
  this.bufferInfo = null;
  this.parentElement = null;
  this.uniforms = null;
  this.fbSize = 4;
  this.canvas2dWidth = 1024;
  this.canvas2dHeight = 1024;
  this.viewportDims = [0,0];


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
    this.container = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.canvas2d = document.createElement('canvas');

    var t = this.canvas.style;
    // t.height = "100%";
    // t.width = "100%";
    t.display = "block";
    t.position = 'absolute';

    var s = this.canvas2d.style;
    s.position = 'absolute';
    s.marginLeft = 'auto';
    s.marginRight = 'auto';
    s.backgroundSize = 'cover';
    s.backgroundColor = 'transparent';
    s.border = 0;
    s.userSelect = 'none';
    s.webkitUserSelect = 'none';
    s.MozUserSelect = 'none';
    s.opacity = '1.0';
    s.left = 0;
    s.right = 0;
    s.top = '0px';
    s.height = "100%";
    s.width = "100%";
    // s.display = "block";

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.canvas2d);
    elm.appendChild(this.container);

    this.glContext = twgl.getWebGLContext(this.canvas);
    this.initCore(vs, fs);
  }

  this.setCanvasFullscreen = function() {
    var t = this.canvas.style;
    t.position = 'relative';

    var s = this.canvas2d.style;
    s.height = "100vh";
    s.width = "100vw";
  }

  this.setCanvasWindowed = function() {
    var t = this.canvas.style;
    // t.height = "100%";
    // t.width = "100%";
    t.position = 'absolute';

    var s = this.canvas2d.style;
    s.height = "100%";
    s.width = "100%";
  }

  this.initFramebuffer = function(fbSize, glContext, vs, fs) {
    this.glContext = glContext;
    this.initCore(vs, fs);
    this.fbSize = fbSize;
    var attachments = [
      { format: this.glContext.RGBA, type: this.glContext.UNSIGNED_BYTE, min: this.glContext.LINEAR, mag: this.glContext.LINEAR, wrap: this.glContext.CLAMP_TO_EDGE },
      // { format: this.glContext.DEPTH_STENCIL, },
    ];
    this.framebufferInfo = twgl.createFramebufferInfo(this.glContext, attachments, this.fbSize, this.fbSize);
  }

  this.getFramebufferTexture = function() {
    return this.framebufferInfo.attachments[0];
  }

  this.getFramebufferSize = function() {
    return this.fbSize;
  }

  this.fixViewportSize = function() {
    // Get the canvas from the WebGL context
    var canvas = self.glContext.canvas;

    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = self.parentElement.clientWidth;
    var displayHeight = self.parentElement.clientHeight;

    var devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(displayWidth * devicePixelRatio);
    canvas.height = Math.floor(displayHeight * devicePixelRatio);
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    self.glContext.viewport(0, 0, Math.floor(displayWidth * devicePixelRatio), Math.floor(displayHeight * devicePixelRatio));

    // document.getElementById("log").innerHTML = "actual:" + self.container.width + " style:" + self.container.style.width;
    //
    // var res = 2048;
    // canvas.width = res;
    // canvas.height = res;
    // canvas.style.width = displayWidth + "px";
    // canvas.style.height = displayHeight + "px";
    // self.glContext.viewport(0, 0, res, res);
  }

  this.resize = function() {
    this.fixViewportSize();

    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = self.parentElement.clientWidth;
    var displayHeight = self.parentElement.clientHeight;

    // pin to width
    var ctx = this.canvas2d.getContext("2d");
    this.canvas2dHeight = Math.floor(this.canvas2dWidth*displayHeight/displayWidth);
    ctx.canvas.width  = this.canvas2dWidth;
    ctx.canvas.height = this.canvas2dHeight;
    // console.log(this.canvas2dWidth + ',' + this.canvas2dHeight)
  }

  this.setUniforms = function(uniforms) {
      this.uniforms = uniforms;
  }

  this.render = function() {
    //var devicePixelRatio = window.devicePixelRatio || 1;
    //twgl.resizeCanvasToDisplaySize(self.glContext.canvas, devicePixelRatio);
    self.glContext.useProgram(self.programInfo.program);
    twgl.setBuffersAndAttributes(self.glContext, self.programInfo, self.bufferInfo);
    twgl.setUniforms(self.programInfo, this.uniforms);
    twgl.drawBufferInfo(self.glContext, self.glContext.TRIANGLES, self.bufferInfo);
  }

  this.get2dContext = function() {
    if (self.canvas2d == null)
      return null;

    return [self.canvas2d.getContext("2d"), self.canvas2dWidth, self.canvas2dHeight];
  }

  this.clearFrameBuffer = function(r, g, b, a) {
    twgl.bindFramebufferInfo(self.glContext, self.framebufferInfo);
    this.glContext.clearColor(r, g, b, a);
    this.glContext.clear(this.glContext.COLOR_BUFFER_BIT);
    twgl.bindFramebufferInfo(self.glContext, null);
  }

  this.renderFramebuffer = function() {
    twgl.bindFramebufferInfo(self.glContext, self.framebufferInfo);
    this.render();
    twgl.bindFramebufferInfo(self.glContext, null);
  }
}

module.exports = VRtwglQuad;
