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
var VRTextOptions = require('./VRTextOptions.js');


VRJump = function() {
  this.jumpElm = null;
  this.textureDescription = null;
  this.textOptions = null;
  this.jumpTo = null;
  this.jumpText = null;

  this.init = function(jumpElm) {
    this.jumpElm = jumpElm;
    this.jumpElm.setAttribute("hidden", true);
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.setSphereParamsFromString(this.jumpElm.getAttribute("sphereParams"));
    this.jumpTo = this.jumpElm.getAttribute("jumpTo");
    if (this.jumpElm.innerHTML=="")
      this.jumpText = this.jumpTo;
    else
      this.jumpText = this.jumpElm.innerHTML;

    this.textOptions = new VRTextOptions();
    this.textOptions.init(this.jumpElm);
  };

  this.getJumpElement = function() {
    var elm = document.createElement('jump');
    elm.setAttribute('sphereParams',this.textureDescription.getSphereParamsString());
    elm.setAttribute('jumpTo', this.jumpTo);
    elm.innerHTML = this.jumpText;
    this.textOptions.setElement(elm);
    return elm;
  }
};


module.exports = VRJump;
