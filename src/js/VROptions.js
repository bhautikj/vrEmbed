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

var VRLogos = require('./VRIcons.js');

function VROptionsCore() {
  var self = this;

  this.init = function() {
    this.dialog = document.createElement('div');
    var s = this.dialog.style;
    s.position = 'fixed';
    s.top = '0';
    s.right = '0';
    s.bottom = '0';
    s.left = '0';
    s.background = 'rgba(0,0,0,0.8)';
    s.zIndex = '99999';
    s.opacity = '1';
    s.pointerEvents = 'none';
    s.color = '#000';
    s.fontFamily = '"Lucida Console",Monaco,monospace';

    this.dialogText = document.createElement('div');
    var t = this.dialogText.style;
    t.width = '300px';
    t.minHeight = '150px';
  	t.position = 'relative';
  	t.margin = '10% auto';
  	t.padding = '5px 20px 13px 20px';
  	t.borderRadius = '10px';
  	t.background = '#fff';
    s.pointerEvents = 'auto';

    this.dialog.appendChild(this.dialogText);
    this.dialog.addEventListener('click', this.onClickLeft_.bind(this));
    this.dialog.addEventListener('touchstart', this.onClickLeft_.bind(this));

    this.setupDialogOptions();
  }

  this.setupDialogOptions = function() {
    var tex = "";
    tex += '<a href="https://github.com/bhautikj/vrEmbed" target="_blank" style="color: inherit; text-decoration: none;">'
    tex += '<img src=' + VRLogos.logoVrEmbed + ' width=100px style="float: right; margin: 0 0 2px 2px;"/>';
    tex += ' vrEmbed by Bhautik Joshi 2015</a><div style="clear:left;">';
    tex += '-> <img src=' + VRLogos.logoCardboard + ' width=50px> <a href="" style="color: inherit; text-decoration: none;">V1</a> <a href="" style="color: inherit; text-decoration: none;">V2</a><br/>';
    tex += '-> Open in editor<br/>';
    tex += '-> <a href="https://github.com/bhautikj/vrEmbed" target="_blank" style="color: inherit; text-decoration: none;">View code on github</a>';
    this.dialogText.innerHTML = tex;
  }

  this.showDialog = function() {
    document.body.appendChild(this.dialog);
  }

  this.hideDialog = function() {
    document.body.removeChild(this.dialog);
  }

  this.onClickLeft_ = function(e) {
    var go = false;
    if (e.target == this.dialog)
      go = true;

    if (e.target == this.dialogText)
      go = true;

    if (go == false)
      return;

    e.stopPropagation();
    e.preventDefault();
    this.hideDialog();
  }

}

var VROptionsFactory = (function () {
    var instance;

    function createInstance() {
        var object = new VROptionsCore();
        object.init();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


VROptions = function() {
  this.options = VROptionsFactory.getInstance();
}

module.exports = VROptions;
