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

VRCanvasArrow = function() {};
VRCanvasArrow.prototype = new VRCanvasBase();
VRCanvasArrow.prototype.init = function(gl, hfov, isLeft) {
  this.initBase(gl);
  this.ctx.canvas.width  = 256;
  this.ctx.canvas.height = 256;
  this.isLeft = isLeft;
  this.vrTextureDescription.sphereFOV = [hfov,hfov];
}

VRCanvasArrow.prototype.update = function(time) {
  this.ctx.beginPath();
  this.ctx.lineWidth = 32;
  this.ctx.strokeStyle = 'rgba(0,0,0,1.0)';
  this.ctx.fillStyle = 'rgba(255,255,255,1.0)';
  if (this.isLeft == false) {
    this.ctx.moveTo(128,32);
    this.ctx.lineTo(224,128);
    this.ctx.lineTo(128,224);
    //haft
    this.ctx.lineTo(128,168);
    this.ctx.lineTo(32,168);
    this.ctx.lineTo(32,88);
    //arrow top
    this.ctx.lineTo(128,88);
    this.ctx.lineTo(128,32);
  } else {
    this.ctx.moveTo(128,32);
    this.ctx.lineTo(32,128);
    this.ctx.lineTo(128,224);
    //haft
    this.ctx.lineTo(128,168);
    this.ctx.lineTo(224,168);
    this.ctx.lineTo(224,88);
    //arow top
    this.ctx.lineTo(128,88);
    this.ctx.lineTo(128,32);
  }
  this.ctx.closePath();
  this.ctx.stroke();
  this.ctx.fill();
  this.updateBase();
}


//via: http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/

function wrapText(context, text, maxWidth) {
  var words = text.split(' ');
  var line = '';
  var lineSet = [];
  var maxw = 0;
  var lastWidth = 0;

  var testWidth = 0;
  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (testWidth > maxw){
        maxw = lastWidth;
      }
      lineSet.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
    lastWidth = testWidth;
  }

  lineSet.push(line);

  if (lineSet.length == 1) {
    maxw = testWidth;
  }

  return [lineSet, maxw*1.1];
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
    options["borderThickness"] : 1;

  var borderColor = options.hasOwnProperty("borderColor") ?
    options["borderColor"] : { r:255, g:255, b:255, a:1.0 };

  var backgroundColor = options.hasOwnProperty("backgroundColor") ?
    options["backgroundColor"] : { r:0, g:0, b:0, a:1.0};

  this.ctx.font = "Bold " + fontsize + "px " + fontface;
  //this.ctx.font="72px Arial";
  //this.ctx.font = fontsize + "px " + fontface;
  //console.log(this.ctx.font);

  var heightMult = 1.4;//12->1.4
  // get size data (height depends only on font size)
  var lineSetData = wrapText(this.ctx, message, this.ctx.canvas.width/2);
  var lineSet = lineSetData[0];
  var textWidth = lineSetData[1];

  this.ctx.canvas.width  = (textWidth + 4*borderThickness);
  this.ctx.canvas.height = (lineSet.length*fontsize *heightMult + 2*borderThickness);

  // background color
  this.ctx.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                  + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  this.ctx.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                  + borderColor.b + "," + borderColor.a + ")";

  this.ctx.lineWidth = borderThickness;
  roundRect(this.ctx, borderThickness/2, borderThickness/2, textWidth + borderThickness, lineSet.length*fontsize *heightMult + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  this.ctx.fillStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                       + borderColor.b + "," + borderColor.a + ")";
  this.ctx.font = fontsize + "px " + fontface;
  this.ctx.textAlign="start";

  for(var n = 0; n < lineSet.length; n++) {
    var line = lineSet[n];
    this.ctx.fillText( line, borderThickness*2, (n+1)*fontsize*heightMult);
  }
  // var th = wrapText(this.ctx, message, borderThickness, borderThickness, 4096, fontsize );

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
  this.createCanvasArrow = function() {
    return new VRCanvasArrow();
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
