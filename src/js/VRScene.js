var VRSceneImg = require('./VRSceneImg.js');

VRScene = function() {
  this.sceneElement = null;
  this.renderObjects = [];
  this.oldScroll = null;
  this.isStereo = false;

  this.parseChildNode = function(elm) {
    if(elm.nodeName=="PHOTO"){
      var vrScenePhoto = new VRScenePhoto();
      vrScenePhoto.init(elm);
      if (vrScenePhoto.isStereo == true)
        this.isStereo = true;
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
    if (vrEmbedPhotoElm.isStereo == true)
      this.isStereo = true;
    this.renderObjects.push(vrEmbedPhotoElm);
  }

  this.initFromURLSource = function(scenePhoto) {
    if (scenePhoto.isStereo == true)
      this.isStereo = true;
    this.renderObjects.push(scenePhoto);
  }
};

module.exports = VRScene;
