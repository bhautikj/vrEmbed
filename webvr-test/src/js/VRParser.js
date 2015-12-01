require('./VRState.js');
require('./TextureDescription.js');

VRScenePhoto = function() {
  this.scenePhoto = null;
  this.textureDescription = null;

  this.toVec2 = function(str) {
    var arr = str.split(",");
    return new THREE.Vector2(arr[0].trim(), arr[1].trim());
  };
  
  this.init = function(scenePhoto) {
    this.scenePhoto = scenePhoto;
    this.textureDescription = new TextureDescription();
    this.textureDescription.textureSource = this.scenePhoto.getAttribute("textureSource");    
    if (this.textureDescription.textureSource  == null){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }
        
    this.textureDescription.metaSource = this.scenePhoto.getAttribute("metaSource");
    this.textureDescription.isStereo = this.scenePhoto.getAttribute("isStereo");
    this.textureDescription.sphereFOV = this.toVec2(this.scenePhoto.getAttribute("sphereFOV"));
    this.textureDescription.sphereCentre = this.toVec2(this.scenePhoto.getAttribute("sphereCentre"));
    this.textureDescription.U_l = this.toVec2(this.scenePhoto.getAttribute("U_l"));
    this.textureDescription.V_l = this.toVec2(this.scenePhoto.getAttribute("V_l"));
    this.textureDescription.U_r = this.toVec2(this.scenePhoto.getAttribute("U_r"));
    this.textureDescription.V_r = this.toVec2(this.scenePhoto.getAttribute("V_r"));
  };
};

VRScene = function() {
  this.sceneElement = null;
  this.renderObjects = [];
  
  this.init = function(sceneElement) {
    this.sceneElement = sceneElement;
    var elements=sceneElement.children;
    for(elementit = 0;elementit < elements.length; elementit++) {
      var elm = elements[elementit];
      if(elm.nodeName=="PHOTO"){
        var vrScenePhoto = new VRScenePhoto();
        vrScenePhoto.init(elm);
        this.renderObjects.push(vrScenePhoto);
      }
    }
  };
};

VRManager = function(renderer, effect) {
  this.renderer = renderer;
  this.effect = effect;
  
  this.render = function(scene, camera, timestamp) {
    this.effect.render(scene, camera);
  };
  
  this.exitVR = function() {
    //TODO: FILL OUT ARGH!
  };
  
//       this.manager.requestFullscreen_ = function() {
//       var canvas = this.renderer.domElement.parentNode;
//       if (canvas.mozRequestFullScreen) {
//         canvas.mozRequestFullScreen();
//       } else if (canvas.webkitRequestFullscreen) {
//         canvas.webkitRequestFullscreen();
//       }
//     };
};

VRStory = function() {
  this.storyElement = null;
  this.parentElement = null;
  this.renderer = null;
  this.scene = null;
  this.camera = null;
  this.effect = null;
  this.manager = null;
  this.storyManager = null;
  this.stateToggler = new VRStateToggler();

  var self = this;
  
  this.sceneList = [];

  
  this.enterFullscreen = function(){
    self.manager.enterImmersive();
  };
  
  this.exitFullscreen = function() {
    if (self.manager != null)
      self.manager.exitVR();
//     this.onFullscreenChange_(null);
  };
  
  this.enterCardboard = function() {
    self.manager.enterVR();
  };
  
  this.windowedCallback = function() {
    if (self.effect != null)
      self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    this.exitFullscreen();
//     alert("WINDOWED");
  };
  
  this.windowedAnaglyphCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    this.exitFullscreen();
//     alert("WINDOWED_ANAGLYPH");
  };

  this.fullscreenCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    this.enterFullscreen();
//     alert("FULLSCREEN");
  };
  
  this.fullscreenAnaglyphCallback = function() {
    self.effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    this.enterFullscreen();
//     alert("FULLSCREEN_ANAGLYPH");
  };
  
  this.cardboardCallback = function() {
//     self.effect.setRenderMode(THREE.VRViewerEffectModes.TWO_VIEWPORTS);
    this.enterCardboard();
//     alert("CARDBOARD");
  };
  
  this.stateToggler.on(VRStates.WINDOWED, this.windowedCallback.bind(this)); 
  this.stateToggler.on(VRStates.WINDOWED_ANAGLYPH, this.windowedAnaglyphCallback.bind(this)); 
  this.stateToggler.on(VRStates.FULLSCREEN, this.fullscreenCallback.bind(this)); 
  this.stateToggler.on(VRStates.FULLSCREEN_ANAGLYPH, this.fullscreenAnaglyphCallback.bind(this)); 
  this.stateToggler.on(VRStates.CARDBOARD, this.cardboardCallback.bind(this)); 
    
  this.onResize = function() {
    var containerWidth = this.parentElement.clientWidth;
    var containerHeight = this.parentElement.clientHeight;
    
    if (this.effect != null) { 
      if (this.effect.isFullscreenMode()) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.effect.setSize(window.innerWidth, window.innerHeight);
      }
      else {
        this.camera.aspect = containerWidth/containerHeight;
        this.camera.updateProjectionMatrix();
        this.effect.setSize(containerWidth, containerHeight);
      }
    }
  };
  
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

    // Create a three.js camera.
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000);

    // Apply VR stereo rendering to renderer.
    this.effect = new THREE.VRViewerEffect(this.renderer, 0);
    // effect.setSize(window.innerWidth, window.innerHeight);
    this.effect.setSize(containerWidth, containerHeight);
  };

    // Request animation frame loop function
  this.animate = function(timestamp) {
    self.manager.renderer.autoClear = false;
    self.manager.renderer.clear();

    self.manager.render(self.scene, self.camera, timestamp);

    //   uniforms.iGlobalTime.value += 0.001;    
//     alert(timestamp);
  };
  
  this.init = function(storyElement, storyManager) {
    this.storyElement = storyElement;
    this.storyManager = storyManager;
    this.parentElement = this.storyElement.parentNode;
    
    var scenes=storyElement.children;
    for(sceneit = 0;sceneit < scenes.length; sceneit++) {
      var scene = scenes[sceneit];
      if(scene.nodeName=="SCENE"){
        var vrScene = new VRScene();
        vrScene.init(scene);
        this.sceneList.push(vrScene);  
      }
    }
    
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
      self.storyManager.mouseMove(self, ev);
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
  
};

VRStoryManager = function() {
  var self= this;
  this.storyList = [];
  this.activeStory = -1;
  var self = this;

  this.controls = new VRLookController();
    
  this.onFullscreenChange_ = function(e) {
    // If we leave full-screen, also exit VR mode.
    if (document.webkitFullscreenElement === null ||
        document.mozFullScreenElement === null) {
      self.getActiveStory().stateToggler.setState(VRStates.WINDOWED);
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
    for(i=0;i<this.storyList.length;i++){
      this.storyList[i].onResize();
    }
  };
  
  this.setActiveStory = function(idx) {
    //TODO: teardown story at previous index
    this.activeStory = idx;
    var story = this.storyList[this.activeStory];
    // Apply VR headset positional data to camera.
    this.controls.setCamera(story.camera);
  };
  
  this.getActiveStory = function() {
    return this.storyList[this.activeStory];
  };
  
  // central animation loop - this is the event pump that should drive the rest
  this.animate = function() {
    // Update VR headset position and apply to camera.
    self.controls.update();
    
    if (self.activeStory >= 0){
      self.getActiveStory().animate();
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
  
  this.mouseMove = function(story, ev) {
    var mx = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
    var my = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
//     alert(self.findStoryIndex(story));
    console.log(mx + "," + my);
  };
  
  this.animate();
  
};

THREE.StoryParser = function () {
  this.storyManager = new VRStoryManager();

  this.parseDocXML = function(topElement) {
    var stories=topElement.getElementsByTagName("story");
    for(storyit = 0;storyit < stories.length; storyit++) {
      var story = stories[storyit];
      var vrStory = new VRStory();
      vrStory.init(story, this.storyManager);
      this.storyManager.addStory(vrStory);
    }
    
    if (stories.length>0){
      this.storyManager.setActiveStory(0);
    }
  };
  
  this.onResize = function() {
    this.storyManager.onResize();
  };
};


