
// test if a point is in a wrap-around domain
function pointInDomain (testPoint, origin, domainSize, u, uv) {
  var normalizedPoint = (testPoint - origin + domainSize)%domainSize;
  var normalizedU = (u - origin + domainSize)%domainSize;
  // console.log(normalizedPoint + "," + normalizedU + "," + (normalizedPoint - normalizedU));
  var diff = (normalizedPoint - normalizedU);
  if (diff>0 && diff<uv)
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

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

VRGuiTimer = function() {
  this.canvas = null;
  this.callback = null;
  this.in = false;
  this.startTime = Number.MAX_VALUE;
  this.callbackFired = false;
  this.timeout = 1000; // in ms - for all gui events

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
    if (this.callback == null){
      if (this.isInBoundingBox(pt, this.canvas.vrTextureDescription))
        this.in = true;
      else
        this.in = false;
      return 0.0;
    }

    if (this.isInBoundingBox(pt, this.canvas.vrTextureDescription)) {
      // start timer
      if (this.in == false) {
        // console.log("IN");
        // console.log(pt);
        this.in = true;
        this.startTime = timestamp;
        this.callbackFired = false;
        if (navigator.vibrate) {
        	// vibration API supported
          navigator.vibrate(100);
        }

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
      if (this.in == true) {
        // console.log("OUT");
        // console.log(pt);
      }
      this.in = false;
      this.startTime = Number.MAX_VALUE;
      this.callbackFired = false;
      return 0.0;
    }
  }

  this.fireCallback = function() {
    this.callbackFired = true;
    console.log("FIRING CALLBACK!");
    this.callback();
  }
}

VRGui = function() {
  this.canvasSet = [];
  this.gl = null;
  this.guiHover = false;


  this.isHovering = function() {
    return this.guiHover;
  }
  
  this.init = function(gl) {
    this.gl = gl;
  }

  this.teardown = function() {
    for(texIt = 0;texIt < this.canvasSet.length; texIt++) {
      this.canvasSet[texIt][0].teardown();
    }
    this.canvasSet = [];
  }

  this.update = function(_pt, timestamp) {
    var pt = [_pt[0],_pt[1]];
    // document.getElementById("log").innerHTML = Math.floor(_pt[0]) + "," + Math.floor(_pt[1]);

    this.guiHover = false;
    var rv = 0.0;
    for(texIt = 0;texIt < this.canvasSet.length; texIt++) {
      var tv = this.canvasSet[texIt][1].update(pt, timestamp);
      if (tv>rv) {
        rv = tv;
      }

      if (this.canvasSet[texIt][1].in == true) {
        this.guiHover = true;
      }
    }
    // if (rv>0.0)
    //   console.log(rv);
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

  this.createArrow = function(hfov, x, y, callback, isLeft) {
    var vrCanvasArrow = VRCanvasFactory.createCanvasArrow();
    vrCanvasArrow.init(this.gl, hfov, isLeft);
    vrCanvasArrow.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasArrow.update(self.tick);
    var vrGuiTimer = new VRGuiTimer();
    vrGuiTimer.init(vrCanvasArrow, callback);
    this.canvasSet.push([vrCanvasArrow, vrGuiTimer]);
  }
}

module.exports = VRGui;
