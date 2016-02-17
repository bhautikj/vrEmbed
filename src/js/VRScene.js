var VRScenePhoto = require('./VRScenePhoto.js');
var VRText = require('./VRText.js');
var VRJump = require('./VRJump.js');

VRScene = function() {
  this.sceneElement = null;
  this.renderObjects = [];
  this.guiObjects = [];
  this.jumpObjects = [];
  this.oldScroll = null;
  this.isStereo = false;
  this.name = "";

  this.parseChildNode = function(elm) {
    if(elm.nodeName=="PHOTO"){
      var vrScenePhoto = new VRScenePhoto();
      vrScenePhoto.init(elm);
      if (vrScenePhoto.isStereo() == true)
        this.isStereo = true;
      this.renderObjects.push(vrScenePhoto);
    } else if (elm.nodeName == "TEXT") {
      var vrText = new VRText();
      vrText.init(elm);
      this.guiObjects.push(vrText);
    } else if (elm.nodeName == "JUMP") {
      var vrJump = new VRJump();
      vrJump.init(elm);
      this.jumpObjects.push(vrJump);
    }

    var elements = elm.children;
    for(elementit = 0;elementit < elements.length; elementit++) {
      var elm = elements[elementit];
      this.parseChildNode(elm);
    }
  }

  this.init = function(sceneElement) {
    this.sceneElement = sceneElement;

    var name = sceneElement.getAttribute("name");
    if (name != null) {
      this.name = name;
    }

    var elements=sceneElement.children;
    for(elementit = 0;elementit < elements.length; elementit++) {
      var elm = elements[elementit];
      this.parseChildNode(elm);
    }
  }

  this.initVrEmbedPhoto = function(vrEmbedPhoto) {
    var vrEmbedPhotoElm = new VRScenePhoto();
    vrEmbedPhotoElm.init(vrEmbedPhoto);
    if (vrEmbedPhotoElm.isStereo() == true)
      this.isStereo = true;
    this.renderObjects.push(vrEmbedPhotoElm);
  }

  this.initFromURLSource = function(scenePhoto) {
    if (scenePhoto.isStereo() == true)
      this.isStereo = true;
    this.renderObjects.push(scenePhoto);
  }

  this.getSceneElement = function() {
    var elm = document.createElement('scene');
    if (this.name != "") {
      elm.setAttribute('name', this.name);
    }

    for(i=0; i<this.renderObjects.length; i++) {
      elm.appendChild(this.renderObjects[i].getPhotoElement());
    }

    for(j=0; j<this.guiObjects.length; j++) {
      elm.appendChild(this.guiObjects[j].getTextElement());
    }

    for(k=0; k<this.jumpObjects.length; k++) {
      elm.appendChild(this.jumpObjects[k].getJumpElement());
    }

    return elm;
  }

  this.hasJumpNav = function() {
    return this.jumpObjects.length!=0;
  }
};

module.exports = VRScene;
