VRTextureDescription = require('./VRTextureDescription.js');
var twgl = require('../js-ext/twgl-full.js');

function roundRect(ctx, x, y, w, h, r)
{
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function VRCanvasBase() {
  this.gl = null;
  this.glTex = null;
  this.backupTex = null;
  this.vrTextureDescription = null;
  this.canvas = null;
  this.ctx = null;
}

VRCanvasBase.prototype.initBase = function(gl) {
  this.vrTextureDescription = new VRTextureDescription();
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.canvas.width  = 2048;
  this.ctx.canvas.height = 2048;
  this.gl=gl;
}


VRCanvasBase.prototype.teardown = function() {
  // document.removeChild(this.canvas);
}

VRCanvasBase.prototype.updateBase = function() {
  if(this.gl!=null) {
    if (this.glTex!=null) {
      this.gl.deleteTexture(this.glTex);
    }
    this.glTex = twgl.createTexture(this.gl, {min: this.gl.LINEAR,mag: this.gl.LINEAR, src: this.ctx.canvas});
  }
}

VRCanvasSpinner = function() {};
VRCanvasSpinner.prototype = new VRCanvasBase();
VRCanvasSpinner.prototype.init = function(gl) {
  this.initBase(gl);
}
VRCanvasSpinner.prototype.update = function(time) {
  this.ctx.fillStyle = "#00f";
  this.ctx.strokeStyle = "#ff0";
  this.ctx.lineWidth = "10";
  this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  this.ctx.beginPath();
  this.ctx.arc(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2, this.ctx.canvas.width / 2.2 * Math.abs(Math.cos(time)), 0, Math.PI * 2);
  this.ctx.stroke();
  this.updateBase();
}

VRCanvasTextBox = function() {};
VRCanvasTextBox.prototype = new VRCanvasBase();
VRCanvasTextBox.prototype.init = function(gl, message, hfov, options) {
  this.initBase(gl);
  var fontface = options.hasOwnProperty("fontface") ?
    options["fontface"] : "Arial";

  var fontsize = options.hasOwnProperty("fontsize") ?
    options["fontsize"] : 12;

  var borderThickness = options.hasOwnProperty("borderThickness") ?
    options["borderThickness"] : 4;

  var borderColor = options.hasOwnProperty("borderColor") ?
    options["borderColor"] : { r:0, g:0, b:0, a:0.7 };

  var backgroundColor = options.hasOwnProperty("backgroundColor") ?
    options["backgroundColor"] : { r:255, g:255, b:255, a:0.7};

  this.ctx.font = "Bold " + fontsize + "px " + fontface;
  //this.ctx.font="72px Arial";
  //this.ctx.font = fontsize + "px " + fontface;
  //console.log(this.ctx.font);

  var heightMult = 1.4;//12->1.4
  // get size data (height depends only on font size)
  var metrics = this.ctx.measureText( message );
  var textWidth = metrics.width;
  this.ctx.canvas.width  = (textWidth + 2*borderThickness);
  this.ctx.canvas.height = (fontsize *heightMult + 2*borderThickness);

  // background color
  this.ctx.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                  + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  this.ctx.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                  + borderColor.b + "," + borderColor.a + ")";

  // debug
  // this.ctx.fillStyle = "blue";
  // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.width);

  this.ctx.lineWidth = borderThickness;
  roundRect(this.ctx, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize *heightMult + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.


  // text color
  this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

  this.ctx.font = "Bold " + fontsize + "px " + fontface;
  this.ctx.textAlign="start";
  this.ctx.fillText( message, borderThickness, fontsize + borderThickness);

  var w = this.ctx.canvas.width;
  var h = this.ctx.canvas.height;
  this.vrTextureDescription.sphereFOV = [hfov,h*hfov/w];
}

VRCanvasTextBox.prototype.update = function(time) {
  this.updateBase();
}

VRCanvasFactoryCore = function() {
  this.createCanvasSpinner = function() {
    return new VRCanvasSpinner();
  }
  this.createCanvasTextBox = function() {
    return new VRCanvasTextBox();
  }
}

var VRCanvasFactory = (function () {
    var instance;

    function createInstance() {
        var object = new VRCanvasFactoryCore();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = VRCanvasFactory.getInstance();
