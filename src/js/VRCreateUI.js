var VRScene = require('./VRScene.js');

var NumberSlider = function() {
  var self=this;
  this.sliderElement = null;
  this.textElement = null;
  this.callback = null;

  this.sliderMove = function() {
    self.textElement.value = self.sliderElement.value;
  }

  this.sliderChange = function() {
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
    this.sliderElement.onchange = this.sliderChange;
    this.textElement.onchange = this.textChange;
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
  this.sceneList = [];


  this.getStory = function() {
    if (self.storyManager.storyList != [])
      return this.storyManager.storyList[0];
    else
      return null;
  }

  this.sliderChange = function() {
    var hfov = parseFloat(self.hfovNumberSlider.get());
    var vfov = parseFloat(self.vfovNumberSlider.get());
    var xpos = parseFloat(self.xposNumberSlider.get());
    var ypos = parseFloat(self.yposNumberSlider.get());

    self.dict.photoObjects[self.photoIdx].textureDescription.sphereFOV = [hfov,vfov];
    self.dict.photoObjects[self.photoIdx].textureDescription.sphereCentre = [xpos,ypos];

    self.getStory().sceneList[self.sceneIdx].initDict(self.dict);
    self.getStory().setupScene(self.sceneIdx);
  }

  this.firstTime = function() {
    if (self.firstRun==false)
      return;

    var vrScene = new VRScene();
    self.getStory().sceneList.push(vrScene);

    self.firstRun = false;
  }

  this.loadImage = function() {
    self.firstTime();

    var imageURL = document.getElementById('imageURL').value;
    document.getElementById('imageSettingsDiv').hidden=false;

    self.dict = {};
    self.dict.photoObjects=[];
    self.dict.textObjects=[];
    self.dict.jumpObjects=[];

    var photo ={};
    photo.textureDescription = {};
    photo.textureDescription.src=document.getElementById('imageURL').value;
    photo.textureDescription.isStereo = false;
    photo.textureDescription.plane = false;
    photo.textureDescription.sphereFOV = [360,180];
    photo.textureDescription.sphereCentre = [0,0];
    self.dict.photoObjects.push(photo);

    // console.log(dict);
    self.getStory().sceneList[self.sceneIdx].initDict(self.dict);
    self.getStory().currentSceneIndex = self.sceneIdx;
    self.getStory().setupScene(self.sceneIdx);
  }


  this.init = function(vrStoryManager) {
    document.getElementById('imageURL').value = "../src/assets/rheingauer_dom.jpg";
    this.storyManager = vrStoryManager;

    var loadButton = document.getElementById("loadImage");
    loadButton.onclick = this.loadImage;

    this.hfovNumberSlider = new NumberSlider();
    this.hfovNumberSlider.init(document.getElementById("hfov"),
                               document.getElementById("hfov_t"),
                               360,
                               this.sliderChange);

    this.vfovNumberSlider = new NumberSlider();
    this.vfovNumberSlider.init(document.getElementById("vfov"),
                              document.getElementById("vfov_t"),
                              180,
                              this.sliderChange);

    this.xposNumberSlider = new NumberSlider();
    this.xposNumberSlider.init(document.getElementById("xpos"),
                              document.getElementById("xpos_t"),
                              0,
                              this.sliderChange);

    this.yposNumberSlider = new NumberSlider();
    this.yposNumberSlider.init(document.getElementById("ypos"),
                              document.getElementById("ypos_t"),
                              0,
                              this.sliderChange);

    document.getElementById('imageURL').onchange = this.loadImage;
   }
}

module.exports = VRCreateUI;
