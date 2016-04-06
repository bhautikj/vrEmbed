var VRSceneDict = require('./VRSceneDict.js');
var VRURLParser = require('./VRURLParser.js');
var VRLoaderIcons = require('./VRLoaderIcons.js');
var VRIcons = require('./VRIcons.js');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")}

var minWidthString = function(st, w) {
  var diff = w-st.length;
  var rs = (' ' + st).slice(1);

  if (diff>0) {
    rs = rs.padRight(diff, " ");
  }

  return rs;
}

var flickrImageCache = {};
var imgurImageCache = {};
var imgurAlbumCache = {};
var imgurGalleryCache = {};

//TODO: chack out https://github.com/mauricesvay/ImageResolver
var parseImgurURL = function(imgurURL) {
  var part = null;
  var spl = imgurURL.split('/');
  for (i=0; l=spl.length,i<l; i++) {
    if (spl[i].endsWith("imgur.com")){
      if (i<l-1) {
        part = spl[i+1];
        if (part=="") {
          return null;
        }
        if (part=="a") {
          if (i<l-2) {
            part=spl[i+2]
            return [part,'album'];
          } else {
            return null;
          }
        } else if (part == "gallery") {
          if (i<l-2) {
            part=spl[i+2]
            return [part,'gallery'];
          } else {
            return null;
          }
        } else {
          partspl = part.split('.');

          if (partspl[0]=="")
            return null;

          return [partspl[0],'image'];
        }
      }
    }
  }
}

var doImgurCall = function(dataPart, apiBase, postFunc, callbackFunc) {
  var imgurAPI = "";
  imgurAPI += apiBase;
  imgurAPI += dataPart;
  imgurAPI += "?client_id=fe596e6329962dd";

  var xhr= new XMLHttpRequest();
  xhr.open("GET",imgurAPI,true);
  xhr.setRequestHeader("Authorization", "Client-ID fe596e6329962dd");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4 && xhr.status==200) {
      var dataArray = JSON.parse(xhr.responseText);
      postFunc(dataPart, dataArray, callbackFunc);
    }
  };
}

var generateImgurThumb = function(imgurl) {
  var urlSplit = imgurl.split('/');
  var filename = urlSplit.pop();
  var spl = filename.split('.');
  return urlSplit.join("/") + "/" + spl[0] + "b." + spl[1];
}

var parseImgurImageDict = function(data) {
  var dict = {};
  //failout points
  if (data.animated == true)
    return null;

  if (data.height > 4096 || data.width > 4096)
    return null;

  dict.src = data.link;
  dict.thumb = generateImgurThumb(dict.src);
  dict.title = data.title;
  dict.description = data.description;
  dict.width = data.width;
  dict.height = data.height;
  dict.attribution = "";
  dict.misc = data.views + " views";
  return dict;
}

var gotImgurImage = function(imagePart, dataArray, callbackFunc) {
  imgurImageCache[imagePart] = dataArray;
  var imgURL = dataArray.data.link;
  var img = parseImgurImageDict(dataArray.data);
  var dt = {};
  dt.images = [img];
  dt.galleryTitle = null;
  dt.galleryDescription = null;
  dt.galleryAttribution = null;
  dt.galleryMisc = null;

  if (callbackFunc!=null && dt!=null){
    callbackFunc(dt);
  }
}

var getImgurImage = function(imagePart, callbackFunc) {
  if (imagePart in imgurImageCache) {
    if (callbackFunc!=null)
      gotImgurImage(imgurImageCache[imagePart]);
    return;
  }
  doImgurCall(imagePart, "https://api.imgur.com/3/image/", gotImgurImage, callbackFunc);
};

var gotImgurAlbum = function(albumPart, dataArray, callbackFunc) {
  imgurAlbumCache[albumPart] = dataArray;
  var images = dataArray.data.images;
  var galleryTitle = dataArray.data.title;
  var galleryDescription = dataArray.data.description;
  var galleryAttribution = dataArray.data.account_id;
  var galleryMisc = dataArray.data.views + " views";

  var dt = {};
  dt.galleryTitle = galleryTitle;
  dt.galleryDescription = galleryDescription;
  dt.galleryAttribution = galleryAttribution;
  dt.galleryMisc = galleryMisc;

  dt.images = [];
  for (i=0; l=images.length, i<l; i++) {
    var img = images[i];
    var id = parseImgurImageDict(img);
    if (id!=null) {
      dt.images.push(id);
    }
  }
  if (callbackFunc!=null && dt!=[]) {
    callbackFunc(dt);
  }
}

var getImgurAlbum = function(albumPart, callbackFunc) {
  if (albumPart in imgurAlbumCache) {
    if (callbackFunc!=null)
      gotImgurAlbum(imgurAlbumCache[albumPart]);
    return;
  }

  doImgurCall(albumPart, "https://api.imgur.com/3/album/", gotImgurAlbum, callbackFunc);
}

var gotImgurGallery = function(galleryPart, dataArray, callbackFunc) {
  imgurGalleryCache[galleryPart] = dataArray;
  var images = dataArray.data.images;
  var galleryTitle = dataArray.data.title;
  var galleryDescription = dataArray.data.description;
  var galleryAttribution = dataArray.data.account_id;
  var galleryMisc = dataArray.data.views + " views";

  var dt = {};
  dt.galleryTitle = galleryTitle;
  dt.galleryDescription = galleryDescription;
  dt.galleryAttribution = galleryAttribution;
  dt.galleryMisc = galleryMisc;

  dt.images = [];
  for (i=0; l=images.length, i<l; i++) {
    var img = images[i];
    var id = parseImgurImageDict(img);
    if (id!=null) {
      dt.images.push(id);
    }
  }
  if (callbackFunc!=null && dt!=[]) {
    callbackFunc(dt);
  }
}

var getImgurGallery = function(galleryPart, callbackFunc) {
  if (galleryPart in imgurGalleryCache) {
    if (callbackFunc!=null)
      gotImgurGallery(imgurGalleryCache[galleryPart]);
    return;
  }

  doImgurCall(galleryPart, "https://api.imgur.com/3/gallery/album/", gotImgurGallery, callbackFunc);
}

var getFlickrPhotoID = function(flickrURL) {
  var photo_id=null;

  var spl = flickrURL.split('/');
  for (i=0;i<spl.length;i++) {
    if (spl[i]=="photos") {
      if ((i+2)<spl.length) {
        photo_id = spl[i+2];
        break;
      }
    }
  }
  return photo_id;
}

var getFlickrImage = function(photo_id, callbackFunc) {
  if (photo_id==null) {
    return false;
  }

  if (photo_id in flickrImageCache) {
    callbackFunc(flickrImageCache[photo_id]);
    return;
  }

  var flickrAPI = "";
  flickrAPI += "https://api.flickr.com/services/rest/?";
  flickrAPI += "&method=flickr.photos.getSizes";
  flickrAPI += "&api_key=c074e17f92ea52a8d9422928352b0053";
  flickrAPI += "&photo_id=" + photo_id;
  flickrAPI += "&format=json";
  flickrAPI += "&nojsoncallback=1";

  var xhr= new XMLHttpRequest();
  xhr.open("GET",flickrAPI,true);   //
  xhr.send();
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4 && xhr.status==200) {
      var myArray = JSON.parse(xhr.responseText);
      var sizes = myArray.sizes.size;
      var useMe = 0;
      var maxWidth = 0;
      for (i=0; i<sizes.length; i++) {
        var width = parseInt(sizes[i].width);
        if(width <= 2048 && width>maxWidth){
          maxWidth = width;
          useMe = i;
        }
      }
      flickrImageCache[photo_id] = sizes[useMe].source;
      callbackFunc(flickrImageCache[photo_id]);
    }
  };
}

var imgWidth = 70;

var galleryDictToSceneDicts = function(galleryDict) {
  var sceneList = [];
  var numPerIndex = 16;
  for (i=0; l=galleryDict.images.length, i<l; i++){
    var indexPage = Math.floor((i/numPerIndex));
    var vrSceneDict = new VRSceneDict();
    vrSceneDict.init();
    vrSceneDict.dict.name = "image_" + i;
    var img = galleryDict.images[i];
    var mainPhoto = vrSceneDict.initPhoto();
    // dict.src = data.link;
    // dict.width = data.width;
    // dict.height = data.height;
    mainPhoto.textureDescription.src = img.src;
    mainPhoto.textureDescription.sphereFOV = [imgWidth, imgWidth*img.height/img.width];
    mainPhoto.textureDescription.plane = true;
    vrSceneDict.dict.photoObjects.push(mainPhoto);

    var desc ="";
    var padSize = 45;
    if (img.title!=null) {
      desc += 'Title: ' + img.title  + ' \n';
    }
    if (img.description!=null) {
      desc += 'Description: ' + img.description + ' \n';
    }
    var msg = "";
    if (img.misc!="")
      msg+=img.misc;
    if (img.attribution!="")
      msg+= " " + img.attribution;

    desc += minWidthString(msg, padSize) + ' \n';
    var thumbFac = 0.20;

    if (desc != "") {
      var title = vrSceneDict.initText();
      title.message = desc;
      title.textOptions.borderthickness = 0;
      title.textOptions.align = 'left';
      title.textOptions.fontface = 'Courier';
      title.textOptions.fontsize = 36;
      title.textureDescription.sphereFOV = [imgWidth/1.5,20];
      title.textureDescription.sphereCentre = [imgWidth,0];
      title.textureDescription.plane = true;
      title.textureDescription.planeOffset = [0,0];
      vrSceneDict.dict.textObjects.push(title);
    }

    var vrEmbedLogo = vrSceneDict.initDecal();
    vrEmbedLogo.imgsrc = VRIcons.logoVrEmbed;
    vrEmbedLogo.textureDescription.sphereFOV = [2*imgWidth*thumbFac, 2*imgWidth*thumbFac];
    vrEmbedLogo.textureDescription.sphereCentre = [0, -90];
    vrEmbedLogo.textureDescription.plane = false;
    vrEmbedLogo.textureDescription.planeOffset = [0,0];
    vrSceneDict.dict.decalObjects.push(vrEmbedLogo);

    var lowerbarOffset = -(0.5+thumbFac)*(imgWidth*img.height/img.width);
    // prev thumb
    if (i>0) {
      var thumb = vrSceneDict.initDecal();
      var otherImg = galleryDict.images[i-1];
      thumb.jumpTo = "image_" + (i-1);
      //console.log('ADDING PREV: '+i+" "+thumb.jumpTo);
      thumb.imgsrc = otherImg.thumb;
      thumb.textureDescription.sphereFOV = [imgWidth*thumbFac, thumbFac*imgWidth*otherImg.height/otherImg.width];
      thumb.textureDescription.sphereCentre = [0,0];
      thumb.textureDescription.plane = true;
      thumb.textureDescription.planeOffset = [-(0.5-0.5*thumbFac)*imgWidth, lowerbarOffset];;
      vrSceneDict.dict.decalObjects.push(thumb);
    }
    //next thumb
    if (i<galleryDict.images.length-1) {
      var thumb = vrSceneDict.initDecal();
      var otherImg = galleryDict.images[i+1];
      thumb.jumpTo = "image_" + (i+1);
      //console.log('ADDING NEXT: '+thumb.jumpTo);
      thumb.imgsrc = otherImg.thumb;
      thumb.textureDescription.sphereFOV = [imgWidth*thumbFac, thumbFac*imgWidth*otherImg.height/otherImg.width];
      //thumb.textureDescription.sphereCentre = [imgWidth, 0];
      thumb.textureDescription.sphereCentre = [0, 0];
      thumb.textureDescription.plane = true;
      thumb.textureDescription.planeOffset = [(0.5-0.5*thumbFac)*imgWidth, lowerbarOffset];;
      vrSceneDict.dict.decalObjects.push(thumb);
    }

    var galleryIdx = vrSceneDict.initDecal();
    galleryIdx.jumpTo = "index_" + indexPage;
    //console.log('ADDING NEXT: '+thumb.jumpTo);
    galleryIdx.imgsrc = VRLoaderIcons.gallery;
    galleryIdx.textureDescription.sphereFOV = [imgWidth*thumbFac, imgWidth*thumbFac];
    galleryIdx.textureDescription.sphereCentre = [0, 0];
    galleryIdx.textureDescription.plane = true;
    // galleryIdx.textureDescription.planeOffset = [0,-0.5*imgWidth*img.height/img.width + -0.75*imgWidth*thumbFac];
    galleryIdx.textureDescription.planeOffset = [0,lowerbarOffset];
    vrSceneDict.dict.decalObjects.push(galleryIdx);

    sceneList.push(vrSceneDict);
  }

  // now build index scenes. going to go with a square grid of 16 per page
  // 90/4=15deg for each thumb
  var numImages = galleryDict.images.length;
  var i,j,temparray,chunk = numPerIndex;
  var numIndexes = Math.ceil(numImages/numPerIndex);
  var indexScnIdx = 0;
  var imgIdx = 0;

  for (i=0,j=numImages; i<j; i+=chunk) {
    temparray = galleryDict.images.slice(i,i+chunk);
    var tmpIdx = 0;
    // console.log(i, i+chunk, numImages);
    var vrSceneDict = new VRSceneDict();
    vrSceneDict.init();
    vrSceneDict.dict.name = "index_" + indexScnIdx;
    var vLoc = 30;
    for (v=0; v<4; v++) {
      var uLoc = -30;
      for (u=0; u<4; u++) {
        if (imgIdx>=numImages)
          break;
        var thumb = vrSceneDict.initDecal();
        var otherImg = temparray[tmpIdx];
        thumb.jumpTo = "image_" + (imgIdx);
        thumb.imgsrc = otherImg.thumb;
        thumb.textureDescription.sphereFOV = [18, 18];
        thumb.textureDescription.sphereCentre = [0, 0];
        thumb.textureDescription.plane = true;
        thumb.textureDescription.planeOffset = [uLoc,vLoc];
        vrSceneDict.dict.decalObjects.push(thumb);
        tmpIdx += 1;
        imgIdx += 1;
        uLoc += 20;
      }
      vLoc += -20;
    }

    // prev
    if (indexScnIdx>0) {
      var prevDecal = vrSceneDict.initDecal();
      prevDecal.jumpTo = "index_" + (indexScnIdx-1);
      prevDecal.imgsrc = VRLoaderIcons.prevArrow;
      prevDecal.textureDescription.sphereFOV = [15,15];
      prevDecal.textureDescription.sphereCentre = [0, 0];
      prevDecal.textureDescription.plane = true;
      prevDecal.textureDescription.planeOffset = [-20,-60];
      vrSceneDict.dict.decalObjects.push(prevDecal);
    }

    // next
    if (indexScnIdx<numIndexes-1) {
      var nextDecal = vrSceneDict.initDecal();
      nextDecal.jumpTo = "index_" + (indexScnIdx+1);
      nextDecal.imgsrc = VRLoaderIcons.nextArrow;
      nextDecal.textureDescription.sphereFOV = [15,15];
      nextDecal.textureDescription.sphereCentre = [0, 0];
      nextDecal.textureDescription.plane = true;
      nextDecal.textureDescription.planeOffset = [20,-60];
      vrSceneDict.dict.decalObjects.push(nextDecal);
    }

    var vrEmbedLogo = vrSceneDict.initDecal();
    vrEmbedLogo.imgsrc = VRIcons.logoVrEmbed;
    vrEmbedLogo.textureDescription.sphereFOV = [2*imgWidth*thumbFac, 2*imgWidth*thumbFac];
    vrEmbedLogo.textureDescription.sphereCentre = [0, -90];
    vrEmbedLogo.textureDescription.plane = false;
    vrEmbedLogo.textureDescription.planeOffset = [0,0];
    vrSceneDict.dict.decalObjects.push(vrEmbedLogo);

    sceneList.push(vrSceneDict);

    indexScnIdx += 1;
  }

  return sceneList;
}

VRImageLoader = function() {
  var self = this;
  this.sceneList = [];
  this.storyManager = null;
  this.vrURLParser = new VRURLParser();
  this.vrURLParser.init();

  this.init = function(vrStoryManager) {
    this.storyManager = vrStoryManager;
  }

  this.hasURLParams = function(){
    return this.vrURLParser.isEditor;
  }

  this.getURLParameters = function() {
    return this.vrURLParser.params;
  }

  this.isGalleryURL = function() {
    return "gallery" in this.getURLParameters();
  }

  this.isImageURL = function(){
    return "src" in this.getURLParameters();
  }


  this.getImages = function(url) {
    self.getStory().setGallerySrc(url);
    var imageList = [];
    var imgurTest = parseImgurURL(url);
    if (imgurTest!=null) {
      if (imgurTest[1]=="image"){
        getImgurImage(imgurTest[0], this.buildFromImageList);
      } else if (imgurTest[1]=="album") {
        getImgurAlbum(imgurTest[0],this.buildFromImageList);
      } else if (imgurTest[1]=="gallery") {
        getImgurGallery(imgurTest[0],this.buildFromImageList);
      }
    }
  }

  this.parseBoolString = function(str) {
    if (str==undefined)
      return false;
    if (str.toLowerCase()=="true")
      return true;
    else
      return false;
  }

  this.parsePlaneOffsetParamsFromString  = function(str) {
    if (str == undefined)
      return;
    var arr = str.split(",");
    return [parseFloat(arr[0].trim()), parseFloat(arr[1].trim())];
  };

  this.getSphereParamsFromString  = function(str) {
    var arr = str.split(",");
    return [[parseFloat(arr[0].trim()), parseFloat(arr[1].trim())],
           [parseFloat(arr[2].trim()), parseFloat(arr[3].trim())]];
  };

  this.getTexParamsFromString = function(str) {
    var arr = str.split(",");
    return [[parseFloat(arr[0].trim()), parseFloat(arr[1].trim())],
            [parseFloat(arr[2].trim()), parseFloat(arr[3].trim())],
            [parseFloat(arr[4].trim()), parseFloat(arr[5].trim())],
            [parseFloat(arr[6].trim()), parseFloat(arr[7].trim())]];
  };

  this.buildFromImageURLParams = function(urlDict) {
    var img = new Image();
    img.onload = this.buildSingle;
    img.src = urlDict.src;
  }

  this.buildSingle = function() {
    var urlDict = self.getURLParameters();
    var vrSceneDict = new VRSceneDict();
    vrSceneDict.init();


    var photo = vrSceneDict.initPhoto();
    photo.name = "unit";
    photo.textureDescription.src = urlDict.src;

    if (urlDict["metaSrc"] != undefined)
      photo.textureDescription.metaSource = urlDict["metaSrc"];
    else
      photo.textureDescription.metaSource = "";

    photo.textureDescription.isStereo = self.parseBoolString(urlDict["isStereo"]);
    photo.textureDescription.plane = self.parseBoolString(urlDict["plane"]);
    photo.textureDescription.planeOffset = self.parsePlaneOffsetParamsFromString(urlDict["planeOffset"]);

    if (urlDict["sphereParams"] != undefined) {
      var sparams = self.getSphereParamsFromString(urlDict["sphereParams"]);
      photo.textureDescription.sphereFOV = sparams[0];
      photo.textureDescription.sphereCentre = sparams[1];
    }


    if (urlDict["texParams"] != undefined) {
      var tparams = self.getTexParamsFromString(urlDict["texParams"]);
      photo.textureDescription.U_l = tparams[0];
      photo.textureDescription.V_l = tparams[1];
      photo.textureDescription.U_r = tparams[2];
      photo.textureDescription.V_r = tparams[3];
    }

    vrSceneDict.dict.photoObjects.push(photo);

    var sceneList = [];
    sceneList.push(vrSceneDict);
    console.log(sceneList);
    self.pushFromDictToRender(sceneList);
  }

  this.buildFromImageList = function(galleryDict) {
    // construct a vrEmbed scene dict
    var sceneList = galleryDictToSceneDicts(galleryDict);
    self.pushFromDictToRender(sceneList);
  }

  this.getStory = function() {
    if (self.storyManager.storyList != []){
      return self.storyManager.storyList[0];
    }
    else
      return null;
  }

  this.pushFromDictToRender = function(sceneList) {
    if (self.getStory()==null)
      return;
    self.getStory().sceneList = [];
    self.getStory().namedSceneMap = {};

    for (i = 0; i < sceneList.length; i++) {
      var scene = sceneList[i];
      scene.vrScene.initDict(sceneList[i].dict);
      self.getStory().sceneList.push(scene.vrScene);
      self.getStory().namedSceneMap[scene.vrScene.name] = i;
      // self.getStory().sceneList[i].initDict(sceneList[i].dict);
    }

    self.getStory().setupScene(0);
  }
}

var VRImageLoaderFactory = (function () {
  var instance;

  function createInstance() {
      var vrImageLoader = new VRImageLoader();
      return vrImageLoader;
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


module.exports = VRImageLoaderFactory.getInstance();
