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
  this.fbSize = 2048;
  this.canvas2dWidth = 1024;
  this.canvas2dHeight = 1024;
  this.realSize = [0,0];

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

  //TODO: READ!
  // https://www.khronos.org/webgl/wiki/HandlingHighDPI
  // http://stackoverflow.com/questions/15892387/how-to-render-webgl-content-using-high-dpi-devices
  this.init = function (elm, vs, fs){
    this.parentElement = elm.parentNode;
    this.container = document.createElement('div');
    var ds = this.container.style;
    ds.width = "100%";
    ds.height = "100%";
    ds.margin = "0px";
    ds.padding = "0px";

    this.canvas = document.createElement('canvas');
    this.canvas2d = document.createElement('canvas');

    var t = this.canvas.style;
    t.height = "100%";
    t.width = "100%";
    // t.height = this.realSize[0]+"px";
    // t.width = this.realSize[1]+"px";
    // t.display = "block";
    // t.position = 'absolute';

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
    // t.height = this.realSize[0];
    // t.width = this.realSize[1];

    var s = this.canvas2d.style;
    s.height = "100vh";
    s.width = "100vw";
  }

  this.setCanvasWindowed = function() {
    var t = this.canvas.style;
    t.height = "100%";
    t.width = "100%";
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

  this.resize = function() {
    // Get the canvas from the WebGL context
    var canvas = self.glContext.canvas;
    var realToCSSPixels = window.devicePixelRatio || 1;
    // var realToCSSPixels = 3;

    // Lookup the size the browser is displaying the canvas.
    //var displayWidth  = self.parentElement.clientWidth;
    //var displayHeight = self.parentElement.clientHeight;
    var displayWidth  = Math.floor(canvas.clientWidth  * realToCSSPixels);
    var displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

    self.realSize = [displayWidth, displayHeight];

    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {

      // self.canvas.style.width = displayWidth+"px";
      // self.canvas.style.height = displayHeight+"px";

      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
      // console.log("resz:" + canvas.width+","+canvas.height);
      // Set the viewport to match
      self.glContext.viewport(0, 0, displayWidth, displayHeight);


      // var maxdims = self.glContext.getParameter(self.glContext.MAX_VIEWPORT_DIMS);
      // var dims =  self.glContext.getParameter( self.glContext.VIEWPORT);
      // document.getElementById("log").innerHTML = "r2c:" + window.devicePixelRatio;
      // document.getElementById("log").innerHTML += "maxdims:" + maxdims[0] + "," + maxdims[1];
      // document.getElementById("log").innerHTML += "dims:" + dims[0] + "," + dims[1] +"," + dims[2] + "," + dims[3];
      //
      // document.getElementById("log").innerHTML += " display:" + displayWidth+","+displayHeight;
      // document.getElementById("log").innerHTML += " htmlcanvas:" + this.canvas.width+","+this.canvas.height;
      // document.getElementById("log").innerHTML += " canvas:" + canvas.width+","+canvas.height;
      // document.getElementById("log").innerHTML += " pcanvas:" + this.canvas.style.width+","+this.canvas.style.height;
    }

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
    // twgl.resizeCanvasToDisplaySize(self.glContext.canvas, window.devicePixelRatio);
    // var maxdims = self.glContext.getParameter(self.glContext.MAX_VIEWPORT_DIMS);
    // var dims =  self.glContext.getParameter( self.glContext.VIEWPORT);
    // document.getElementById("log").innerHTML = "r2c:" + window.devicePixelRatio;
    // document.getElementById("log").innerHTML += "maxdims:" + maxdims[0] + "," + maxdims[1];
    // document.getElementById("log").innerHTML += "dims:" + dims[0] + "," + dims[1] +"," + dims[2] + "," + dims[3];
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
