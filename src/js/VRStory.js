var VRStates = require('./VRStates.js');
var VRStateToggler = require('./VRStateToggler.js');
var VRLookController = require('./VRControllers.js');
var VRScene = require('./VRScene.js');
var VRManager = require('./VRManager.js');

VRStory = function() {
  var self = this;
  this.storyElement = null;
  this.parentElement = null;

  //--
  this.quad = null;
  this.cameraMatrix = twgl.m4.identity();
  //--

  this.manager = null;
  this.storyManager = null;
  this.stateToggler = new VRStateToggler();
  this.stateToggler.setVRStory(this);
  this.controls = new VRLookController();
  this.state = VRStates.INACTIVE;
  this.lastVisibleCheck = 0;
  this.isVisible = true;
  this.isStereo = false;

  this.isFullScreen = false;

  this.sceneList = [];


  this.enterFullscreen = function(){
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
    //TODO: FIXOR
    //self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    self.exitFullscreen();
    console.log("WINDOWED CALLBACK");
    return true;
  };

  this.windowedAnaglyphCallback = function() {
    //TODO: FIXOR
    //self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    self.exitFullscreen();
    console.log("WINDOWED ANAGLYPH CALLBACK");
    return true;
  };

  this.fullscreenCallback = function() {
    if (self.enterFullscreen() == false)
      return false;
    //TODO: FIXOR
    //self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    console.log("FULLSCREEN CALLBACK");
    return true;
  };

  this.fullscreenAnaglyphCallback = function() {
    if (self.enterFullscreen() == false)
      return false;
    //TODO: FIXOR
    //self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    console.log("FULLSCREEN ANAGLYPH CALLBACK");
    return true;
  };

  this.cardboardCallback = function() {
    if (self.enterFullscreen() == false)
      return false;
    //TODO: FIXOR
    //self.effect.setRenderMode(THREE.VRViewerEffectModes.TWO_VIEWPORTS);
    console.log("CARDBOARD CALLBACK");
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
          var canvas = this.quad.getCanvas();
          canvas.style.width  = window.innerWidth+"px";
          canvas.style.height = window.innerHeight+"px";
        }
      }
      else {
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
      case VRStates.CARDBOARD:
        success = self.cardboardCallback();
        break;
      case VRStates.FULLSCREEN:
        success = self.fullscreenCallback();
        break;
      case VRStates.FULLSCREEN_ANAGLYPH:
        success = self.fullscreenAnaglyphCallback();
        break;
      case VRStates.WINDOWED:
        success = self.windowedCallback();
        break;
      case VRStates.WINDOWED_ANAGLYPH:
        success = self.windowedAnaglyphCallback();
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

  this.setupClassicStereoCam = function( vrCameraRig ) {
    var INTERPUPILLARY_DISTANCE = 0.06;
    var DEFAULT_MAX_FOV_LEFT_RIGHT = 40.0;
    vrCameraRig.setupClassicStereoCam( INTERPUPILLARY_DISTANCE*-0.5,
                                      INTERPUPILLARY_DISTANCE*0.5,
                                      DEFAULT_MAX_FOV_LEFT_RIGHT,
                                      DEFAULT_MAX_FOV_LEFT_RIGHT);
  }

  this.setupSceneRenderer = function() {
    var containerWidth = this.parentElement.clientWidth;
    var containerHeight = this.parentElement.clientHeight;

    VRtwglQuadTest = require('./VRtwglQuadTest.js');
    this.quad = new VRtwglQuadTest();
    this.quad.init(this.parentElement);
    this.quad.resize();

    this.controls.setCamera(this.cameraMatrix);
  };

  this.isInViewport = function() {
      var canvas = this.quad.getCanvas();
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

    // Update VR headset position and apply to camera.
    self.controls.update();

    self.manager.render(self.quad, self.cameraMatrix, timestamp);

    //   uniforms.iGlobalTime.value += 0.001;
//     alert(timestamp);
  };

  this.init = function(storyElement, storyManager) {
    this.storyElement = storyElement;
    this.storyManager = storyManager;
    this.parentElement = this.storyElement.parentNode;

    this.stateToggler.configureStereo(this.isStereo);

    this.setupSceneRenderer();

    for(sceneit = 0;sceneit<this.sceneList.length; sceneit++) {
      var scene = this.sceneList[sceneit];
      for (objit = 0;objit<scene.renderObjects.length; objit++){
        var scenePhoto = scene.renderObjects[objit];
        if (scenePhoto.textureDescription!=null){
          //TODO: FIXOR setup quad with stereo projection
          //this.effect.setStereographicProjection(scenePhoto.textureDescription);
        }
      }
    }


    this.mouseMove = function(ev) {
      var mx = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
      var my = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
      //console.log(mx + "," + my);
      self.controls.mouseMove(mx, my);
    };

    this.parentElement.addEventListener("mousedown", function (ev) {
        this.parentElement.addEventListener("mousemove", self.mouseMove, false);
    }, false);

    this.parentElement.addEventListener("mouseup", function (ev) {
        this.parentElement.removeEventListener("mousemove", self.mouseMove, false);
    }, false);

    this.storyElement.appendChild(this.stateToggler.buttonLeft);
    this.storyElement.appendChild(this.stateToggler.buttonMiddle);
    this.storyElement.appendChild(this.stateToggler.buttonRight);
    this.storyElement.appendChild(this.stateToggler.buttonOptions);


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
    // div wrap vrEmbedPhoto
    var stretchyDiv = document.createElement('div');
    var s = stretchyDiv.style;
    //s.position = 'relative';
    s.width = '100%';
    s.paddingBottom = '100%';

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
    document.body.appendChild(stretchyDiv);

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
