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

function getURLParameters() {
  var prmstr = window.location.search.substr(1);
  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
  var params = {};
  var prmarr = prmstr.split("&");
  for ( var i = 0; i < prmarr.length; i++) {
      var tmparr = prmarr[i].split("=");
      params[tmparr[0]] = decodeURIComponent(tmparr[1]);
      //console.log(tmparr[0], params[tmparr[0]]);
  }
  return params;
}

VRURLParser = function () {
  this.isEditor = false;
  this.params = [];
  this.scenePhoto = null;

  this.parseURL = function() {
    this.params = getURLParameters();
  }

  this.init = function() {
    var editorTags=document.getElementsByTagName("vrEditor");
    this.parseURL();

    var numArgs = 0;
    for (var key in this.params) {
      numArgs+=1;
    }

    if(editorTags.length != 0 && numArgs != 0){
      this.isEditor = true;
    }
  }
};

module.exports = VRURLParser;
