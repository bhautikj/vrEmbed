var VRRenderModes = require('./VRRenderModes.js');
var VRIcons = require('./VRIcons.js');

VRScreenWidths = {
  Nexus5 : 110,
  Nexus6: 133,
  GalaxyS6: 114,
  GalaxyNote4: 125,
  LGG3: 121,
  iPhone4: 75,
  iPhone5: 89,
  iPhone6: 104,
  iPhone6p: 112,
};

var calculateIPDAdjust = function(screenWidth, lensIPD) {
  return (lensIPD*0.5-screenWidth*0.25)/(screenWidth*0.25);
}

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
    hfov: 60,
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
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: 0,
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0,0]
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
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: calculateIPDAdjust(VRScreenWidths.iPhone5,64),
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.441,0.156]
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
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: calculateIPDAdjust(VRScreenWidths.iPhone6p,64),
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
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: calculateIPDAdjust(VRScreenWidths.GalaxyS6,60),
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
    // % of screen width parallax to introduce in stereo
    // 0: no adjstment
    // 0.5: rotation centre moved to far left/right screen edges
    ipdAdjust: calculateIPDAdjust(VRScreenWidths.iPhone6,60),
    // lens distortion params: [k1, k2] in k1*r^2 + k2+r^4
    k: [0.093,0.018]
  },
};

VRDeviceManager = function() {
  this.version = "0.1";
  this.currentDeviceName = "ANAGLYPH";
  this.currentDevice = VRDevices[this.currentDeviceName];
  this.windowedDevice = VRDevices["FULLSCREEN"];


  this.init = function() {
    var deviceCookieName = this.version + "_VRDEVICEMANAGER";
    var setCookie = this.getCookie(deviceCookieName);
    if (setCookie!="") {
      this.currentDeviceName = setCookie;
      this.currentDevice = VRDevices[this.currentDeviceName];
    } else {
      this.flushToCookie();
    }
  }

  this.flushToCookie = function() {
    var deviceCookieName = this.version + "_VRDEVICEMANAGER";
    this.setCookie(deviceCookieName, this.currentDeviceName);
  }

  this.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  this.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }

  this.getDeviceList = function() {
    var deviceList = [];
    for (var key in VRDevices) {
      if (key === 'length' || !VRDevices.hasOwnProperty(key)) continue;
      deviceList.push(key);
    }
    return deviceList;
  }

  this.getDevice = function(deviceName) {
    return VRDevices[deviceName];
  }

  this.setCurrentDevice = function(deviceName) {
    this.currentDeviceName = deviceName;
    this.currentDevice = VRDevices[deviceName];
    this.flushToCookie();
  }

  this.getCurrentDevice = function() {
    return this.currentDevice;
  }

  this.getWindowedDevice = function() {
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
