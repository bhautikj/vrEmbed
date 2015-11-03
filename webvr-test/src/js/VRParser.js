VRPhoto = function() {
};

VRScene = function() {
  this.renderObjectList = [];
  
  this.addPhoto = function(photo) {
    this.renderObjectList.push(photo);
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
  
  this.init = function(storyElement) {
    this.storyElement = storyElement;
    this.parentElement = this.storyElement.parentNode;
    
    var scenes=storyElement.children;
    for(sceneit = 0;sceneit < scenes.length; sceneit++) {
      var scene = scenes[sceneit];
      if(scene.nodeName=="SCENE"){
        var sceneElements = scene.children;
        for(sceneelemit = 0; sceneelemit < sceneElements.length; sceneelemit++){
//           this.parseSceneElement(sceneElements[sceneelemit]);
        }
      }
    }
    
    this.setupSceneRenderer();

    //last
    this.onResize();
  };
  
  
  this.addScene = function(scene) {
    this.sceneList.push(scene);
  };
};

VRStoryManager = function() {
  this.storyList = [];
  this.activeStory = -1;
  
  this.addStory = function(story) {
    this.storyList.push(story);
  };  
  
  this.onResize = function() {
    for(i=0;i<this.storyList.length;i++){
      this.storyList[i].onResize();
    }
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
  };
  
  this.onResize = function() {
    this.storyManager.onResize();
  };
};

THREE.VRParser = function ( container, textureDescription ) {
  var containerWidth = container.clientWidth;
  var containerHeight = container.clientHeight;
  // alert(containerWidth +","+ containerHeight);

  //Setup three.js WebGL renderer
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( containerWidth, containerHeight );

  // Append the canvas element created by the renderer to document body element.
  // document.body.appendChild(renderer.domElement);
  container.appendChild( renderer.domElement );

  // Create a three.js scene.
  var scene = new THREE.Scene();

  // Create a three.js camera.
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000);

  // Apply VR headset positional data to camera.
  var controls = new THREE.VRControls(camera);

  // Apply VR stereo rendering to renderer.
  var effect = new THREE.VRViewerEffect(renderer, 0);
  // effect.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(containerWidth, containerHeight);
  
  
  effect.setStereographicProjection(textureDescription);

  // Create a VR manager helper to enter and exit VR mode.
  var manager = new WebVRManager(renderer, effect, {hideButton: false});
  //override render function
  manager.render = function(scene, camera, timestamp) {
    if (this.isVRMode()) {
      this.distorter.preRender();
      this.effect.render(scene, camera);
      this.distorter.postRender();
    } else {
      // Scene may be an array of two scenes, one for each eye.
      if (scene instanceof Array) {
        this.effect.render(scene[0], camera);
      } else {
        this.effect.render(scene, camera);
      }
    }
    if (this.input && this.input.setAnimationFrameTime) {
      this.input.setAnimationFrameTime(timestamp);
    }  
  };
  
  // Request animation frame loop function
  function animate(timestamp) {
    // Update VR headset position and apply to camera.
    controls.update();
    
    manager.renderer.autoClear = false;
    manager.renderer.clear();

    if (manager.isVRMode()){ 
      effect.setRenderMode(2);
    } else {
      effect.setRenderMode(1);
    }
    
    manager.render(scene, camera, timestamp);

    //   uniforms.iGlobalTime.value += 0.001;

    requestAnimationFrame(animate);
  }

  // window.CARDBOARD_DEBUG = true;

  // Kick off animation loop
  animate();
  
  // Handle window resizes
  function onWindowResize() {
    if (effect.isFullscreenMode()) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      effect.setSize(window.innerWidth, window.innerHeight);
    }
    else {
      camera.aspect = containerWidth/containerHeight;
      camera.updateProjectionMatrix();
      effect.setSize(containerWidth, containerHeight);
    }

  }

  window.addEventListener('resize', onWindowResize, false);
};


