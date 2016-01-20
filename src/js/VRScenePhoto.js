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
  this.isStereo = false;

  this.parseSphereParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.sphereFOV = [arr[0].trim(), arr[1].trim()];
    this.textureDescription.sphereCentre = [arr[2].trim(), arr[3].trim()];
  };

  this.parseTexParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.U_l = [arr[0].trim(), arr[1].trim()];
    this.textureDescription.V_l = [arr[2].trim(), arr[3].trim()];
    this.textureDescription.U_r = [arr[4].trim(), arr[5].trim()];
    this.textureDescription.V_r = [arr[6].trim(), arr[7].trim()];
  };

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
    this.textureDescription.isStereo = this.scenePhoto.getAttribute("isStereo");
    if (this.textureDescription.isStereo.toLowerCase()=="true")
      this.isStereo = true;
    this.parseSphereParams(this.scenePhoto.getAttribute("sphereParams"));

    if (this.textureDescription.isStereo.toLowerCase() == "true")
      this.parseTexParams(this.scenePhoto.getAttribute("texParams"));
  };

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

    if (urlDict["isStereo"] != undefined)
      this.textureDescription.isStereo = urlDict["isStereo"];
    else
      this.textureDescription.isStereo = "false";

    if (this.textureDescription.isStereo.toLowerCase()=="true")
      this.isStereo = true;

    if (urlDict["sphereParams"] != undefined)
      this.parseSphereParams(urlDict["sphereParams"]);
    else
      this.parseSphereParams("360,180,0,0");

    if (urlDict["texParams"] != undefined)
      this.parseTexParams(urlDict["texParams"]);
    else
      this.parseTexParams("0,0,1,1,0,0,1,1");
  };
};


module.exports = VRScenePhoto;
