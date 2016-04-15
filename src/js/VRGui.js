
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

function pointInPlane(pt, vrTextureDescription) {
  var testPoint = [Math.PI*(pt[0]-vrTextureDescription.sphereCentre[0])/-180, Math.PI*(pt[1]-vrTextureDescription.sphereCentre[1])/-180];
  var testPointOnSphereX = Math.cos(testPoint[0])*Math.cos(testPoint[1]);
  // axes:
  // x: front-back; 1 is front, -1 is back
  // y: left-right; -1 is left, 1 is right
  // z: up-down; -1 is top, 1 is bottom
  // unit cube is inscribed in sphere; side length is sl = 2/sqrt(3)
  var sl = 90;
  // our reference point on plane, r0 then is (sl/2,0,0) which is also our normal, n
  // for a ray, r, intersecing the plane:
  // n*r0 = n*r
  // since n.y, n.z = 0
  // sl*0.5*sl*0.5 = sl*0.25*r.x
  // r.x = sl*0.5;
  // r.x is now testPointOnSphereX*alpha (linear mult factor)
  // alpha*testPointOnSphereX = sl*0.5;
  // alpha = sl*0.5/testPointOnSphereX;
  var alpha = sl*0.5/testPointOnSphereX;
  // if alpha <=0 - forget it, not intersecting!
  if (alpha<=1e-6)
    return;

  // calculate plane coords
  var planeX = -alpha*Math.cos(testPoint[1])*Math.sin(testPoint[0]);
  var planeY = -alpha*Math.sin(testPoint[1]);

  var xmin = vrTextureDescription.planeOffset[0] - (0.5*vrTextureDescription.sphereFOV[0]);
  if(planeX<xmin)
    return false;

  var xmax = vrTextureDescription.planeOffset[0] + (0.5*vrTextureDescription.sphereFOV[0]);
  if (planeX>xmax)
    return false;

  var ymin = vrTextureDescription.planeOffset[1] - (0.5*vrTextureDescription.sphereFOV[1]);
  if (planeY<ymin)
    return false;

  var ymax = vrTextureDescription.planeOffset[1] + (0.5*vrTextureDescription.sphereFOV[1]);
  if (planeY>ymax)
    return false;

  // console.log(xmin, xmax, ymin, ymax, planeX, planeY);

  return true;
}

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

VRGuiTimer = function() {
  this.canvas = null;
  this.callback = null;
  this.callbackArgs = null;
  this.in = false;
  this.startTime = Number.MAX_VALUE;
  this.callbackFired = false;
  this.timeout = 1500; // in ms - for all gui events

  this.init = function(canvas, callback, callbackArgs) {
    this.canvas = canvas;
    this.callback = callback;
    this.callbackArgs = callbackArgs;
  }

  // operates in degrees
  this.isInBoundingBox = function(pt, vrTextureDescription) {
    if(vrTextureDescription.plane == false) {
      var x = vrTextureDescription.sphereCentre[0] - (0.5*vrTextureDescription.sphereFOV[0]);
      if (!pointInDomain(pt[0], -180.0, 360.0, x, vrTextureDescription.sphereFOV[0]))
        return false;
      var y = vrTextureDescription.sphereCentre[1] - (0.5*vrTextureDescription.sphereFOV[1]);
      if (!pointInDomain(pt[1], -90, 180.0, y, vrTextureDescription.sphereFOV[1]))
        return false;
      return true;
    } else {
      return pointInPlane(pt, vrTextureDescription);
    }
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
        // if (navigator.vibrate) {
        // 	// vibration API supported
        //   navigator.vibrate(100);
        // }

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
    this.callback(this.callbackArgs);
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

  this.isGuiDirty = function() {
    for(texIt = 0;texIt < this.canvasSet.length; texIt++) {
      var dirty = this.canvasSet[texIt][0].getDirty();
      if (dirty) {
        return true;
      }
    }
    return false;
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

      if (this.canvasSet[texIt]!=undefined) {
        if (this.canvasSet[texIt][1].in == true) {
          this.guiHover = true;
        }
      }
    }
    // if (rv>0.0)
    //   console.log(rv);
    return rv;
  }

  this.createTextBox = function(hfov, x, y, plane, planeOffset, callback, callbackArgs, message, options) {
    var vrCanvasTextBox = VRCanvasFactory.createCanvasTextBox();
    vrCanvasTextBox.init(this.gl, message, hfov, options);
    vrCanvasTextBox.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasTextBox.vrTextureDescription.plane = plane;
    vrCanvasTextBox.vrTextureDescription.planeOffset = planeOffset;
    vrCanvasTextBox.update(self.tick);
    var vrGuiTimer = new VRGuiTimer();
    vrGuiTimer.init(vrCanvasTextBox, callback, callbackArgs);
    this.canvasSet.push([vrCanvasTextBox, vrGuiTimer]);
  }

  this.createDecal = function(callback, callbackArgs, imgsrc, textureDescription) {
    var vrDecal = VRCanvasFactory.createCanvasDecal();
    vrDecal.init(this.gl, imgsrc, textureDescription);
    vrDecal.update(self.tick);
    var vrGuiTimer = new VRGuiTimer();
    vrGuiTimer.init(vrDecal, callback, callbackArgs);
    this.canvasSet.push([vrDecal, vrGuiTimer]);
  }

  this.createArrow = function(hfov, x, y, callback, callbackArgs, isLeft) {
    var vrCanvasArrow = VRCanvasFactory.createCanvasArrow();
    vrCanvasArrow.init(this.gl, hfov, isLeft);
    vrCanvasArrow.vrTextureDescription.sphereCentre = [x, y];
    vrCanvasArrow.update(self.tick);
    var vrGuiTimer = new VRGuiTimer();
    vrGuiTimer.init(vrCanvasArrow, callback, callbackArgs);
    this.canvasSet.push([vrCanvasArrow, vrGuiTimer]);
  }
}

module.exports = VRGui;
