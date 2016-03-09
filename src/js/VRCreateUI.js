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
    photo.textureDescription.src="";
    photo.textureDescription.isStereo = false;
    photo.textureDescription.plane = false;
    photo.textureDescription.sphereFOV = [360,180];
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
  this.hfovNumberSlider = null;
  this.vfovNumberSlider = null;
  this.xposNumberSlider = null;
  this.yposNumberSlider = null;

  this.photoIdx = 0;
  this.sceneIdx = 0;
  this.sceneList = new VRSceneList();
  this.sceneSelect = null;
  this.sceneName = null;
  this.elementSelect = null;

  // this.getStory = function() {
  //   if (self.storyManager.storyList != [])
  //     return this.storyManager.storyList[0];
  //   else
  //     return null;
  // }

  // this.photoStateChange = function() {
  //   var hfov = parseFloat(self.hfovNumberSlider.get());
  //   var vfov = parseFloat(self.vfovNumberSlider.get());
  //   var xpos = parseFloat(self.xposNumberSlider.get());
  //   var ypos = parseFloat(self.yposNumberSlider.get());
  //
  //   self.dict.photoObjects[self.photoIdx].textureDescription.sphereFOV = [hfov,vfov];
  //   self.dict.photoObjects[self.photoIdx].textureDescription.sphereCentre = [xpos,ypos];
  //
  //   self.getStory().sceneList[self.sceneIdx].initDict(self.dict);
  //   self.getStory().setupScene(self.sceneIdx);
  // }

  // this.firstTime = function() {
  //   if (self.firstRun==false)
  //     return;
  //
  //   var vrScene = new VRScene();
  //   self.getStory().sceneList.push(vrScene);
  //
  //   self.firstRun = false;
  // }

  // this.loadImage = function() {
  //   self.firstTime();
  //
  //   var imageURL = document.getElementById('imageURL').value;
  //   document.getElementById('imageSettingsDiv').hidden=false;
  //
  //   self.dict = {};
  //   self.dict.photoObjects=[];
  //   self.dict.textObjects=[];
  //   self.dict.jumpObjects=[];
  //
  //   var photo ={};
  //   photo.textureDescription = {};
  //   photo.textureDescription.src=document.getElementById('imageURL').value;
  //   photo.textureDescription.isStereo = false;
  //   photo.textureDescription.plane = false;
  //   photo.textureDescription.sphereFOV = [360,180];
  //   photo.textureDescription.sphereCentre = [0,0];
  //   self.dict.photoObjects.push(photo);
  //
  //   // console.log(dict);
  //   self.getStory().sceneList[self.sceneIdx].initDict(self.dict);
  //   self.getStory().currentSceneIndex = self.sceneIdx;
  //   self.getStory().setupScene(self.sceneIdx);
  // }

  // this.initPhotoPanel = function() {
  //   document.getElementById('imageURL').value = "../src/assets/rheingauer_dom.jpg";
  //
  //   var loadButton = document.getElementById("loadImage");
  //   loadButton.onclick = this.loadImage;
  //
  //   this.hfovNumberSlider = new NumberSlider();
  //   this.hfovNumberSlider.init(document.getElementById("hfov"),
  //                              document.getElementById("hfov_t"),
  //                              360,
  //                              this.photoStateChange);
  //
  //   this.vfovNumberSlider = new NumberSlider();
  //   this.vfovNumberSlider.init(document.getElementById("vfov"),
  //                             document.getElementById("vfov_t"),
  //                             180,
  //                             this.photoStateChange);
  //
  //   this.xposNumberSlider = new NumberSlider();
  //   this.xposNumberSlider.init(document.getElementById("xpos"),
  //                             document.getElementById("xpos_t"),
  //                             0,
  //                             this.photoStateChange);
  //
  //   this.yposNumberSlider = new NumberSlider();
  //   this.yposNumberSlider.init(document.getElementById("ypos"),
  //                             document.getElementById("ypos_t"),
  //                             0,
  //                             this.photoStateChange);
  //
  //   document.getElementById('imageURL').onchange = this.loadImage;
  // }

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
  }

  this.addText = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addText();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
  }

  this.addJump = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addJump();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
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
    console.log("PUSHING DICT TO RENDER");
  }

  this.selectElement = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

  }

  this.sceneSelectChange = function() {
    self.populateGUIFromSceneDict(self.sceneSelect.value);
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

    this.sceneList.init();
    this.updateSceneListDropdown();
    this.sceneSelect.value = 0;
    this.sceneSelectChange();
  }
}

module.exports = VRCreateUI;
