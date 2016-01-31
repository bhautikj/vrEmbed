
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

VRGuiTimer = function() {
  this.canvas = null;
  this.callback = null;
  this.in = false;
  this.startTime = Number.MAX_VALUE;
  this.callbackFired = false;

  this.init = function(canvas, callback) {
    this.canvas = canvas;
    this.callback = callback;
  }

  // operates in degrees
  this.isInBoundingBox = function(pt, vrTextureDescription) {
    var x = vrTextureDescription.sphereCentre[0] - (0.5*vrTextureDescription.sphereFOV[0]);
    if (!pointInDomain(pt[0], -180.0, 360.0, x, vrTextureDescription.sphereFOV[0]))
      return false;
    var y = vrTextureDescription.sphereCentre[1] - (0.5*vrTextureDescription.sphereFOV[1]);
    if (!pointInDomain(pt[1], -90, 180.0, y, vrTextureDescription.sphereFOV[1]))
      return false;
    return true;
  }

  this.update = function(pt, timestamp) {
    if (this.callback == null)
      return 0.0;

    if (this.isInBoundingBox(pt, this.canvas.vrTextureDescription)) {
      // start timer
      if (this.in == false) {
        this.in = true;
        this.startTime = timestamp;
        this.callbackFired = false;
        return 0;
      } else {
        var diff = timestamp-this.startTime;
        if (diff>this.timeout) {
          if (!this.callbackFired) {
            this.fireCallback();
          }
          return 0.0;
        } else {
          return diff/this.timeout;
        }
      }
    } else {
      this.in == false;
      this.startTime = Number.MAX_VALUE;
      this.callbackFired = false;
    }

    this.fireCallback = function() {
      this.callbackFired = true;
      console.log("FIRING CALLBACK!");
    }

  }
}

VRGui = function() {
  this.canvasSet = [];
  this.gl = null;
  this.timeout = 250; // in ms - for all gui events

  this.init = function(gl) {
    this.gl = gl;
  }

  this.update = function(pt, timestamp) {
    var rv = 0.0;
    for(texIt = 0;texIt < this.canvasSet.length; texIt++) {
      var tv = this.canvasSet[texIt][1].update(pt, timestamp);
      if (tv>rv) {
        rv = tv;
      }
    }
    return rv;
  }

  this.createTextBox = function(hfov, x, y, callback, message, options) {
    var vrCanvasTextBox = VRCanvasFactory.createCanvasTextBox();
    vrCanvasTextBox.init(this.gl, message, hfov, options);
    vrCanvasTextBox.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasTextBox.update(self.tick);
    var vrGuiTimer = new VRGuiTimer();
    vrGuiTimer.init(vrCanvasTextBox, callback);
    this.canvasSet.push([vrCanvasTextBox, vrGuiTimer]);
  }
}

module.exports = VRGui;