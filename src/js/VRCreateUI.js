var VRScene = require('./VRScene.js');

// via: http://stackoverflow.com/questions/22575636/how-to-check-if-a-canvas-element-has-been-tainted/22580129#22580129
var newImage = function(src,callWhenTainted,callWhenNotTainted){
  // tmpCanvas to test CORS
  var tmpCanvas=document.createElement("canvas");
  var tmpCtx=tmpCanvas.getContext("2d");
  // tmpCanvas just tests CORS, so make it 1x1px
  tmpCanvas.width=tmpCanvas.height=1;

  var img=new Image();
  var isLoaded =false;
  // set the cross origin flag (and cross our fingers!)
  img.crossOrigin="anonymous";
  img.onload=function(){
    if (isLoaded)
      return;
    // add a tainted property to the image
    // (initialize it to true--is tainted)
    img.tainted=true;
    // draw the img on the temp canvas
    tmpCtx.drawImage(img,0,0);
    // just in case this onload stops on a CORS error...
    // set a timer to call afterOnLoad shortly
    setTimeout(function(){
       afterOnLoad(img,callWhenTainted,callWhenNotTainted);
    },500);  // you can probably use less than 1000ms
    // try to violate CORS
    var i=tmpCtx.getImageData(1,1,1,1);
    // if we get here, CORS is OK so set tainted=false
    img.tainted=false;
    isLoaded =true;
  };

  if(img.addEventListener) {
    img.addEventListener('error', function (e) {
        e.preventDefault(); // Prevent error from getting thrown
        // Handle error here
        callWhenTainted(img);
    });
  }
  img.src=src;
  return(img);
}

// called from image.onload
// at this point the img.tainted flag is correct
var afterOnLoad = function(img,callWhenTainted,callWhenOK){
  if(img.tainted){
    // it's tainted
    callWhenTainted(img);
  } else {
    // it's OK, do dataURL stuff
    callWhenOK(img);
  }
}

var imageNotOK = function(img) {
  var msg = "Cannot load image: " + img.src + " - problem loading image or host does not allow remote loading of images (CORS error)."
  console.log(msg);
}

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
  this.storyManager = null;
  this.hfovNumberSlider = null;
  this.vfovNumberSlider = null;
  this.xposNumberSlider = null;
  this.yposNumberSlider = null;

  this.photoIdx = 0;
  this.sceneIdx = 0;


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

    self.vrScene.initDict(self.dict);
    self.getStory().setupScene(self.sceneIdx);
  }

  this.proceed = function(img) {
    self.vrScene = new VRScene();
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
    self.vrScene.initDict(self.dict);

    self.getStory().sceneList.push(self.vrScene);
    self.getStory().currentSceneIndex = 0;
    self.getStory().setupScene(0);
  }

  this.loadImage = function() {
    var imageURL = document.getElementById('imageURL').value;
    var img = newImage(imageURL, imageNotOK, self.proceed);
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

   }
}

module.exports = VRCreateUI;
