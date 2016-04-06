var VRScenePhoto = require('./VRScenePhoto.js');
var VRText = require('./VRText.js');
var VRDecal = require('./VRDecal.js');

VRScene = function() {
  this.sceneElement = null;
  this.photoObjects = [];
  this.textObjects = [];
  this.decalObjects = [];
  this.oldScroll = null;
  this.isStereo = false;
  this.name = "";

  this.parseChildNode = function(elm) {
    if(elm.nodeName=="PHOTO"){
      var vrScenePhoto = new VRScenePhoto();
      vrScenePhoto.init(elm);
      if (vrScenePhoto.isStereo() == true)
        this.isStereo = true;
      this.photoObjects.push(vrScenePhoto);
    } else if (elm.nodeName == "TEXT") {
      var vrText = new VRText();
      vrText.init(elm);
      this.textObjects.push(vrText);
    } else if (elm.nodeName == "DECAL") {
      var vrDecal = new VRDecal();
      vrDecal.init(elm);
      this.decalObjects.push(vrDecal);
    }

    var children = elm.childNodes;
    for(var i = 0, l=children.length; i<l; ++i) {
        var child = children[i];
        if(child.nodeType === 1) {
          this.parseChildNode(child);
        }
    }
  }

  this.init = function(sceneElement) {
    this.sceneElement = sceneElement;

    var name = sceneElement.getAttribute("name");
    if (name != null) {
      this.name = name;
    }

    var children = sceneElement.childNodes;
    for(var i = 0, l=children.length; i<l; ++i) {
        var child = children[i];
        if(child.nodeType === 1) {
          this.parseChildNode(child);
        }
    }
  }

  this.initDict = function(dict) {
    this.photoObjects = [];
    this.textObjects = [];
    this.decalObjects = [];

    for (var i = 0, l=dict.photoObjects.length; i<l; ++i) {
      var photoObject = new VRScenePhoto();
      photoObject.initDict(dict.photoObjects[i]);
      this.photoObjects.push(photoObject);
    }

    for (var i = 0, l=dict.textObjects.length; i<l; ++i) {
      var textObject = new VRText();
      textObject.initDict(dict.textObjects[i]);
      this.textObjects.push(textObject);
    }

    for (var i = 0, l=dict.decalObjects.length; i<l; ++i) {
      var vrDecal = new VRDecal();
      vrDecal.initDict(dict.decalObjects[i]);
      this.decalObjects.push(vrDecal);
    }

    this.name = dict.name;
  }


  this.initVrEmbedPhoto = function(vrEmbedPhoto) {
    var vrEmbedPhotoElm = new VRScenePhoto();
    vrEmbedPhotoElm.init(vrEmbedPhoto);
    if (vrEmbedPhotoElm.isStereo() == true)
      this.isStereo = true;
    this.photoObjects.push(vrEmbedPhotoElm);
  }

  this.getSceneElement = function() {
    var elm = document.createElement('scene');
    if (this.name != "") {
      elm.setAttribute('name', this.name);
    }

    for(i=0; i<this.photoObjects.length; i++) {
      elm.appendChild(this.photoObjects[i].getPhotoElement());
    }

    for(j=0; j<this.textObjects.length; j++) {
      elm.appendChild(this.textObjects[j].getTextElement());
    }

    for(k=0; k<this.decalObjects.length; k++) {
      elm.appendChild(this.decalObjects[k].getDecalElement());
    }

    return elm;
  }

  this.hasJumpNav = function() {

    for(j=0; j<this.textObjects.length; j++) {
      if (this.textObjects[j].jumpTo!="")
        return true;
    }

    for(j=0; j<this.decalObjects.length; j++) {
      if (this.decalObjects[j].jumpTo!="")
        return true;
    }

    return false;
  }
};

module.exports = VRScene;
