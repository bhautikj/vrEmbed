var THREE = require('../js-ext/three.js');

var VRStates = require('./VRStates.js');
var VRStateToggler = require('./VRStateToggler.js');
var VRTextureDescription = require('./VRTextureDescription.js');
var VRLookController = require('./VRControllers.js');
var VRCameraRig = require('./VRViewerCameraRig.js');
var VRViewerEffect = require('./VRViewerEffect.js');
var VRViewerEffectModes = require('./VRViewerEffectModes.js');

VRScenePhoto = function() {
  this.scenePhoto = null;
  this.textureDescription = null;

  this.toVec2 = function(str) {
    var arr = str.split(",");
    return new THREE.Vector2(arr[0].trim(), arr[1].trim());
  };
  
  this.parseSphereParams = function(str) {
    var arr = str.split(" ");
    this.textureDescription.sphereFOV = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.sphereCentre = new THREE.Vector2(arr[2].trim(), arr[3].trim());
  };
  
  this.parseTexParams = function(str) {
    var arr = str.split(" ");
    this.textureDescription.U_l = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.V_l = new THREE.Vector2(arr[2].trim(), arr[3].trim());
    this.textureDescription.U_r = new THREE.Vector2(arr[4].trim(), arr[5].trim());
    this.textureDescription.V_r = new THREE.Vector2(arr[6].trim(), arr[7].trim());
  };
  
  this.init = function(scenePhoto) {
    this.scenePhoto = scenePhoto;
    this.textureDescription = new VRTextureDescription();    
    this.textureDescription.textureSource = this.scenePhoto.getAttribute("src");    
    if (this.textureDescription.textureSource  == null){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }
    this.textureDescription.metaSource = "";
    this.textureDescription.isStereo = this.scenePhoto.getAttribute("isStereo");
    this.parseSphereParams(this.scenePhoto.getAttribute("sphereParams"));
    this.parseTexParams(this.scenePhoto.getAttribute("texParams"));
  };
};

VRSceneImg = function() {
  this.sceneImg = null;
  this.textureDescription = null;

  this.toVec2 = function(str) {
    var arr = str.split(",");
    return new THREE.Vector2(arr[0].trim(), arr[1].trim());
  };
  
  this.parseSphereParams = function(str) {
    var arr = str.split(" ");
    this.textureDescription.sphereFOV = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.sphereCentre = new THREE.Vector2(arr[2].trim(), arr[3].trim());
  };
  
  this.parseTexParams = function(str) {
    var arr = str.split(" ");
    this.textureDescription.U_l = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.V_l = new THREE.Vector2(arr[2].trim(), arr[3].trim());
    this.textureDescription.U_r = new THREE.Vector2(arr[4].trim(), arr[5].trim());
    this.textureDescription.V_r = new THREE.Vector2(arr[6].trim(), arr[7].trim());
  };
  
  this.init = function(sceneImg) {
    this.sceneImg = sceneImg;
    this.textureDescription = new VRTextureDescription();
    
    this.textureDescription.textureSource = this.sceneImg.getAttribute("src");    
    if (this.textureDescription.textureSource  == null){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }
    this.textureDescription.metaSource = "";
    this.parseSphereParams(this.sceneImg.getAttribute("sphereParams"));
    this.textureDescription.isStereo = this.sceneImg.getAttribute("isStereo");
    if (this.textureDescription.isStereo == "true")
      this.parseTexParams(this.sceneImg.getAttribute("texParams"));
  };
};


VRScene = function() {
  this.sceneElement = null;
  this.renderObjects = [];
  this.oldScroll = null;
  
  this.parseChildNode = function(elm) {
    if(elm.nodeName=="PHOTO"){
      var vrScenePhoto = new VRScenePhoto();
      vrScenePhoto.init(elm);
      this.renderObjects.push(vrScenePhoto);
    }
    
    var elements = elm.children;
    for(elementit = 0;elementit < elements.length; elementit++) {
      var elm = elements[elementit];
      this.parseChildNode(elm);
    }
  }
    
  this.init = function(sceneElement) {
    this.sceneElement = sceneElement;
    var elements=sceneElement.children;
    for(elementit = 0;elementit < elements.length; elementit++) {
      var elm = elements[elementit];
      this.parseChildNode(elm);
    }
  };
  
  this.initVrEmbedPhoto = function(vrEmbedPhoto) {
    var vrEmbedPhotoElm = new VRSceneImg();
    vrEmbedPhotoElm.init(vrEmbedPhoto);
    this.renderObjects.push(vrEmbedPhotoElm);
  }
};

VRManager = function(renderer, effect) {
  this.renderer = renderer;
  this.effect = effect;
  this.fallbackFullscreen = false;
  this.oldScroll = null;
  this.fallbackWidth = null;
  this.fallbackHeight = null;

  this.render = function(scene, cameraRig, timestamp) {
    this.effect.render(scene, cameraRig);
  };
  
  this.exitVR = function() {
    if (this.fallbackFullscreen == true) {
      var canvas = this.renderer.domElement.parentNode;
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
  };
  
  this.enterFullscreen = function() {
    var canvas = this.renderer.domElement.parentNode;
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
      this.fallbackFullscreen = true;
      // mobile safari fallback to manual mode
      this.fallbackHeight = canvas.style.height;
      this.fallbackWidth = canvas.style.width;
      canvas.style.width  = window.innerWidth+"px";
      canvas.style.height = window.innerHeight+"px";
      canvas.scrollIntoView(true);
      this.oldScroll = window.onscroll;
      window.onscroll = function () { canvas.scrollIntoView(true); };
    }
  }
  
};

VRStory = function() {
  var self = this;
  this.storyElement = null;
  this.parentElement = null;
  this.renderer = null;
  this.scene = null;
  this.vrCameraRig = null;
  this.effect = null;
  this.manager = null;
  this.storyManager = null;
  this.stateToggler = new VRStateToggler();
  this.stateToggler.setVRStory(this);
  this.controls = new VRLookController();
  this.state = VRStates.INACTIVE;

  this.isFullScreen = false;
  
  this.sceneList = [];

  
  this.enterFullscreen = function(){
    this.isFullScreen = true;
    self.manager.enterFullscreen();
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
    if (self.effect != null)
      self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    self.exitFullscreen();
    console.log("WINDOWED CALLBACK");
  };
  
  this.windowedAnaglyphCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    self.exitFullscreen();
    console.log("WINDOWED ANAGLYPH CALLBACK");
  };

  this.fullscreenCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    self.enterFullscreen();
    console.log("FULLSCREEN CALLBACK");
  };
  
  this.fullscreenAnaglyphCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    this.enterFullscreen();
    console.log("FULLSCREEN ANAGLYPH CALLBACK");
  };
  
  this.cardboardCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.TWO_VIEWPORTS);
    this.enterFullscreen();
    console.log("CARDBOARD CALLBACK");
  };
  
  this.onResize = function() {
    var containerWidth = this.parentElement.clientWidth;
    var containerHeight = this.parentElement.clientHeight;
    
    if (this.effect != null) { 
      if (this.isFullScreen) {
        this.vrCameraRig.resizeCamera(window.innerWidth, window.innerHeight, this.state);
        this.effect.setSize(window.innerWidth, window.innerHeight);
        
        if (this.manager.fallbackFullscreen == true){
          var canvas = this.renderer.domElement.parentNode;
          canvas.style.width  = window.innerWidth+"px";
          canvas.style.height = window.innerHeight+"px";
        }
      }
      else {
        this.vrCameraRig.resizeCamera(containerWidth, containerHeight, this.state);
        this.effect.setSize(containerWidth, containerHeight);
      }
    } else {
      console.log("SHOULD NEVER BE HERE");
    }
  };
  
  this.setState = function(state) {
    self.state = state;
    switch (state) {
      case VRStates.CARDBOARD:
        self.cardboardCallback();
        break;
      case VRStates.FULLSCREEN:
        self.fullscreenCallback();
        break;
      case VRStates.FULLSCREEN_ANAGLYPH:
        self.fullscreenAnaglyphCallback();
        break;
      case VRStates.WINDOWED:
        self.windowedCallback();
        break;
      case VRStates.WINDOWED_ANAGLYPH:
        self.windowedAnaglyphCallback();
        break;
    }
    
    this.onResize();
  };
  
  self.stateToggler.on(VRStates.WINDOWED, self.windowedCallback.bind(this)); 
  self.stateToggler.on(VRStates.WINDOWED_ANAGLYPH, self.windowedAnaglyphCallback.bind(this)); 
  self.stateToggler.on(VRStates.FULLSCREEN, self.fullscreenCallback.bind(this)); 
  self.stateToggler.on(VRStates.FULLSCREEN_ANAGLYPH, self.fullscreenAnaglyphCallback.bind(this)); 
  self.stateToggler.on(VRStates.CARDBOARD, self.cardboardCallback.bind(this)); 
  
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

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize( containerWidth, containerHeight );

    // Append the canvas element created by the renderer to document body element.
    // document.body.appendChild(renderer.domElement);
    this.parentElement.appendChild( this.renderer.domElement );
    
    // Create a three.js scene.
    this.scene = new THREE.Scene();

    this.vrCameraRig = new THREE.VRViewerCameraRig();
    this.vrCameraRig.init(this.scene);
    this.setupClassicStereoCam(this.vrCameraRig);

    // Apply VR stereo rendering to renderer.
    this.effect = new VRViewerEffect(this.renderer, 0);
    // effect.setSize(window.innerWidth, window.innerHeight);
    this.effect.setSize(containerWidth, containerHeight);
    
    // Apply VR headset positional data to camera.
    this.controls.setCamera(this.vrCameraRig._topTransform);
  };

  // Request animation frame loop function
  this.animate = function(timestamp) {
    // Update VR headset position and apply to camera.
    self.controls.update();
    self.manager.renderer.autoClear = false;
    self.manager.renderer.clear();

    self.manager.render(self.scene, self.vrCameraRig, timestamp);

    //   uniforms.iGlobalTime.value += 0.001;    
//     alert(timestamp);
  };
      
  this.init = function(storyElement, storyManager) {
    this.storyElement = storyElement;
    this.storyManager = storyManager;
    this.parentElement = this.storyElement.parentNode;

    
    this.setupSceneRenderer();
        
    for(sceneit = 0;sceneit<this.sceneList.length; sceneit++) {
      var scene = this.sceneList[sceneit];
      for (objit = 0;objit<scene.renderObjects.length; objit++){
        var scenePhoto = scene.renderObjects[objit];
        if (scenePhoto.textureDescription!=null){
          this.effect.setStereographicProjection(scenePhoto.textureDescription);
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
    
    this.manager = new VRManager(this.renderer, this.effect);
    this.onResize();
    this.animate();
    
    this.stateToggler.setState(VRStates.WINDOWED);

  };
  
  this.initVrEmbedPhoto = function(vrEmbedPhoto, storyManager) {
    var vrScene = new VRScene();
    vrScene.initVrEmbedPhoto(vrEmbedPhoto);
    this.sceneList.push(vrScene);
    this.init(vrEmbedPhoto, storyManager);
  };
  
  this.initStory = function(storyElement, storyManager) {
    var scenes=storyElement.children;
    for(sceneit = 0;sceneit < scenes.length; sceneit++) {
      var scene = scenes[sceneit];
      if(scene.nodeName=="SCENE"){
        var vrScene = new VRScene();
        vrScene.init(scene);
        this.sceneList.push(vrScene);  
      }
    }
    this.init(storyElement, storyManager);
  }

};

VRStoryManager = function() {
  var self= this;
  this.storyList = [];
  this.activeStory = -1;
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
    for(storyit = 0;storyit < self.storyList.length; storyit++) {
      self.storyList[storyit].animate();
    }
    requestAnimationFrame(self.animate);
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
  
  this.animate();
  
};

THREE.StoryParser = function () {
  this.storyManager = new VRStoryManager();

  this.parseDocXML = function(topElement) {
    // parse full-fledged stories
    var stories=topElement.getElementsByTagName("story");
    for(storyit = 0;storyit < stories.length; storyit++) {
      var story = stories[storyit];
      var vrStory = new VRStory();
      vrStory.initStory(story, this.storyManager);
      this.storyManager.addStory(vrStory);
    }
    
    // parse vr embed photos
    var vrEmbedPhotos=topElement.getElementsByTagName("vrEmbedPhoto");
    for(vrEmbedPhotosIt = 0;vrEmbedPhotosIt < vrEmbedPhotos.length; vrEmbedPhotosIt++) {
      var vrEmbedPhoto = vrEmbedPhotos[vrEmbedPhotosIt];
      var vrStory = new VRStory();
      vrStory.initVrEmbedPhoto(vrEmbedPhoto, this.storyManager);
      this.storyManager.addStory(vrStory);
    }
  };
  
  this.onResize = function() {
    this.storyManager.onResize();
  };
};

module.exports = THREE.StoryParser;