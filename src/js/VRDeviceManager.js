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
  iPhoneSE: {
    width: 89,
    name: "iPhone SE"
  },
  iPhone4: {
    width: 75,
    name: "iPhone 4"
  },
  iPhone5s: {
    width: 89,
    name: "iPhone 5s"
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
    hfov: 90,
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
  ALIANSOFTWAREALIANCARDBOARDV11 : {name: "Alian Software Alian Cardboard V1.1", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0,0] },
  UNOFFICIALCODEBYMETAMARIAANTVR : {name: "AntVR", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [-0.07,0.189] },
  BAOFENGMOJINGLLL : {name: "Baofeng Mojing lll", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:75, ipd:59, ipdAdjust: 0, k: [0.07,0.15] },
  AURAVRAURAVRV2 : {name: "Aura VR Aura VR v2", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  UNOFFICIALCODEBYMETAMARIABAOFENGSMALLMOJING : {name: "Baofeng Small Mojing", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [0.15,0.219] },
  BAOFENGMOJINGIVGAMES : {name: "Baofeng Mojing IV Games", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:56, ipdAdjust: 0, k: [0.61,1.129] },
  BOXGLASSV10 : {name: "Boxglass v1.0", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.009,0.009] },
  IAMCARDBOARDIACGIANTEVAHEADSET : {name: "I AM Cardboard IAC Giant EVA Headset", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [0,0] },
  UNOFFICIALCARDBOARD20PLUS : {name: "Unofficial Cardboard 2.0 Plus", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0,0] },
  HANDSTANDSCOBRAVR : {name: "HandStands Cobra VR™", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.477,-0.209] },
  COLORCROSSCOLORCROSS1 : {name: "Colorcross Colorcross-1", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:56, ipdAdjust: 0, k: [0.18,0.18] },
  DEFAIRYVRSH020 : {name: "DEFAIRY VRSH020", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0,0] },
  DESTEK2016V3 : {name: " Destek 2016 v3", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [-0.009,0.009] },
  DOMONHANCEVRC57 : {name: "DOMO nHance VRC57", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:65, ipdAdjust: 0, k: [0,0] },
  DSCOPEPRODSCOPEPROVR : {name: "D-Scope Pro D-Scope Pro VR", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.009,-0.009] },
  IAMCARDBOARDDSCVRHEADSET : {name: "I AM Cardboard DSCVR headset", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [0.34,0.55] },
  DUROVISDIVE7 : {name: "Durovis Dive 7", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:54, ipdAdjust: 0, k: [0.4,-0.18] },
  FIBRUMPRO : {name: "FIBRUM Pro", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.545,0.545] },
  PROTEUSVRLABSFREEFLY : {name: "Proteus VR Labs Freefly", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.209,0.209] },
  PROTEUSVRLABSFREEFLY : {name: "Proteus VR Labs Freefly", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.209,0.209] },
  SAMSUNGSMR320GEARVRNOTE4 : {name: "Samsung SM-R320 (Gear VR Note 4)", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.215,0.215] },
  IAMCARDBOARDIACGIANTEVAHEADSET : {name: "I AM Cardboard IAC Giant EVA Headset", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [0,0] },
  HOMIDOHOMIDOMINI : {name: "Homido Homido mini", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.17,0.05] },
  IAMCARDBOARDCLASSIC : {name: "I AM Cardboard Classic", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.25,0.25] },
  IMMERSEVRHEADSET : {name: " Immerse VR Headset", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:54, ipdAdjust: 0, k: [0.119,0.159] },
  PROTEUSVRLABSFREEFLY : {name: "Proteus VR Labs Freefly", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.209,0.209] },
  INCREDISONICM700VUESERIESVRGLASSES : {name: "IncrediSonic M700 VUE Series VR Glasses", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:64, ipdAdjust: 0, k: [0.019,0.019] },
  VRBOXNOBUTTON : {name: " VR Box - no button", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:68, ipdAdjust: 0, k: [0.019,0.019] },
  YOURCOMPANYLINGVR : {name: "Your company Ling VR", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:54, ipdAdjust: 0, k: [0.319,-0.019] },
  MERGEVRMERGE360GOGGLES : {name: "Merge VR Merge 360º Goggles", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.07,0.029] },
  MODECOMVOLCANOBLAZE : {name: "Modecom Volcano Blaze",renderMode: VRRenderModes.STEREOSIDEBYSIDE,icon: VRIcons.logoAnaglyph,hfov:50,ipd:45,ipdAdjust: 0,k: [0.07,0.05] },
  NEXTCORECORPNOONVRGOGGLE : {name: "Nextcore Corp. NOON VR Goggle", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.14,0.14] },
  OWLVRVIEWER : {name: "Owl VR Viewer", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:57, ipdAdjust: 0, k: [0.46,0.23] },
  ONEPLUSCARDBOARDVIEWERV11 : {name: "OnePlus Cardboard Viewer v1.1", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  PLANETVRCARDBOARD : {name: "PlanetVR Cardboard", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.109,0.039] },
  POWISCUSTOMPOWISVIEWR : {name: "PowisCustom Powis ViewR", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [0.281,0.494] },
  REFUGIO3DREFUGIO3DLVERSION : {name: "Refugio3D Refugio3D L-Version", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:52, ipdAdjust: 0, k: [0.009,0.009] },
  RITECHRIEMIII : {name: "RITECH Riem III", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0.34,0.239] },
  POPTECH3DVRHEADSET : {name: "Pop-Tech 3D VR Headset", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.36,0.36] },
  STARLIGHTVRMODELSL001 : {name: "Starlight VR Model# SL-001", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.079,0.1] },
  SUNNYPEAKVRG10200 : {name: "SUNNYPEAK VRG-10200", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  SUNNYPEAKVRG10900 : {name: "SUNNYPEAK VRG-10900", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  SUNNYPEAKVRG10200 : {name: "SUNNYPEAK VRG-10200", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  SUNNYPEAKVRG10700 : {name: "SUNNYPEAK VRG-10700", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  TEEFANTFVRA88004 : {name: "TEEFAN TF-VRA88004", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  SUNNYPEAKVRG11600 : {name: "SUNNYPEAK VRG-11600", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  TEEFANTFVRA88002 : {name: "TEEFAN TF-VRA88002", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0,0] },
  TEEFANTFVRA88001 : {name: "TEEFAN TF-VRA88001", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  TEEFANTFVRA88003 : {name: "TEEFAN TF-VRA88003", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:59, ipdAdjust: 0, k: [0,0] },
  TTINTERNATIONAL3DVRVIEWER : {name: "T.T. International 3D VR viewer", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:54, ipdAdjust: 0, k: [0.1,1] },
  NOVOVRCOMNOVOVRCARDBOARDV20 : {name: "novoVR.com novoVR（cardboard）V2.0", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:67, ipdAdjust: 0, k: [0.3,0.3] },
  VIARVIARBOX : {name: "VIAR ViarBox", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:63, ipdAdjust: 0, k: [-0.079,0.079] },
  EVOMADEVIEWBOX : {name: "evomade View Box", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.4,0.15] },
  VRBOXNOBUTTON : {name: " VR Box - no button", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:68, ipdAdjust: 0, k: [0.019,0.019] },
  ADAPTIVEDESIGNSVRKIX : {name: "Adaptive Designs VRKiX", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:50, ipdAdjust: 0, k: [0.009,-0.009] },
  WEARALITYWEARALITYSKY01 : {name: "Wearality Wearality Sky 0.1", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:75, ipd:65, ipdAdjust: 0, k: [0.119,0.15] },
  YAY3DVRVIEWERFORNEXUS7 : {name: "yay3d VR Viewer for Nexus 7", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:55, ipd:70, ipdAdjust: 0, k: [0.449,0] },
  CARLZEISSAGVRONE : {name: "Carl Zeiss AG VR ONE", renderMode: VRRenderModes.STEREOSIDEBYSIDE, icon: VRIcons.logoAnaglyph, hfov:50, ipd:61, ipdAdjust: 0, k: [0.1,1] },
};

var calculateIPDAdjust = function(device, handset, useradj) {
  var lensIPD = device.ipd;
  var screenWidth = handset.width;
  if (lensIPD<0 || screenWidth<0)
    return 0;

  if (useradj<0)
    return (lensIPD*0.5-screenWidth*0.25)/(screenWidth*0.5);
  else
    return (useradj*0.5-screenWidth*0.25)/(screenWidth*0.5);
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
  this.userIPDOffset = 64;
  this.overrideIPD = false;


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
      this.overrideIPD = setCookie.overrideIPD;
    }
  }

  this.firstTime = function() {
    var setCookie = this.getCookie();
    return setCookie==null;
  }

  this.flushToCookie = function() {
    var displayDict = { device: this.currentDeviceName,
                        handset: this.currentHandsetName,
                        userIPDOffset: this.userIPDOffset,
                        overrideIPD: this.overrideIPD };
    this.setCookie(displayDict);
  }

  this.setCookie = function(displayDict) {
    if (!this.useLocalStorage) {
      this.localDict = displayDict;
      return;
    }

    var storage = window.localStorage;
    var key = "vrEmbedDict_" + this.version + "_";
    storage[key+'device'] = displayDict.device;
    storage[key+'handset'] = displayDict.handset;
    storage[key+'userIPDOffset'] = displayDict.userIPDOffset;
    storage[key+'overrideIPD'] = displayDict.overrideIPD;
  }

  this.getCookie = function() {
    if (!this.useLocalStorage) {
      return this.localDict;
    }

    var storage = window.localStorage;
    var key = "vrEmbedDict_" + this.version + "_";

    if (storage[key+'device'] == undefined ||
        storage[key+'handset'] == undefined ||
        storage[key+'userIPDOffset'] == undefined ||
        storage[key+'overrideIPD'] == undefined ){
      return null;
    } else {
      var displayDict = { device: storage[key+'device'],
                          handset: storage[key+'handset'],
                          userIPDOffset: storage[key+'userIPDOffset'],
                          overrideIPD: storage[key+'overrideIPD'] };
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

  this.setOverrideIPD = function(override) {
    this.overrideIPD = override;
    this.flushToCookie();
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
    if (this.overrideIPD==0)
      this.currentDevice.ipdAdjust = calculateIPDAdjust(this.currentDevice, this.currentHandset, -1);
    else
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
