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

VRText = function() {
  this.sceneText = null;
  this.textureDescription = null;
  this.message = "";

  this.parseSphereParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.sphereFOV = [arr[0].trim(), arr[1].trim()];
    this.textureDescription.sphereCentre = [arr[2].trim(), arr[3].trim()];
  };

  this.parseMessage = function(str) {
    this.message = str;
  };

  this.init = function(sceneText) {
    this.sceneText = sceneText;
    this.sceneText.setAttribute("hidden", true);
    this.textureDescription = new VRTextureDescription();
    this.parseSphereParams(this.sceneText.getAttribute("sphereParams"));
    this.parseMessage(this.sceneText.innerHTML);
  };

};


module.exports = VRText;
