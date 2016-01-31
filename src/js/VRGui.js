
// test if a point is in a wrap-around domain
function pointInDomain (testPoint, origin, domainSize, u, uv) {
  var normalizedPoint = (testPoint - origin + domainSize)%domainSize;
  var normalizedU = (u - origin + domainSize)%domainSize;
  if ((normalizedPoint - normalizedU)<uv)
    return true;
  else
    return false;
  // 160 deg is the centre
  // -180 is the origin
  // actual pos == 160 - (-180) = 340
  // for a test point x
  // testPos=(x-(-180)+360)%360
  // testPos=(x+540)%360
  // (160+540)%360 = 340
  // (-200+540)%360 = 340 YASSS
  // (-190+540)%360 = 350 YASSS
}

function VRGui() {
  this.canvasSet = [];
  this.gl = null;

  this.init = function(gl) {
    this.gl = gl;
  }

  // operates on degrees
  this.isInBoundingBox = function(pt, vrTextureDescription) {
    var x = vrTextureDescription.sphereCentre[0] - (0.5*vrTextureDescription.sphereFOV[0]);
    if (!pointInDomain(pt[0], -180.0, 360.0, x, vrTextureDescription.sphereFOV[0]))
      return false;
    var y = vrTextureDescription.sphereCentre[1] - (0.5*vrTextureDescription.sphereFOV[1]);
    if (!pointInDomain(pt[1], -90, 180.0, y, vrTextureDescription.sphereFOV[1]))
      return false;
    return true;
  }

  this.createTextBox = function(hfov, x, y, callback, message, options) {
    var vrCanvasTextBox = VRCanvasFactory.createCanvasTextBox();
    vrCanvasTextBox.init(this.gl, message, hfov, options);
    vrCanvasTextBox.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasTextBox.update(self.tick);
    this.canvasSet.push([vrCanvasTextBox, callback]);
  }

}

module.exports = VRGui;
