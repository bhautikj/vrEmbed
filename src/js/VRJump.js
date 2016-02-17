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

VRJump = function() {
  this.jumpElm = null;
  this.textureDescription = null;
  this.jumpTo = null;

  this.init = function(jumpElm) {
    this.jumpElm = jumpElm;
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.setSphereParamsFromString(this.jumpElm.getAttribute("sphereParams"));
    this.jumpTo = this.jumpElm.getAttribute("jumpTo");
  };

  this.getJumpElement = function() {
    var elm = document.createElement('jump');
    elm.setAttribute('sphereParams',this.textureDescription.getSphereParamsString());
    elm.setAttribute('jumpTo', this.jumpTo);
    return elm;
  }
};


module.exports = VRJump;
