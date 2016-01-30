function Gui() {
  this.canvasSet = [];
  this.gl = null;

  this.init = function(gl) {
    this.gl = gl;
  }

  this.createTextBox = function(hfov, x, y, message, options) {
    var vrCanvasTextBox = VRCanvasFactory.createCanvasTextBox();
    vrCanvasTextBox.init(this.gl, message, hfov, options);
    vrCanvasTextBox.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasTextBox.update(self.tick);
    this.canvasSet.push(vrCanvasTextBox);
  }

}

module.exports = Gui;
