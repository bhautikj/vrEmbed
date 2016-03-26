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

VRTextureDescription = function () {
  this.textureSource = "";
  this.metaSource = "";
  this.isStereo = false;
  // in degrees
  this.sphereFOV = [360,180];
  // in degrees
  this.sphereCentre = [0,0];
  // in uv coords (0,1)
  this.U_l = [0,0];
  this.V_l = [1,1];
  this.U_r = [0,0];
  this.V_r = [1,1];
  this.plane = false;
  this.planeOffset = [0,0];

  this.parseBoolString = function(str) {
    if (str==undefined)
      return false;
    if (str.toLowerCase()=="true")
      return true;
    else
      return false;
  }

  this.setPlaneOffsetParamsFromString  = function(str) {
    if (str == undefined)
      return;
    var arr = str.split(",");
    this.planeOffset = [parseFloat(arr[0].trim()), parseFloat(arr[1].trim())];
  };

  this.setSphereParamsFromString  = function(str) {
    var arr = str.split(",");
    this.sphereFOV = [parseFloat(arr[0].trim()), parseFloat(arr[1].trim())];
    this.sphereCentre = [parseFloat(arr[2].trim()), parseFloat(arr[3].trim())];
  };

  this.setTexParamsFromString = function(str) {
    var arr = str.split(",");
    this.U_l = [parseFloat(arr[0].trim()), parseFloat(arr[1].trim())];
    this.V_l = [parseFloat(arr[2].trim()), parseFloat(arr[3].trim())];
    this.U_r = [parseFloat(arr[4].trim()), parseFloat(arr[5].trim())];
    this.V_r = [parseFloat(arr[6].trim()), parseFloat(arr[7].trim())];
  };

  this.getPlaneOffsetParamsString = function() {
    return this.planeOffset[0] + ',' + this.planeOffset[1];
  }

  this.getSphereParamsString = function() {
    return this.sphereFOV[0] + ',' + this.sphereFOV[1] + ',' +
           this.sphereCentre[0] + ',' + this.sphereCentre[1];
  }

  this.getTexParamsString = function() {
    return this.U_l[0] + ',' + this.U_l[1] + ',' +
           this.V_l[0] + ',' + this.V_l[1] + ',' +
           this.U_r[0] + ',' + this.U_r[1] + ',' +
           this.V_r[0] + ',' + this.V_r[1];
  }

  this.getAbsoluteTexturePath = function() {
    var link = document.createElement("a");
    link.href = this.textureSource;
    return (link.protocol+"//"+link.host+link.pathname+link.search+link.hash);
  }

  this.init = function(elm) {
    this.setSphereParamsFromString(elm.getAttribute("sphereParams"));
    this.plane = this.parseBoolString(elm.getAttribute("plane"));
    this.setPlaneOffsetParamsFromString(elm.getAttribute("planeOffset"));

    this.textureSource = elm.getAttribute("src");
    if (this.textureSource  == undefined)
      this.textureSource = "";

    this.metaSource = "";

    this.isStereo = this.parseBoolString(elm.getAttribute("isStereo"));
    if (this.isStereo == undefined)
      this.isStereo = false;

    if (this.isStereo == true)
      this.setTexParamsFromString(elm.getAttribute("texParams"));

  }

  this.initDict = function(dict) {
    this.textureSource = dict.src;
    if (this.textureSource  == null) {
      //TODO: throw exception
      this.textureSource = null;
      return;
    }
    this.metaSource = "";
    this.isStereo = dict.isStereo;
    this.plane = dict.plane;
    this.sphereFOV = dict.sphereFOV;
    this.sphereCentre = dict.sphereCentre;
    this.planeOffset = dict.planeOffset;
    if (this.isStereo) {
      this.U_l = dict.U_l;
      this.V_l = dict.V_l;
      this.U_r = dict.U_r;
      this.V_r = dict.V_r;
    }
  }

  this.setElement = function(elm) {
    if (this.textureSource!="")
      elm.setAttribute('src', this.getAbsoluteTexturePath());

    elm.setAttribute('sphereParams',this.getSphereParamsString());

    if (this.plane == false){
      elm.setAttribute('plane', 'false')
    } else {
      elm.setAttribute('plane', 'true')
      elm.setAttribute('planeOffset', this.getPlaneOffsetParamsString());
    }

    if (this.isStereo == false) {
      elm.setAttribute('isStereo', 'false');
    } else {
      elm.setAttribute('isStereo', 'true');
      elm.setAttribute('texParams', this.getTexParamsString());
    }
  }

};

module.exports = VRTextureDescription;
