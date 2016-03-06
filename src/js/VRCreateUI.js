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

VRCreateUI = function() {
  var self=this;
  this.storyManager = null;
  this.hfovButton = document.getElementById("hfov");
  this.vfovButton = document.getElementById("vfov");
  this.xposButton = document.getElementById("xpos");
  this.yposButton = document.getElementById("ypos");

  this.getStory = function() {
    if (self.storyManager.storyList != [])
      return this.storyManager.storyList[0];
    else
      return null;
  }

  this.paramChange = function() {
    var xpos = parseFloat(self.xposButton.value) + 360;
    var ypos = parseFloat(self.yposButton.value) + 360;
  }

  this.proceed = function(img) {
    console.log("PROCEEDING");
    var vrScene = new VRScene();
    var dict = {};
    dict.photoObjects=[];
    dict.textObjects=[];
    dict.jumpObjects=[];

    var photo ={};
    photo.textureDescription = {};
    photo.textureDescription.src="../src/assets/rheingauer_dom.jpg";
    photo.textureDescription.isStereo = false;
    photo.textureDescription.plane = false;
    photo.textureDescription.sphereFOV = [360,180];
    photo.textureDescription.sphereCentre = [0,0];
    dict.photoObjects.push(photo);

    console.log(dict);
    vrScene.initDict(dict);

    self.getStory().sceneList.push(vrScene);
    self.getStory().currentSceneIndex = 0;
    self.getStory().setupScene(0);
  }

  this.loadImage = function() {
    console.log("LOADIMAGE");

    //var imageURL = document.getElementById('imageURL').value;
    var imageURL = "../src/assets/rheingauer_dom.jpg";
    var img = newImage(imageURL, imageNotOK, self.proceed);
  }

  this.init = function(vrStoryManager) {
    this.storyManager = vrStoryManager;

    var loadButton = document.getElementById("loadImage");
    loadButton.onclick = this.loadImage;

    this.hfovButton.oninput = this.paramChange;
    this.hfovButton.onchange = this.paramChange;
    this.vfovButton.oninput = this.paramChange;
    this.vfovButton.onchange = this.paramChange;
    this.xposButton.oninput = this.paramChange;
    this.xposButton.onchange = this.paramChange;
    this.yposButton.oninput = this.paramChange;
    this.yposButton.onchange = this.paramChange;
   }
}

module.exports = VRCreateUI;
