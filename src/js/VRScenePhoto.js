/**
  Copyright 2015 Bhautik J Joshi

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/

var VRTextureDescription = require('./VRTextureDescription.js');

VRScenePhoto = function() {
  this.scenePhoto = null;
  this.textureDescription = null;

  this.parseBoolString = function(str) {
    if (str==undefined)
      return false;
    if (str.toLowerCase()=="true")
      return true;
    else
      return false;
  }

  this.init = function(scenePhoto) {
    this.scenePhoto = scenePhoto;
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.textureSource = this.scenePhoto.getAttribute("src");
    if (this.textureDescription.textureSource  == null){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }

    this.textureDescription.metaSource = "";
    this.textureDescription.isStereo = this.parseBoolString(this.scenePhoto.getAttribute("isStereo"));
    this.textureDescription.plane = this.parseBoolString(this.scenePhoto.getAttribute("plane"));
    this.textureDescription.setSphereParamsFromString(this.scenePhoto.getAttribute("sphereParams"));
    this.textureDescription.setPlaneOffsetParamsFromString(this.scenePhoto.getAttribute("planeOffset"));

    if (this.isStereo())
      this.textureDescription.setTexParamsFromString(this.scenePhoto.getAttribute("texParams"));
  };

  this.initDict = function(dict) {
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.initDict(dict.textureDescription);
  }

  this.initFromURL = function(urlDict) {
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.textureSource = urlDict["src"];
    if (this.textureDescription.textureSource  == undefined){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }

    if (urlDict["metaSrc"] != undefined)
      this.textureDescription.metaSource = urlDict["metaSrc"];
    else
      this.textureDescription.metaSource = "";

    this.textureDescription.isStereo = this.parseBoolString(urlDict["isStereo"]);
    this.textureDescription.plane = this.parseBoolString(urlDict["plane"]);
    this.textureDescription.setPlaneOffsetParamsFromString(urlDict["planeOffset"]);

    if (urlDict["sphereParams"] != undefined)
      this.textureDescription.setSphereParamsFromString(urlDict["sphereParams"]);
    else
      this.textureDescription.setSphereParamsFromString("360,180,0,0");

    if (urlDict["texParams"] != undefined)
      this.textureDescription.setTexParamsFromString(urlDict["texParams"]);
    else
      this.textureDescription.setTexParamsFromString("0,0,1,1,0,0,1,1");
  };

  this.populateElementCommon = function(elm) {
    elm.setAttribute('src', this.textureDescription.getAbsoluteTexturePath());
    elm.setAttribute('sphereParams',this.textureDescription.getSphereParamsString());
    if (this.textureDescription.plane == false){
      elm.setAttribute('plane', 'false')
      elm.setAttribute('planeOffset', this.textureDescription.getPlaneOffsetParamsString());
    } else {
      elm.setAttribute('plane', 'true')
    }


    if (this.isStereo() == false) {
      elm.setAttribute('isStereo', 'false');
      return;
    } else {
      elm.setAttribute('isStereo', 'true');
      elm.setAttribute('texParams', this.textureDescription.getTexParamsString());
    }
  }

  this.isStereo = function() {
    return this.textureDescription.isStereo;
  }

  this.getPhotoElement = function() {
    var elm = document.createElement('photo');
    this.populateElementCommon(elm);
    return elm;
  }

  this.getSinglePhotoVrEmbedElement = function() {
    var elm = document.createElement('a');
    elm.setAttribute('class', 'vrEmbedPhoto');
    this.populateElementCommon(elm);
    return elm;
  }

  this.getSinglePhotoURLParams= function() {
    var outstr = "?";
    outstr += "src=" + this.textureDescription.getAbsoluteTexturePath();
    outstr += "&sphereParams=" + this.textureDescription.getSphereParamsString();
    if (this.isStereo() == false) {
      outstr += "&isStereo=false";
    } else {
      outstr += "&isStereo=true";
      outstr += "&texParams="+this.textureDescription.getTexParamsString();
    }

    if(this.textureDescription.plane == false) {
      outstr += "&plane=false";
    } else {
      outstr += "&plane=true";
      outstr += "&planeOffset="+this.textureDescription.getPlaneOffsetParamsString();
    }
    return outstr;
  }

};


module.exports = VRScenePhoto;
