var VRRenderModes = require('./VRRenderModes.js');
var VRIcons = require('./VRIcons.js');

VRHandsets = {
  Desktop : {
    width: -1,
    name: "Desktop browser"
  },
  Nexus5 : {
    width: 110,
    name: "Nexus 5"
  },
  Nexus6: {
    width: 133,
    name: "Nexus 6"
  },
  GalaxyS6: {
    width: 114,
    name: "Samsing Galaxy S6"
  },
  GalaxyNote4: {
    width: 125,
    name: "Samsung Galaxy Note 4"
  },
  LGG3: {
    width: 121,
    name: "LG G3"
  },
  iPhone4: {
    width: 75,
    name: "iPhone 4"
  },
  iPhone5: {
    width: 89,
    name: "iPhone 5"
  },
  iPhone6: {
    width: 104,
    name: "iPhone 6"
  },
  iPhone6p: {
    width: 112,
    name: "iPhone 6 plus"
  },
};

// some params via:
// https://github.com/googlesamples/cardboard-unity/blob/master/Cardboard/Scripts/CardboardProfile.cs

VRDevices = {
  FULLSCREEN : {
    // display name
    name: "Fullscreen",
    // renderer mode
    renderMode: VRRenderModes.MONOCULAR,
    // icon
    icon: VRIcons.logoFullscreen,
    // horizontal field-of-view
    hfov: 120,
    ipd: -1,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0,0]
  },
  ANAGLYPH : {
    // display name
    name: "Red-blue glasses",
    // renderer mode
    renderMode: VRRenderModes.STEREOANAGLYPH,
    // icon
    icon: VRIcons.logoAnaglyph,
    // horizontal field-of-view
    hfov: 60,
    ipd: -1,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0,0]
  },
  CARDBOARDV2 : {
    // display name
    name: "Google Cardboard v2 (2015)",
    // renderer mode
    renderMode: VRRenderModes.STEREOSIDEBYSIDE,
    // icon
    icon: VRIcons.logoCardboard,
    // horizontal field-of-view
    hfov: 60,
    ipd: 64,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.34,0.55]
  },
  VIEWMASTER : {
    // display name
    name: "View-Master VR (2016)",
    // renderer mode
    renderMode: VRRenderModes.STEREOSIDEBYSIDE,
    // icon
    icon: VRIcons.logoCardboard,
    // horizontal field-of-view
    hfov: 50,
    ipd: 64,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.34,0.55]
  },
  GEARVR2015 : {
    // display name
    name: "Samsung Gear VR",
    // renderer mode
    renderMode: VRRenderModes.STEREOSIDEBYSIDE,
    // icon
    icon: VRIcons.logoCardboard,
    // horizontal field-of-view
    hfov: 90,
    ipd: 60,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.215,0.215]
  },
  ZEISSVRONE : {
    // display name
    name: "Zeiss VR ONE",
    // renderer mode
    renderMode: VRRenderModes.STEREOSIDEBYSIDE,
    // icon
    icon: VRIcons.logoCardboard,
    // horizontal field-of-view
    hfov: 90,
    ipd: 60,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.093,0.018]
  },
  CARDBOARDV1 : {
    // display name
    name: "Google Cardboard v1 (2014)",
    // renderer mode
    renderMode: VRRenderModes.STEREOSIDEBYSIDE,
    // icon
    icon: VRIcons.logoCardboard,
    // horizontal field-of-view
    hfov: 40,
    ipd: 64,
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.441,0.156]
  },
};

var calculateIPDAdjust = function(device, handset, useradj) {
  var lensIPD = device.ipd;
  var screenWidth = handset.width;
  if (lensIPD<0 || screenWidth<0)
    return 0;

  var userOffset = useradj/(screenWidth*0.5);
  var ipdAdjust = (lensIPD*0.5-screenWidth*0.25)/(screenWidth*0.5) + userOffset;
  return ipdAdjust;
}

//via: http://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an
var isLocalStorageNameSupported = function() {
  var testKey = 'test', storage = window.localStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

VRDeviceManager = function() {
  this.version = "0.1";
  this.currentDeviceName = "ANAGLYPH";
  this.currentDevice = VRDevices[this.currentDeviceName];
  this.windowedDevice = VRDevices["FULLSCREEN"];
  this.currentHandsetName = "Desktop";
  this.currentHandset = VRHandsets[this.currentHandsetName];
  this.windowedHandset = VRDevices["Desktop"];
  this.userIPDOffset = 0;


  this.useLocalStorage = true;
  this.localDict = null;

  this.init = function() {
    if (isLocalStorageNameSupported() == false) {
      this.useLocalStorage = false;
    }

    var setCookie = this.getCookie();
    if (setCookie!=null) {
      this.currentDeviceName = setCookie.device;
      this.currentDevice = VRDevices[this.currentDeviceName];
      this.currentHandsetName = setCookie.handset;
      this.currentHandset = VRHandsets[this.currentHandsetName];
      this.userIPDOffset = setCookie.userIPDOffset;
    }
  }

  this.firstTime = function() {
    var setCookie = this.getCookie();
    return setCookie==null;
  }

  this.flushToCookie = function() {
    var displayDict = { device: this.currentDeviceName,
                        handset: this.currentHandsetName,
                        userIPDOffset: this.userIPDOffset };
    this.setCookie(displayDict);
  }

  this.setCookie = function(displayDict) {
    if (!this.useLocalStorage) {
      this.localDict = displayDict;
      return;
    }

    var storage = window.localStorage;
    storage.vrEmbedDict_device = displayDict.device;
    storage.vrEmbedDict_handset = displayDict.handset;
    storage.vrEmbedDict_userIPDOffset = displayDict.userIPDOffset;
  }

  this.getCookie = function() {
    if (!this.useLocalStorage) {
      return this.localDict;
    }

    var storage = window.localStorage;
    if (storage.vrEmbedDict_device == undefined ||
        storage.vrEmbedDict_handset == undefined ||
        storage.vrEmbedDict_userIPDOffset == undefined ){
      return null;
    } else {
      var displayDict = { device: storage.vrEmbedDict_device,
                          handset: storage.vrEmbedDict_handset,
                          userIPDOffset: storage.vrEmbedDict_userIPDOffset };
      return displayDict;
    }
  }

  this.getDeviceList = function() {
    var deviceList = [];
    for (var key in VRDevices) {
      if (key === 'length' || !VRDevices.hasOwnProperty(key)) continue;
      deviceList.push(key);
    }
    return deviceList;
  }

  this.getHandsetList = function() {
    var handsetList = [];
    for (var key in VRHandsets) {
      if (key === 'length' || !VRHandsets.hasOwnProperty(key)) continue;
      handsetList.push(key);
    }
    return handsetList;
  }

  this.getDevice = function(deviceName) {
    return VRDevices[deviceName];
  }

  this.getHandset = function(handsetName) {
    return VRHandsets[handsetName];
  }

  this.setUserIPDOffset = function(ipdOfs) {
    this.userIPDOffset = ipdOfs;
    this.flushToCookie();
  }

  this.setCurrentDevice = function(deviceName) {
    this.currentDeviceName = deviceName;
    this.currentDevice = VRDevices[deviceName];
    this.flushToCookie();
  }

  this.setCurrentHandset = function(handsetName) {
    this.currentHandsetName = handsetName;
    this.currentHandset = VRHandsets[handsetName];
    this.flushToCookie();
  }


  this.getCurrentHandset = function() {
    return this.currentHandset;
  }

  this.getWindowedHandset = function() {
    return this.windowedHandset;
  }

  this.getCurrentDevice = function() {
    this.currentDevice.ipdAdjust = calculateIPDAdjust(this.currentDevice, this.currentHandset, this.userIPDOffset);
    return this.currentDevice;
  }

  this.getWindowedDevice = function() {
    this.currentDevice.ipdAdjust = 0;
    return this.windowedDevice;
  }
}

var VRDeviceManagerFactory = (function () {
  var instance;

  function createInstance() {
      var vrDeviceManager = new VRDeviceManager();
      vrDeviceManager.init();
      return vrDeviceManager;
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


module.exports = VRDeviceManagerFactory.getInstance();
