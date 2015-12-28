var THREE = require('../js-ext/three.js');

VRScenePhoto = function() {
  this.scenePhoto = null;
  this.textureDescription = null;
  this.isStereo = false;

  this.toVec2 = function(str) {
    var arr = str.split(",");
    return new THREE.Vector2(arr[0].trim(), arr[1].trim());
  };

  this.parseSphereParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.sphereFOV = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.sphereCentre = new THREE.Vector2(arr[2].trim(), arr[3].trim());
  };

  this.parseTexParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.U_l = new THREE.Vector2(arr[0].trim(), arr[1].trim());
    this.textureDescription.V_l = new THREE.Vector2(arr[2].trim(), arr[3].trim());
    this.textureDescription.U_r = new THREE.Vector2(arr[4].trim(), arr[5].trim());
    this.textureDescription.V_r = new THREE.Vector2(arr[6].trim(), arr[7].trim());
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
