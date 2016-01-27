VRTextureDescription = require('./VRTextureDescription.js');
var twgl = require('../js-ext/twgl-full.js');

VRCanvasTex = function() {
  this.gl = null;
  this.init = function(gl) {
    this.vrTextureDescription = new VRTextureDescription();
    this.vrTextureDescription.sphereFOV = [360,180];
    this.vrTextureDescription.sphereCentre = [0,0];

    this.ctx = document.createElement("canvas").getContext("2d");
    this.ctx.canvas.width  = 256;
    this.ctx.canvas.height = 256;
    this.update(10);
    //
    // this.glTex = twgl.createTexture(gl, {min: gl.LINEAR,mag: gl.LINEAR, src: this.ctx.canvas});
    this.glTex = twgl.createTexture(gl, {min: gl.LINEAR,mag: gl.LINEAR, src: './rheingauer_dom.jpg'});
    // this.glTex = twgl.createTexture(gl, {min: gl.LINEAR,mag: gl.LINEAR, src: 'rheingauer_dom.jpg'});
  }

  this.update = function(time) {
    this.ctx.fillStyle = "#00f";
    this.ctx.strokeStyle = "#ff0";
    this.ctx.lineWidth = "10";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.beginPath();
    this.ctx.arc(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2, this.ctx.canvas.width / 2.2 * Math.abs(Math.cos(time)), 0, Math.PI * 2);
    this.ctx.stroke();
  }
}

module.exports = VRCanvasTex;
