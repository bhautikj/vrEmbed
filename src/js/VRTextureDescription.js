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

  this.setSphereParamsFromString  = function(str) {
    var arr = str.split(",");
    this.sphereFOV = [arr[0].trim(), arr[1].trim()];
    this.sphereCentre = [arr[2].trim(), arr[3].trim()];
  };

  this.setTexParamsFromString = function(str) {
    var arr = str.split(",");
    this.U_l = [arr[0].trim(), arr[1].trim()];
    this.V_l = [arr[2].trim(), arr[3].trim()];
    this.U_r = [arr[4].trim(), arr[5].trim()];
    this.V_r = [arr[6].trim(), arr[7].trim()];
  };

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

};

module.exports = VRTextureDescription;
