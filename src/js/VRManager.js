VRManager = function(quad) {
  this.quad = quad;
  this.fallbackFullscreen = false;
  this.oldScroll = null;
  this.fallbackWidth = null;
  this.fallbackHeight = null;

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
      window.onscroll = this.oldScroll;
      this.fallbackFullscreen = false;
      canvas.style.width  = this.fallbackWidth;
      canvas.style.height = this.fallbackHeight;
    }

    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

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
      this.fallbackFullscreen = true;
      // mobile safari fallback to manual mode
      canvas.style.zDepth = 900;
      this.fallbackHeight = canvas.style.height;
      this.fallbackWidth = canvas.style.width;
      canvas.style.width  = window.innerWidth+"px";
      canvas.style.height = window.innerHeight+"px";
      canvas.scrollIntoView(true);
      this.oldScroll = window.onscroll;
      window.onscroll = function () { canvas.scrollIntoView(true); };
    }

    this.quad.vrtwglQuad.setCanvasFullscreen();

    return true;
  }

};

module.exports = VRManager;
