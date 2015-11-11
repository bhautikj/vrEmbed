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
      var element = elements[elementit];
      if(element.nodeName=="PHOTO"){
        var scenePhoto = element;
        var vrScenePhoto = new VRScenePhoto();
        vrScenePhoto.init(scenePhoto);
        this.renderObjects.push(vrScenePhoto);
      }
    }
  };
};

VRStory = function() {
  this.storyElement = null;
  this.parentElement = null;
  this.renderer = null;
  this.scene = null;
  this.camera = null;
  this.controls = null;
  this.effect = null;
  this.manager = null;
  var self = this;
  
  this.sceneList = [];

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

    // Apply VR headset positional data to camera.
    this.controls = new THREE.VRControls(this.camera);

    // Apply VR stereo rendering to renderer.
    this.effect = new THREE.VRViewerEffect(this.renderer, 0);
    // effect.setSize(window.innerWidth, window.innerHeight);
    this.effect.setSize(containerWidth, containerHeight);
  };

    // Request animation frame loop function
  this.animate = function(timestamp) {
    // Update VR headset position and apply to camera.
    self.controls.update();
    
    self.manager.renderer.autoClear = false;
    self.manager.renderer.clear();

    
//     if (self.manager.isVRMode()){ 
//       self.effect.setRenderMode(2);
//     } else {
//       self.effect.setRenderMode(1);
//     }
    
    self.manager.render(self.scene, self.camera, timestamp);

    //   uniforms.iGlobalTime.value += 0.001;

    requestAnimationFrame(self.animate);
  };
  
  this.setupManager = function() {
    // Create a VR manager helper to enter and exit VR mode.
    this.manager = new WebVRManager(this.renderer, this.effect, {hideButton: true});
    //override render function
    this.manager.render = function(scene, camera, timestamp) {
      if (this.isVRMode()) {
        this.distorter.preRender();
        this.effect.render(scene, camera);
        this.distorter.postRender();
      } else {
          this.effect.render(scene, camera);
      }
      if (this.input && this.input.setAnimationFrameTime) {
        this.input.setAnimationFrameTime(timestamp);
      }  
    };
  };
  
  this.init = function(storyElement) {
    this.storyElement = storyElement;
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

    this.setupManager();
    this.onResize();
    this.animate();
  };
  
};

VRStoryManager = function() {
  this.storyList = [];
  this.activeStory = -1;
  this.stateToggler = new VRStateToggler();
  var self = this;

  this.windowedCallback = function() {
    if (self.activeStory<0)
      return;
    self.storyList[self.activeStory].effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    self.storyList[self.activeStory].manager.exitVR();
//     alert("WINDOWED");
  };
  
  this.windowedAnaglyphCallback = function() {
    self.storyList[self.activeStory].effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
//     alert("WINDOWED_ANAGLYPH");
  };

  this.fullscreenCallback = function() {
    if (self.activeStory<0)
      return;
    self.storyList[self.activeStory].effect.setRenderMode(THREE.VRViewerEffectModes.ONE_VIEWPORT);
    self.storyList[self.activeStory].manager.enterImmersive();
//     alert("FULLSCREEN");
  };
  
  this.fullscreenAnaglyphCallback = function() {
    self.storyList[self.activeStory].effect.setRenderMode(THREE.VRViewerEffectModes.ANAGLYPH);
    self.storyList[self.activeStory].manager.enterImmersive();
//     alert("FULLSCREEN_ANAGLYPH");
  };
  
  this.cardboardCallback = function() {
//     self.storyList[self.activeStory].effect.setRenderMode(THREE.VRViewerEffectModes.TWO_VIEWPORTS);
    self.storyList[self.activeStory].manager.enterVR();
//     alert("CARDBOARD");
  };
  
  this.stateToggler.on(VRStates.WINDOWED, this.windowedCallback.bind(this)); 
  this.stateToggler.on(VRStates.WINDOWED_ANAGLYPH, this.windowedAnaglyphCallback.bind(this)); 
  this.stateToggler.on(VRStates.FULLSCREEN, this.fullscreenCallback.bind(this)); 
  this.stateToggler.on(VRStates.FULLSCREEN_ANAGLYPH, this.fullscreenAnaglyphCallback.bind(this)); 
  this.stateToggler.on(VRStates.CARDBOARD, this.cardboardCallback.bind(this)); 
  
  this.stateToggler.setState(VRStates.WINDOWED);

    
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
    story.storyElement.appendChild(this.stateToggler.buttonLeft);
    story.storyElement.appendChild(this.stateToggler.buttonMiddle);
    story.storyElement.appendChild(this.stateToggler.buttonRight);
  };
  
  this.getActiveStory = function() {
    return this.storyList[this.activeStory];
  };
};

THREE.StoryParser = function () {
  this.storyManager = new VRStoryManager();

  this.parseDocXML = function(topElement) {
    var stories=topElement.getElementsByTagName("story");
    for(storyit = 0;storyit < stories.length; storyit++) {
      var story = stories[storyit];
      var vrStory = new VRStory();
      vrStory.init(story);
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


