Wakelock = require('../js-ext/wakelock.js');

VRManager = function(quad) {
  this.quad = quad;
  this.fallbackFullscreen = false;
  this.fallbackScroll = null;
  this.fallbackParent = null;
  this.fallbackTmpCanvas = null;
  this.wakelock = new Wakelock();

  this.isLandscape = function() {
    if(window.innerWidth > window.innerHeight)
      return true;
    else
      return false;
  };

  this.render = function(timestamp) {
    this.quad.render();
  };


  this.exitVR = function() {
    if (this.fallbackFullscreen == true) {
      var canvas = this.quad.getContainer();
      window.onscroll = this.fallbackScroll;
      this.fallbackFullscreen = false;
      this.fallbackParent.appendChild(this.quad.getContainer());
      document.body.removeChild(this.fallbackTmpCanvas);
      this.fallbackScroll = null;
      this.fallbackParent = null;
      this.fallbackTmpCanvas = null;
    } else if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

    this.wakelock.release();
    this.quad.vrtwglQuad.setCanvasWindowed();
  };

  this.enterFullscreen = function() {
    var canvas = this.quad.getContainer();
    if (canvas.requestFullscreen) {
      this.fallbackFullscreen = false;
      canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
      this.fallbackFullscreen = false;
      canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
      this.fallbackFullscreen = false;
      canvas.webkitRequestFullscreen();
    } else {
      if (this.isLandscape() == false){
        alert("Please rotate device to landscape mode before activating");
        return false;
      }

      // mobile safari fallback to manual mode
      this.fallbackParent = canvas.parentNode;
      this.fallbackTmpCanvas = document.createElement('div');
      this.fallbackTmpCanvas.style.background="#000000";
      this.fallbackTmpCanvas.appendChild(this.quad.getContainer());
      document.body.appendChild(this.fallbackTmpCanvas);

      this.fallbackFullscreen = true;
      this.fallbackTmpCanvas.style.zDepth = 1000;
      this.fallbackTmpCanvas.style.top = 0;
      this.fallbackTmpCanvas.style.right = 0;
      this.fallbackTmpCanvas.style.bottom = 0;
      this.fallbackTmpCanvas.style.left = 0;
      this.fallbackTmpCanvas.style.position = 'absolute';

      this.fallbackTmpCanvas.scrollIntoView(true);
      this.fallbackScroll = window.onscroll;
      window.onscroll = function () { this.fallbackTmpCanvas.scrollIntoView(true); };
    }

    this.quad.vrtwglQuad.setCanvasFullscreen();
    this.quad.resize();
    this.wakelock.request();

    return true;
  }

};

module.exports = VRManager;
