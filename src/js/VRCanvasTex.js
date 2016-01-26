VRTextureDescription = require('./VRTextureDescription.js');

VRCanvasTex = function() {
  this.vrTextureDescription = new VRTextureDescription();
  this.vrTextureDescription.sphereFOV = [45,45];
  this.vrTextureDescription.sphereCentre = [0,0];

  this.ctx = document.createElement("canvas").getContext("2d");
  this.ctx.canvas.width  = 256;
  this.ctx.canvas.height = 256;

  this.updateCanvas = function(time) {
    this.ctx.fillStyle = "#00f";
    this.ctx.strokeStyle = "#ff0";
    this.ctx.lineWidth = "10";
    this.ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.ctx.beginPath();
    this.ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2.2 * Math.abs(Math.cos(time)), 0, Math.PI * 2);
    this.ctx.stroke();
  }
}

module.exports = VRCanvasTex;
