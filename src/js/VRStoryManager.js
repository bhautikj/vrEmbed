var VROptions = require('./VROptions.js');
var VRStory = require('./VRStory.js');

VRStoryManager = function() {
  var self = this;
  this.storyList = [];
  this.activeStory = -1;
  this.vrOptions = new VROptions();
  var self = this;


  this.onFullscreenChange_ = function(e) {
    // If we leave full-screen, also exit VR mode.
    if (document.webkitFullscreenElement === null ||
        document.mozFullScreenElement === null) {
      for(storyit = 0;storyit < self.storyList.length; storyit++) {
        self.storyList[storyit].stateToggler.setState(VRStates.WINDOWED);
      }
    }
  };

  // Whenever we enter fullscreen, we are entering VR or immersive mode.
  document.addEventListener('webkitfullscreenchange',
      this.onFullscreenChange_.bind(this));
  document.addEventListener('mozfullscreenchange',
      this.onFullscreenChange_.bind(this));

  this.addStory = function(story) {
    this.storyList.push(story);
  };

  this.onResize = function() {
    for(storyit = 0;storyit < self.storyList.length; storyit++) {
      self.storyList[storyit].onResize();
    }
  };

  // central animation loop - this is the event pump that should drive the rest
  this.animate = function() {
    requestAnimationFrame(self.animate);
    for(storyit = 0;storyit < self.storyList.length; storyit++) {
      self.storyList[storyit].animate();
    }
  };

  this.findStoryIndex = function(story) {
    var foundidx=-1;
    for(storyit = 0;storyit < self.storyList.length; storyit++) {
      if (self.storyList[storyit]==story){
        foundidx=storyit;
      }
    }
    return foundidx;
  };

  this.init = function() {
    //document.appendChild(this.options.dialog);
  };

  this.clearPage = function() {
    window.stop();
    document.body.innerHTML = "";
  }

  this.initFullpage = function() {
    var vrStory = new VRStory();
    vrStory.createFullPageStoryDiv();
    self.addStory(vrStory);
  }

  this.animate();

};


var VRStoryManagerFactory = (function () {
  var instance;

  function createInstance() {
      var vrStoryManager = new VRStoryManager();
      vrStoryManager.init();
      return vrStoryManager;
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

module.exports = VRStoryManagerFactory.getInstance();
