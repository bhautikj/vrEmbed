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

VRDecal = function() {
  this.textureDescription = null;
  this.imgsrc = null;

  this.init = function(decal) {
    this.decal = decal;
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.setSphereParamsFromString(this.decal.getAttribute("sphereParams"));
    this.textureDescription.plane = this.textureDescription.parseBoolString(this.decal.getAttribute("plane"));
    this.textureDescription.setPlaneOffsetParamsFromString(this.decal.getAttribute("planeOffset"));

    this.imgsrc = this.decal.getAttribute("src");
    this.jumpTo = this.decal.getAttribute("jumpTo");
    if (this.jumpTo == undefined)
      this.jumpTo = "";
  };

  this.initDict = function(dict) {
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.initDict(dict.textureDescription);
    this.jumpTo = dict.jumpTo;
    this.imgsrc = dict.imgsrc;
  }

  this.getDecalElement = function(){
    var elm = document.createElement('decal');
    this.textureDescription.setElement(elm);
    elm.setAttribute('src', this.imgsrc);
    if(this.jumpTo!="")
      elm.setAttribute('jumpTo', this.jumpTo);
    return elm;
  }

};


module.exports = VRDecal;
