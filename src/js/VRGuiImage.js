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

VRGuiImage = function() {
  this.textureDescription = null;
  this.imgsrc = null;

  this.init = function(guiImage) {
    this.guiImage = guiImage;
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.setSphereParamsFromString(this.guiImage.getAttribute("sphereParams"));
    this.textureDescription.plane = this.textureDescription.parseBoolString(this.guiImage.getAttribute("plane"));
    this.textureDescription.setPlaneOffsetParamsFromString(this.guiImage.getAttribute("planeOffset"));

    this.imgsrc = this.guiImage.getAttribute("src");
    this.jumpTo = this.guiImage.getAttribute("jumpTo");
    if (this.jumpTo == undefined)
      this.jumpTo = "";
  };

  this.initDict = function(dict) {
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.initDict(dict.textureDescription);
    this.jumpTo = dict.jumpTo;
    this.imgsrc = dict.imgsrc;
  }

  this.getGuiImageElement = function(){
    var elm = document.createElement('guiImage');
    this.textureDescription.setElement(elm);
    elm.setAttribute('src', this.imgsrc);
    if(this.jumpTo!="")
      elm.setAttribute('jumpTo', this.jumpTo);
  }

};


module.exports = VRGuiImage;
