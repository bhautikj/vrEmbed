var VRStates = require('./VRStates.js');
var VRStateToggler = require('./VRStateToggler.js');
var VRScene = require('./VRScene.js');
var VRManager = require('./VRManager.js');
var VRRenderModes = require('./VRRenderModes.js');
var VRDeviceManager = require('./VRDeviceManager.js');
var VRGui = require('./VRGui.js');
var VROptions = require('./VROptions.js');

VRStory = function() {
  var self = this;
  this.storyElement = null;
  this.parentElement = null;
  this.vrDeviceManager = VRDeviceManager;
  this.vrGui = null;
  this.vrOptions = new VROptions();

  //--
  this.quad = null;
  //--

  this.manager = null;
  this.storyManager = null;
  this.stateToggler = new VRStateToggler();
  this.stateToggler.setVRStory(this);
  this.state = VRStates.INACTIVE;
  this.lastVisibleCheck = 0;
  this.isVisible = true;
  this.isStereo = false;
  this.currentSceneIndex = 0;

  this.isFullScreen = false;

  this.sceneList = [];


  this.enterFullscreen = function(){
    if (this.vrDeviceManager.firstTime()){
      console.log("FIRST");
      this.vrOptions.options.showDialogFirstTime(self);
      return false;
    }
    
    if (self.manager.enterFullscreen() == false)
      return false;

    this.isFullScreen = true;
    if (self.manager.fallbackFullscreen == true) {
      self.onResize();
    }
  };

  this.exitFullscreen = function() {
    if (!this.isFullScreen) {
      return;
    }
    if (self.manager != null){
      self.manager.exitVR();
      this.isFullScreen = false;
    }
//     this.onFullscreenChange_(null);
  };

  this.windowedCallback = function() {
    if (self.quad == null)
      return false;
    self.quad.setupFromDevice (this.vrDeviceManager.getWindowedDevice());
    self.exitFullscreen();
    console.log("WINDOWED CALLBACK");
    return true;
  };

  this.fullscreenCallback = function() {
    if (self.enterFullscreen() == false)
      return false;
    self.quad.setupFromDevice (this.vrDeviceManager.getCurrentDevice());
    console.log("FULLSCREEN CALLBACK");
    return true;
  };

  this.onResize = function() {
    var containerWidth = this.parentElement.clientWidth;
    var containerHeight = this.parentElement.clientHeight;

    if (this.quad != null) {
      // check to see if we should drop back to windowed mode
      if (this.manager.fallbackFullscreen == true){
          if (this.manager.isLandscape() == false) {
            this.stateToggler.setState(VRStates.WINDOWED);
            return;
          }
      }

      if (this.isFullScreen) {
        this.quad.resize();

        if (this.manager.fallbackFullscreen == true){
          var canvas = this.quad.getContainer();
          canvas.style.width  = window.innerWidth+"px";
          canvas.style.height = window.innerHeight+"px";
        }
      } else {
        this.quad.resize();
      }
    } else {
      console.log("SHOULD NEVER BE HERE");
    }
  };

  this.setState = function(state) {
    var oldState = self.state;

    self.state = state;
    var success = false;
    switch (state) {
      case VRStates.FULLSCREEN:
        success = self.fullscreenCallback();
        break;
      case VRStates.WINDOWED:
        success = self.windowedCallback();
        break;
    }

    if (success == true) {
      self.state = state;
      this.onResize();
    } else {
      self.state = oldState;
    }

    return success;
  };

  this.setupSceneRenderer = function() {
    var containerWidth = this.parentElement.clientWidth;
    var containerHeight = this.parentElement.clientHeight;

    VRtwglQuadStereoProjection = require('./VRtwglQuadStereoProjection.js');
    this.quad = new VRtwglQuadStereoProjection();
    this.quad.init(this.parentElement);
    this.quad.resize();
  };

  this.isInViewport = function() {
      var canvas = this.quad.getContainer();
      var rect = canvas.getBoundingClientRect();
      var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

      // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      var vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
      var horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

      return (vertInView && horInView);
  }

  this.checkVisible = function() {
    var now = Date.now();
    if (now - this.lastVisibleCheck < 100)
      return; // ~4Hz
    this.isVisible = this.isInViewport();
  }

  // Request animation frame loop function
  this.animate = function(timestamp) {
    this.checkVisible();
    if (this.isVisible == false)
      return;

    self.manager.render(timestamp);

    var now = Date.now();
    var dir = self.quad.controller.getHeading();
    // document.getElementById("log").innerHTML = Math.floor(dir[0]) + "," +
    //                                            Math.floor(dir[1]) + "," +
    //                                            Math.floor(dir[2]);
    if (self.vrGui != null) {
      var actionPercent = self.vrGui.update([dir[0], dir[1]],now);
      self.drawReticle(actionPercent);
    }
  };

  this.drawReticle = function(actionPercent) {
    var _ctx = this.quad.vrtwglQuad.get2dContext();
    if (_ctx == null)
      return;
    var ctx = _ctx[0];
    var w = _ctx[1];
    var h = _ctx[2];

    ctx.clearRect(0, 0, w, h);
    var recticleList = [];

    var renderMode = this.quad.getRenderMode();
    if (renderMode != VRRenderModes.STEREOSIDEBYSIDE){
      recticleList.push([w/2,h/2]);
    } else {
      var ipdAdjust = this.quad.getIPDAdjust();
      recticleList.push([w/4 - ipdAdjust*w/2, h/2]);
      recticleList.push([3*w/4 + ipdAdjust*w/2, h/2]);
    }

    for (objit = 0;objit<recticleList.length; objit++){
      var reticle = recticleList[objit];
      // draw aiming reiticle
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.arc(reticle[0],reticle[1],15,0,2*Math.PI);
      ctx.stroke();


      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,0,1.0)";
      ctx.lineWidth = 5;
      ctx.arc(reticle[0],reticle[1],15,-0.5*Math.PI,-0.5*Math.PI+actionPercent*2*Math.PI);
      ctx.stroke();
    }
  }

  this.setupScene = function(sceneIdx) {
    // console.log("SETTING UP SCENE INDEX:" + sceneIdx);
    this.vrGui.teardown();
    this.quad.teardown();

    var scene = this.sceneList[sceneIdx];
    var textureDescriptions = []
    for (objit = 0;objit<scene.renderObjects.length; objit++){
      var scenePhoto = scene.renderObjects[objit];
      if (scenePhoto.textureDescription!=null){
        textureDescriptions.push(scenePhoto.textureDescription);
      }
    }
    this.quad.loadTextures(textureDescriptions);
    this.stateToggler.configureStereo(this.isStereo);

    this.currentSceneIndex = sceneIdx;
    this.guiGen();
  }

  this.nextScene = function() {
    var numScenes = self.sceneList.length;
    var nextScene = (self.currentSceneIndex + 1)%numScenes;

    if (nextScene != self.currentSceneIndex) {
      self.setupScene (nextScene);
      self.currentSceneIndex = nextScene;
    }
  }

  this.prevScene = function() {
    var numScenes = self.sceneList.length;
    var nextScene = (self.currentSceneIndex - 1)%numScenes;

    if (nextScene != self.currentSceneIndex) {
      self.setupScene (nextScene);
    }
  }

  this.guiGen = function() {
   var numScenes = self.sceneList.length;
   if (self.currentSceneIndex>0) {
     this.vrGui.createTextBox(15,
                               -30,
                               -30,
                               this.prevScene,
                               " prev ",
                               {fontsize:72, borderThickness:4});
   }

   if (self.currentSceneIndex<(numScenes-1)) {
     this.vrGui.createTextBox(15,
                              30,
                              -30,
                              this.nextScene,
                              " next ",
                              {fontsize:72, borderThickness:4});
    }
    this.quad.renderGui();
  }

  this.init = function(storyElement, storyManager) {
    this.storyElement = storyElement;
    this.storyManager = storyManager;
    this.parentElement = this.storyElement.parentNode;

    this.setupSceneRenderer();
    this.vrGui = new VRGui();
    this.vrGui.init(this.quad.getContext());
    this.quad.setVrGui(this.vrGui);

    this.setupScene(this.currentSceneIndex);

    this.mouseMove = function(ev) {
      var mx = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
      var my = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
      //console.log(mx + "," + my);
      self.quad.controller.mouseMove(mx, my);
    };

    this.parentElement.addEventListener("mousedown", function (ev) {
        this.parentElement.addEventListener("mousemove", self.mouseMove, false);
    }, false);

    this.parentElement.addEventListener("mouseup", function (ev) {
        this.parentElement.removeEventListener("mousemove", self.mouseMove, false);
    }, false);

    this.quad.getContainer().appendChild(this.stateToggler.buttonMiddle);
    this.quad.getContainer().appendChild(this.stateToggler.buttonOptions);

    this.manager = new VRManager(this.quad);
    this.onResize();
    this.animate();

    this.stateToggler.setState(VRStates.WINDOWED);

  };

  this.getSizeStyle = function (vrEmbedPhoto, s) {
    var width = vrEmbedPhoto.getAttribute("width");
    var height = vrEmbedPhoto.getAttribute("height");

    if (width == null && height == null) {
      s.width = '100%';
      s.paddingBottom = '56.25%';
      return;
    }

    if (height != null && width != null) {
      s.height = height;
      s.width = width;
      return;
    }

  };

  this.initVrEmbedPhoto = function(vrEmbedPhoto, storyManager) {
    // div wrap vrEmbedPhoto
    var stretchyDiv = document.createElement('div');
    var s = stretchyDiv.style;
    //s.width = '100%';
    //s.paddingBottom = '56.25%';
    s.position = 'relative';
    this.getSizeStyle(vrEmbedPhoto, s);

    var innerDiv = document.createElement('div');
    var t = innerDiv.style;
    t.position = 'absolute';
    t.top = '0';
    t.bottom = '0';
    t.left = '0';
    t.right = '0';
    t.color = 'white';
    t.fontSize = '24px';
    t.textAlign = 'center';

    var innerMost = document.createElement('a');
    innerDiv.appendChild(innerMost);
    stretchyDiv.appendChild(innerDiv);
    vrEmbedPhoto.appendChild(stretchyDiv);

    var vrScene = new VRScene();
    vrScene.initVrEmbedPhoto(vrEmbedPhoto);
    if (vrScene.isStereo)
      this.isStereo = true;
    this.sceneList.push(vrScene);

    this.init(innerMost, storyManager);
  };

  this.initFromURLSource = function(scenePhoto, storyManager) {
    var innerMost = document.createElement('div');
    var s = innerMost.style;
    s.position = 'absolute';
    s.width = '100%';
    s.height = '100%';
    s.margin = '0px';
    s.padding = '0px';
    s.border = '0px';
    s.overflow = 'hidden';

    document.body.appendChild(innerMost);
    document.body.style.margin = '0px';
    document.body.style.padding = '0px';

    var vrScene = new VRScene();
    vrScene.initFromURLSource(scenePhoto);

    if (vrScene.isStereo)
      this.isStereo = true;
    this.sceneList.push(vrScene);

    this.init(innerMost, storyManager);
  }

  this.initStory = function(storyElement, storyManager) {
    var scenes=storyElement.children;
    for(sceneit = 0;sceneit < scenes.length; sceneit++) {
      var scene = scenes[sceneit];
      if(scene.nodeName=="SCENE"){
        var vrScene = new VRScene();
        vrScene.init(scene);
        if (vrScene.isStereo)
          this.isStereo = true;
        this.sceneList.push(vrScene);
      }
    }
    this.init(storyElement, storyManager);
  }

  this.showOptions = function() {
    this.storyManager.showOptions();
  };

  this.hideOptions = function() {
    this.storyManager.hideOptions();
  };

};

module.exports = VRStory;
