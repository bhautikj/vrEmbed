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
var VRStates = require('./VRStates.js');
var VRDeviceManager = require('./VRDeviceManager.js');

var createDialogTextStyle = function(t) {
  t.width = '350px';
  t.position = 'relative';
  t.margin = '10px auto';
  t.padding = '10px 10px 10px 10px';
  t.borderRadius = '5px';
  t.borderStlyle = 'solid';
  t.borderColor = '#ff0000 #0000ff';
  t.background = '#fff';
  // t.pointerEvents = 'auto';
}

function VROptionsCore() {
  var self = this;
  this.vrDeviceManager = VRDeviceManager;
  this.deviceButtons = [];
  this.story = null;

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
    //s.pointerEvents = 'none';
    s.pointerEvents = 'auto';
    s.color = '#000';
    s.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    s.fontWeight = 'bold';

    this.dialogText = document.createElement('div');
    var t = this.dialogText.style;
    createDialogTextStyle(t);
    t.minHeight = '60px';

    this.dialogDevices = document.createElement('div');
    var u = this.dialogDevices.style;
    createDialogTextStyle(u);
    u.maxHeight = '100px';
    u.overflow = 'scroll';

    this.dialogShare = document.createElement('div');
    var w = this.dialogShare.style;
    createDialogTextStyle(w);
    w.maxHeight = '100px';
    w.overflow = 'scroll';

    this.dialog.appendChild(this.dialogText);
    this.dialog.appendChild(this.dialogDevices);
    this.dialog.appendChild(this.dialogShare);

    this.dialog.addEventListener('click', this.onClickLeft_.bind(this));
    this.dialog.addEventListener('touchstart', this.onClickLeft_.bind(this));

    this.setupDialogOptions();
    this.setupDialogDevices();
    this.setupDialogShare(null);
  }

  this.setupDialogOptions = function() {
    var tex = "";
    tex += '<img src=' + VRLogos.logoVrEmbed + ' width=60px style="float: left; margin: 2px 2px 2px 2px;"/>';
    tex += '<a href="http://vrEmbed.org" target="_blank" style="color: inherit; text-decoration: none;">'
    tex += '<br/>vrEmbed.org</a><br/><span style="font-size:70%">(c) Bhautik Joshi 2015-16</span><div style="clear:left;">';
    this.dialogText.innerHTML = tex;
  }

  this.setupDialogSetup = function() {
    var tex = "";
    tex += '<img src=' + VRLogos.logoVrEmbed + ' width=60px style="float: right; margin: 0 0 2px 2px;"/>';
    tex += '<b>Please select device:</b><br/><div style="clear:left;">';
    this.dialogText.innerHTML = tex;
  }

  this.createRadio = function(objDiv){
    var devices = this.vrDeviceManager.getDeviceList();
    for(deviceit = 0;deviceit<devices.length; deviceit++) {
      var deviceName = devices[deviceit];
      var device = this.vrDeviceManager.getDevice(deviceName);

      var radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = "deviceSelector";
      radioButton.id = "device" + deviceit;
      radioButton.value = deviceName;
      radioButton.addEventListener("click", this.radioClick);

      //var deviceLabelText = '<img src=' + device.icon + ' width=100px"/>' + ;
      var radioImgNode = document.createElement("img");
      radioImgNode.setAttribute('src', device.icon);
      radioImgNode.setAttribute('height', '25px');
      var radioTextNode = document.createTextNode(device.name);

      var radioLabel = document.createElement("label");
      radioLabel.htmlFor = radioButton.id;
      radioLabel.appendChild(radioButton);
      radioLabel.appendChild(radioImgNode);
      radioLabel.appendChild(radioTextNode);
      radioLabel.appendChild(document.createElement("br"));

      this.deviceButtons[deviceName] = [radioButton, radioLabel];

      objDiv.appendChild(radioLabel);
    }
  }

  this.radioClick = function() {
    // console.log("BLERGH");
    self.syncManagerToDeviceButtons();
  }

  this.syncDeviceButtonsToManager = function() {
    var currentDevice = this.vrDeviceManager.currentDeviceName;
    //console.log(currentDevice.name);
    for (var key in this.deviceButtons) {
      if (key === 'length' || !this.deviceButtons.hasOwnProperty(key)) continue;

      //console.log(this.vrDeviceManager.getDevice(key).name, currentDevice.name);
      if (key == currentDevice){
        this.deviceButtons[key][0].checked = true;
        //this.deviceButtons[key][1].style.border = "2px solid #F00";
      }
      else
        this.deviceButtons[key][0].checked = false;
        //this.deviceButtons[key][1].style.border = "2px solid transparent";
    }
  }

  this.syncManagerToDeviceButtons = function() {
    for (var key in this.deviceButtons) {
      if (key === 'length' || !this.deviceButtons.hasOwnProperty(key)) continue;
        if (this.deviceButtons[key][0].checked == true) {
          this.vrDeviceManager.setCurrentDevice(key);
          break;
        }
    }
  }

  this.setupDialogDevices = function() {
    var tex = "";
    tex += 'Choose device:<br/>';
    this.dialogDevices.innerHTML = tex;
    this.createRadio(this.dialogDevices);
    this.syncDeviceButtonsToManager();
  }

  this.setupShareButton = function(elm, col, tex) {
    elm.style.borderRadius = "10px";
    elm.style.padding = "5px";
    elm.style.margin = "5px";
    elm.style.backgroundColor = col;
    elm.style.fontSize = "80%";
    elm.style.color = '#fff';
    elm.innerHTML = tex;
  }

  this.setupDialogShare = function(shareCodes) {
    this.dialogShare.innerHTML = '<span style="font-size:120%">Share:<br/>';
    if (shareCodes == null)
      return;

    var url = shareCodes[0];
    var embed = shareCodes[1];

    var twitterURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Check out my #vrEmbed ") + url;
    var facebookURL = "https://www.facebook.com/sharer/sharer.php?u=" + url;
    var gplusURL = "https://plus.google.com/share?url=" + url;
    var redditURL = "http://www.reddit.com/submit?url=" + url;

    var shareDiv = document.createElement("div");
    shareDiv.style.textAlign = 'center';

    var twitterButton = document.createElement("span");
    var twitterLink = '<a href="' + twitterURL + '" target="_blank" style="color: inherit; text-decoration: none;">Twitter</a>';
    this.setupShareButton(twitterButton, '#00aced', twitterLink);
    shareDiv.appendChild(twitterButton);

    var facebookButton = document.createElement("span");
    var facebookLink = '<a href="' + facebookURL + '" target="_blank" style="color: inherit; text-decoration: none;">Facebook</a>';
    this.setupShareButton(facebookButton, '#3b5998', facebookLink);
    shareDiv.appendChild(facebookButton);

    var gplusButton = document.createElement("span");
    var gplusLink = '<a href="' + gplusURL + '" target="_blank" style="color: inherit; text-decoration: none;">G+</a>';
    this.setupShareButton(gplusButton, '#dd4b39', gplusLink);
    shareDiv.appendChild(gplusButton);

    var redditButton = document.createElement("span");
    var redditLink = '<a href="' + redditURL + '" target="_blank" style="color: inherit; text-decoration: none;">Reddit</a>';
    this.setupShareButton(redditButton, '#ff5700', redditLink);
    shareDiv.appendChild(redditButton);

    this.dialogShare.appendChild(shareDiv);

    var codeDiv = document.createElement("div");
    var embedTex = document.createElement("span");
    embedTex.style.fontSize="120%";
    embedTex.innerHTML = "Embed:";
    codeDiv.appendChild(embedTex);

    var embedCodeBox = document.createElement("input");
    embedCodeBox.setAttribute('value',embed);
    embedCodeBox.style.width = "100%";
    embedCodeBox.style.fontWeight = 'normal';
    embedCodeBox.style.fontFamily = '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace';
    codeDiv.appendChild(embedCodeBox);

    this.dialogShare.appendChild(codeDiv);
  }

  this.showDialogOptions = function() {
    this.setupDialogOptions();
    this.dialogDevices.style.display = "block";
    this.dialogShare.style.display = "none";
    document.body.appendChild(this.dialog);
    this.syncDeviceButtonsToManager();
  }

  this.showDialogShare = function(shareCodes) {
    this.setupDialogShare(shareCodes);
    this.dialogDevices.style.display = "none";
    this.dialogShare.style.display = "block";
    document.body.appendChild(this.dialog);
  }

  this.showDialogOptionsFirstTime = function(story) {
    this.setupDialogSetup();
    this.dialogDevices.style.display = "block";
    this.dialogShare.style.display = "none";
    document.body.appendChild(this.dialog);
    this.syncDeviceButtonsToManager();
    this.story = story;
  }

  this.hideDialog = function() {
    document.body.removeChild(this.dialog);
    this.syncManagerToDeviceButtons();

    if (this.story != null) {
      this.story.stateToggler.setState(VRStates.FULLSCREEN);
      this.story = null;
    }
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
