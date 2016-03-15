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
  this.story = null;
  this.headsetSelector = null;
  this.displaySelector = null;
  this.ipdSlider = null;
  this.ipdSliderText = null;

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
    u.maxHeight = '200px';
    u.overflow = 'scroll';
    u.overflowy = 'scroll';

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
    tex += '<b>Scroll to browse & select device:</b><br/><div style="clear:left;">';
    this.dialogText.innerHTML = tex;
  }

  this.createHeadsetSelector = function(objDiv) {
    var devices = this.vrDeviceManager.getDeviceList();
    var selector = document.createElement("select");
    for(deviceit = 0;deviceit<devices.length; deviceit++) {
      var deviceName = devices[deviceit];
      var device = this.vrDeviceManager.getDevice(deviceName);
      var opt = document.createElement("option");
      opt.value = deviceName;
      // var radioImgNode = document.createElement("img");
      // radioImgNode.setAttribute('src', device.icon);
      // radioImgNode.setAttribute('height', '10px');
      // opt.appendChild(radioImgNode);
      var radioTextNode = document.createTextNode(device.name);
      opt.appendChild(radioTextNode);
      selector.appendChild(opt);
    }

    objDiv.appendChild(document.createTextNode("Select headset: "));
    objDiv.appendChild(selector);
    objDiv.appendChild(document.createElement("br"));

    selector.onchange = this.syncManagerToDeviceButtons;
    this.headsetSelector = selector;
  }

  this.createDisplaySelector = function(objDiv) {
    var displays = this.vrDeviceManager.getHandsetList();
    var selector = document.createElement("select");
    for(deviceit = 0;deviceit<displays.length; deviceit++) {
      var displayName = displays[deviceit];
      var display = this.vrDeviceManager.getHandset(displayName);
      var opt = document.createElement("option");
      opt.value = displayName;
      var radioTextNode = document.createTextNode(display.name);
      opt.appendChild(radioTextNode);
      selector.appendChild(opt);
    }

    objDiv.appendChild(document.createTextNode("Select display: "));
    objDiv.appendChild(selector);
    objDiv.appendChild(document.createElement("br"));

    selector.onchange = this.syncManagerToDeviceButtons;
    this.displaySelector = selector;
  }

  this.createUserOffsetSlider = function(objDiv) {
    // <input type="range" name="hFov" min="0" max="360" id="hfov" class="numberinputwide">
    var slider = document.createElement("input");
    slider.type = 'range';
    slider.min = -25;
    slider.max = 25;
    slider.style.width = '100px';
    var sliderTex = document.createTextNode("0mm");

    this.ipdSlider = slider;
    this.ipdSliderText = sliderTex;

    this.ipdSlider.onchange = this.userIPDChange;

    objDiv.appendChild(document.createTextNode("Adjust eye center: "));
    objDiv.appendChild(this.ipdSlider);
    objDiv.appendChild(this.ipdSliderText);
  }

  this.userIPDChange = function() {
    self.ipdSliderText.nodeValue = self.ipdSlider.value + "mm";
  }

  this.syncDeviceButtonsToManager = function() {
    var currentDevice = self.vrDeviceManager.currentDeviceName;
    self.headsetSelector.value = currentDevice;

    var currentHandset = self.vrDeviceManager.currentHandsetName;
    self.displaySelector.value = currentHandset;

    var userIPDOffset = self.vrDeviceManager.userIPDOffset;
    self.ipdSlider.value = userIPDOffset;
    self.ipdSliderText.nodeValue = userIPDOffset + "mm";
  }

  this.syncManagerToDeviceButtons = function() {
    self.vrDeviceManager.setCurrentHandset(self.displaySelector.value);
    self.vrDeviceManager.setCurrentDevice(self.headsetSelector.value);
    self.vrDeviceManager.setUserIPDOffset(self.ipdSlider.value);
  }

  this.setupDialogDevices = function() {
    var tex = "";
    tex += '<span style="font-size:120%">Setup headset:<br/>';
    this.dialogDevices.innerHTML = tex;
    this.createHeadsetSelector(this.dialogDevices);
    this.createDisplaySelector(this.dialogDevices);
    this.createUserOffsetSlider(this.dialogDevices);
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

    if (e.target == this.dialogDevices)
      go = true;

    if (e.target == this.dialogShare)
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
