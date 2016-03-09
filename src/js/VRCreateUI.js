var VRScene = require('./VRScene.js');

var NumberSlider = function() {
  var self=this;
  this.sliderElement = null;
  this.textElement = null;
  this.callback = null;

  this.sliderMove = function() {
    self.textElement.value = self.sliderElement.value;
  }

  this.photoStateChange = function() {
    self.textElement.value = self.sliderElement.value;
    self.callback();
  }

  this.textChange = function() {
    if (parseFloat(self.textElement.value) < parseFloat(self.sliderElement.min) ||
        parseFloat(self.textElement.value) > parseFloat(self.sliderElement.max)) {
      self.textElement.value = self.sliderElement.value;
      return;
    }

    self.sliderElement.value = self.textElement.value;
    self.callback();
  }

  this.set = function(value) {
    self.sliderElement.value = value;
    self.textElement.value = value;
  }

  this.get = function() {
    return self.sliderElement.value;
  }

  this.init = function(slider, text, defaultValue, callback) {
    this.sliderElement = slider;
    this.textElement = text;
    this.set(defaultValue);
    this.callback = callback;

    this.sliderElement.oninput = this.sliderMove;
    this.sliderElement.onchange = this.photoStateChange;
    this.textElement.onchange = this.textChange;
  }
}

VRSceneDict = function() {
  this.dict = null;
  this.vrScene = null;

  this.init = function() {
    this.vrScene = new VRScene();
    this.dict = {};
    this.dict.photoObjects=[];
    this.dict.textObjects=[];
    this.dict.jumpObjects=[];
    this.dict.name = "";
  }

  this.initPhoto = function() {
    var photo ={};
    photo.textureDescription = {};
    photo.textureDescription.src="http://vrembed.org/src/assets/vrEmbedLogo.png";
    photo.textureDescription.isStereo = false;
    photo.textureDescription.plane = false;
    photo.textureDescription.sphereFOV = [60,60];
    photo.textureDescription.sphereCentre = [0,0];
    photo.textureDescription.U_l = [0,0];
    photo.textureDescription.V_l = [1,1];
    photo.textureDescription.U_r = [0,0];
    photo.textureDescription.V_r = [1,1];
    return photo;
  }

  this.initText = function() {
    var text ={};
    text.message = "Placeholder text";
    text.textureDescription = {};
    text.textureDescription.src="";
    text.textureDescription.isStereo = false;
    text.textureDescription.plane = false;
    text.textureDescription.sphereFOV = [60,40];
    text.textureDescription.sphereCentre = [0,0];
    text.textOptions = {};
    text.textOptions.align = 'center';
    text.textOptions.fontface = 'Arial';
    text.textOptions.fontsize = '72';
    text.textOptions.borderthickness = '12';
    text.textOptions.bordercolor = '#FFFFFF';
    text.textOptions.backgroundcolor = '#000000';
    text.textOptions.textcolor = '#FFFFFF';
    return text;
  }

  this.initJump = function() {
    var jump ={};
    jump.jumpTo = "";
    jump.jumpText = "Jump text";
    jump.textureDescription = {};
    jump.textureDescription.src="";
    jump.textureDescription.isStereo = false;
    jump.textureDescription.plane = false;
    jump.textureDescription.sphereFOV = [60,40];
    jump.textureDescription.sphereCentre = [0,0];
    jump.textOptions = {};
    jump.textOptions.align = 'center';
    jump.textOptions.fontface = 'Arial';
    jump.textOptions.fontsize = '72';
    jump.textOptions.borderthickness = '12';
    jump.textOptions.bordercolor = '#FFFFFF';
    jump.textOptions.backgroundcolor = '#000000';
    jump.textOptions.textcolor = '#FFFFFF';
    return jump;
  }

  this.addPhoto = function() {
    var photo = this.initPhoto();
    this.dict.photoObjects.push(photo);
  }

  this.removePhoto = function(idx) {
    this.dict.photoObjects.splice(idx,1);
  }

  this.addText = function() {
    var text = this.initText();
    this.dict.textObjects.push(text);
  }

  this.removeText = function(idx) {
    this.dict.textObjects.splice(idx,1);
  }

  this.addJump = function() {
    var jump = this.initJump();
    this.dict.jumpObjects.push(jump);
  }

  this.removeJump = function(idx) {
    this.dict.jumpObjects.splice(idx,1);
  }
}

VRSceneList = function() {
  this.scenes = [];
  this.sceneIdx = -1;

  this.init = function() {
    this.addScene();
    this.sceneIdx = 0;
  }

  this.addScene = function() {
    var sceneDict = new VRSceneDict();
    sceneDict.init();
    this.scenes.push(sceneDict);
  }

  this.getScene = function(idx) {
    return this.scenes[idx];
  }

  this.removeScene = function(idx) {
    if (this.scenes.length>1)
      this.scenes.splice(idx,1);
  }
}

VRCreateUI = function() {
  var self=this;
  this.firstRun = true;
  this.storyManager = null;

  this.photoIdx = 0;
  this.sceneIdx = 0;
  this.sceneList = new VRSceneList();
  this.sceneSelect = null;
  this.sceneName = null;
  this.elementSelect = null;

  this.imageURL = null;
  this.imagePreview = null;
  this.hfovNumberSlider = null;
  this.vfovNumberSlider = null;
  this.xposNumberSlider = null;
  this.yposNumberSlider = null;
  this.isPlane = null;
  this.isStereo = null;
  this.leftStereoParams = null;
  this.rightStereoParams = null;

  this.getStory = function() {
    if (self.storyManager.storyList != [])
      return this.storyManager.storyList[0];
    else
      return null;
  }

  this.photoStateChange = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    // push from gui to dict
    if (type == "photo") {
      var scene = self.sceneList.scenes[self.sceneSelect.value];
      var photo = scene.dict.photoObjects[idx];

      var hfov = parseFloat(self.hfovNumberSlider.get());
      var vfov = parseFloat(self.vfovNumberSlider.get());
      var xpos = parseFloat(self.xposNumberSlider.get());
      var ypos = parseFloat(self.yposNumberSlider.get());

      photo.textureDescription.sphereFOV[0] = hfov;
      photo.textureDescription.sphereFOV[1] = vfov;
      photo.textureDescription.sphereCentre[0] = xpos;
      photo.textureDescription.sphereCentre[1] = ypos;
      photo.textureDescription.src = self.imageURL.value;
      photo.textureDescription.plane = self.isPlane.checked;
      photo.textureDescription.isStereo = self.isStereo.checked;

      var leftStereo = self.leftStereoParams.value.split(',');
      photo.textureDescription.U_l = [leftStereo[0], leftStereo[1]];
      photo.textureDescription.V_l = [leftStereo[2], leftStereo[3]];

      var rightStereo = self.rightStereoParams.value.split(',');
      photo.textureDescription.U_r = [rightStereo[0], rightStereo[1]];
      photo.textureDescription.V_r = [rightStereo[2], rightStereo[3]];
    }
    self.pushFromDictToRender();
  }

  this.loadImage = function() {
    self.photoStateChange();
  }

  this.updateSceneListDropdown = function() {
    self.sceneSelect.innerHTML = "";
    for (i = 0; i < self.sceneList.scenes.length; i++) {
      var scene = self.sceneList.scenes[i];
      var opt = document.createElement('option');
      opt.value = i;
      if (scene.dict.name != "")
        opt.innerHTML = scene.dict.name;
      else
        opt.innerHTML = i;
      self.sceneSelect.appendChild(opt);
    }
  }

  this.populateGUIFromSceneDict = function(idx) {
    self.sceneSelect.value = idx;
    self.elementSelect.innerHTML = "";
    var scene = self.sceneList.scenes[idx];
    this.sceneName.value = scene.dict.name;
    for (i = 0; i < scene.dict.photoObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "photo_" + i;
      opt.innerHTML = "Image " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    for (i = 0; i < scene.dict.textObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "text_" + i;
      opt.innerHTML = "Text " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    for (i = 0; i < scene.dict.jumpObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "jump_" + i;
      opt.innerHTML = "Jump " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    self.pushFromDictToRender();
  }


  this.pushFromGUIToDict = function() {
    self.sceneList.scenes[self.sceneSelect.value].dict.name = self.sceneName.value;
    self.updateSceneListDropdown();
    self.pushFromDictToRender();
  }

  this.addImage = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addPhoto();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "photo_" + (scene.dict.photoObjects.length - 1);
    self.selectElement();
  }

  this.addText = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addText();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "text_" + (scene.dict.textObjects.length - 1);
    self.selectElement();
  }

  this.addJump = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addJump();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "jump_" + (scene.dict.jumpObjects.length - 1);
    self.selectElement();
  }

  this.removeElement = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    var scene = self.sceneList.scenes[self.sceneSelect.value];
    if (type == "photo") {
      scene.removePhoto(idx);
    } else if (type == "text") {
      scene.removeText(idx);
    } else if (type == "jump") {
      scene.removeJump(idx);
    }

    self.populateGUIFromSceneDict(self.sceneSelect.value);
  }

  this.pushFromDictToRender = function() {
    if (self.getStory()==null)
      return;
    self.getStory().sceneList = [];
    for (i = 0; i < self.sceneList.scenes.length; i++) {
      self.getStory().sceneList.push(self.sceneList.scenes[i].vrScene);
    }

    var scene = self.sceneList.scenes[self.sceneSelect.value];
    self.getStory().sceneList[self.sceneSelect.value].initDict(scene.dict);
    self.getStory().setupScene(self.sceneSelect.value);
  }

  this.selectElement = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    // push from dict to gui
    if (type == "photo") {
      var scene = self.sceneList.scenes[self.sceneSelect.value];
      var photo = scene.dict.photoObjects[idx];
      self.hfovNumberSlider.set(photo.textureDescription.sphereFOV[0]);
      self.vfovNumberSlider.set(photo.textureDescription.sphereFOV[1]);
      self.xposNumberSlider.set(photo.textureDescription.sphereCentre[0]);
      self.yposNumberSlider.set(photo.textureDescription.sphereCentre[1]);
      self.imageURL.value = photo.textureDescription.src;
      self.imagePreview.src = self.imageURL.value;
      self.isPlane.checked = photo.textureDescription.plane;
      self.isStereo.checked = photo.textureDescription.isStereo;
      self.leftStereoParams.value = photo.textureDescription.U_l[0] + "," +
                                    photo.textureDescription.U_l[1] + "," +
                                    photo.textureDescription.V_l[0] + "," +
                                    photo.textureDescription.V_l[1];
      self.rightStereoParams.value= photo.textureDescription.U_r[0] + "," +
                                    photo.textureDescription.U_r[1] + "," +
                                    photo.textureDescription.V_r[0] + "," +
                                    photo.textureDescription.V_r[1];
    }
  }

  this.sceneSelectChange = function() {
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.selectElement();
  }

  this.addScene = function() {
    self.sceneList.addScene();
    self.updateSceneListDropdown();
    self.populateGUIFromSceneDict(self.sceneSelect.length - 1);
  }

  this.removeScene = function() {
    self.sceneList.removeScene();
    self.updateSceneListDropdown();
  }

  this.initPhotoPanel = function() {
    this.imageURL = document.getElementById('imageURL');
    this.imagePreview = document.getElementById('imagePreview');
    this.imageURL.onchange = this.loadImage;
    this.imageURL.value = "";

    this.isPlane = document.getElementById('isPlane');
    this.isStereo = document.getElementById('isStereo');
    this.isPlane.onchange = this.photoStateChange;
    this.isStereo.onchange = this.photoStateChange;
    this.leftStereoParams = document.getElementById('leftStereoParams');
    this.rightStereoParams = document.getElementById('rightStereoParams');
    this.leftStereoParams.onchange = this.photoStateChange;
    this.leftStereoParams.onchange = this.photoStateChange;

    var loadButton = document.getElementById("loadImage");
    loadButton.onclick = this.loadImage;

    this.hfovNumberSlider = new NumberSlider();
    this.hfovNumberSlider.init(document.getElementById("hfov"),
                               document.getElementById("hfov_t"),
                               360,
                               this.photoStateChange);

    this.vfovNumberSlider = new NumberSlider();
    this.vfovNumberSlider.init(document.getElementById("vfov"),
                              document.getElementById("vfov_t"),
                              180,
                              this.photoStateChange);

    this.xposNumberSlider = new NumberSlider();
    this.xposNumberSlider.init(document.getElementById("xpos"),
                              document.getElementById("xpos_t"),
                              0,
                              this.photoStateChange);

    this.yposNumberSlider = new NumberSlider();
    this.yposNumberSlider.init(document.getElementById("ypos"),
                              document.getElementById("ypos_t"),
                              0,
                              this.photoStateChange);
  }

  this.init = function(vrStoryManager) {
    this.storyManager = vrStoryManager;

    // scene management
    this.sceneSelect = document.getElementById("sceneSelect");
    this.sceneName = document.getElementById("sceneName");
    this.elementSelect = document.getElementById("elementSelect");
    var addSceneButton = document.getElementById("addScene");
    addSceneButton.onclick = this.addScene;
    var removeSceneButton = document.getElementById("removeScene");
    removeSceneButton.onclick = this.removeScene;
    this.sceneSelect.onchange = this.sceneSelectChange;
    this.sceneName.onchange = this.pushFromGUIToDict;
    this.elementSelect.onchange = this.selectElement;

    var addImageButton = document.getElementById("addImage");
    var addTextButton = document.getElementById("addText");
    var addJumpButton = document.getElementById("addJump");
    var removeElementButton = document.getElementById("removeElement");
    addImageButton.onclick = this.addImage;
    addTextButton.onclick = this.addText;
    addJumpButton.onclick = this.addJump;
    removeElementButton.onclick = this.removeElement;

    this.initPhotoPanel();

    this.sceneList.init();
    this.updateSceneListDropdown();
    this.sceneSelect.value = 0;
    this.sceneSelectChange();
  }
}

module.exports = VRCreateUI;
