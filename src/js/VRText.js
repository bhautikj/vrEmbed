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

VRText = function() {
  this.sceneText = null;
  this.textureDescription = null;
  this.textOptions = null;
  this.message = "";
  this.jumpTo = "";

  this.parseMessage = function(str) {
    this.message = str;
  };

  this.parseBoolString = function(str) {
    if (str==undefined)
      return false;
    if (str.toLowerCase()=="true")
      return true;
    else
      return false;
  }

  this.init = function(sceneText) {
    this.sceneText = sceneText;
    this.sceneText.setAttribute("hidden", true);

    this.parseMessage(this.sceneText.innerHTML);
    this.jumpTo = this.sceneText.getAttribute("jumpTo");
    if (this.jumpTo == undefined)
      this.jumpTo = "";

    this.textureDescription = new VRTextureDescription();
    this.textureDescription.init(this.sceneText);

    this.textOptions = new VRTextOptions();
    this.textOptions.init(this.sceneText);
  };

  this.initDict = function(dict) {
    this.textureDescription = new VRTextureDescription();
    this.textureDescription.initDict(dict.textureDescription);
    this.parseMessage(dict.message);
    this.jumpTo = dict.jumpTo;
    this.textOptions = new VRTextOptions();
    this.textOptions.initDict(dict.textOptions);
  }


  this.getTextElement = function() {
    var elm = document.createElement('text');
    this.textureDescription.setElement(elm);
    
    elm.innerHTML = this.message;
    if(this.jumpTo!="")
      elm.setAttribute('jumpTo', this.jumpTo);

    this.textOptions.setElement(elm);
    return elm;
  }
};


module.exports = VRText;
