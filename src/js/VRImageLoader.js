var VRSceneDict = require('./VRSceneDict.js');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var flickrImageCache = {};
var imgurImageCache = {};
var imgurAlbumCache = {};

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
  return urlSplit.join("/") + "/" + spl[0] + "m." + spl[1];
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
  var galleryAttribution = dataArray.data.account_url;
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

var imgWidth = 60;

var galleryDictToSceneDicts = function(galleryDict) {
  var sceneList = [];
  for (i=0; l=galleryDict.images.length, i<l; i++){
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
    mainPhoto.plane = true;
    vrSceneDict.dict.photoObjects.push(mainPhoto);

    //title, desc, misc
    // dict.title = data.title;
    // dict.description = data.description;
    // dict.attribution = "";
    // dict.misc = data.views + " views";
    if (img.title!=null) {
      var title = vrSceneDict.initText();
      title.message = img.title;
      title.borderthickness = 1;
      title.textureDescription.sphereFOV = [imgWidth/8,20];
      title.textureDescription.sphereCentre = [imgWidth,0];
      title.plane = true;
      title.planeOffset = [0,45];
      vrSceneDict.dict.textObjects.push(title);
    }

    if (img.description!=null) {
      var description = vrSceneDict.initText();
      description.message = img.description;
      description.borderthickness = 1;
      description.textureDescription.sphereFOV = [imgWidth/2,20];
      description.textureDescription.sphereCentre = [imgWidth,0];
      description.plane = true;
      description.planeOffset = [0,20];
      vrSceneDict.dict.textObjects.push(description);
    }

    if (img.misc!="" || image.attribution!="") {
      var msg = "";
      if (img.misc!="")
        msg+=img.misc;
      if (img.attribution!="")
        msg+= " " + img.attribution;
      var misc = vrSceneDict.initText();
      misc.message = msg;
      misc.borderthickness = 1;
      misc.textureDescription.sphereFOV = [imgWidth/2,20];
      misc.textureDescription.sphereCentre = [imgWidth,0];
      misc.plane = true;
      misc.planeOffset = [0,10];
      vrSceneDict.dict.textObjects.push(misc);
    }

    // prev thumb
    if (i>0) {
      var thumb = vrSceneDict.initDecal();
      var otherImg = galleryDict.images[i-1];
      thumb.jumpTo = "image_" + (i-1);
      //console.log('ADDING PREV: '+i+" "+thumb.jumpTo);
      thumb.imgsrc = otherImg.thumb;
      thumb.textureDescription.sphereFOV = [imgWidth*0.5, 0.5*imgWidth*otherImg.height/otherImg.width];
      thumb.textureDescription.sphereCentre = [imgWidth*-1, 0];
      thumb.textureDescription.plane = true;
      thumb.textureDescription.planeOffset = [0,-20];
      vrSceneDict.dict.decalObjects.push(thumb);
    }
    //next thumb
    if (i<galleryDict.images.length-1) {
      var thumb = vrSceneDict.initDecal();
      var otherImg = galleryDict.images[i+1];
      thumb.jumpTo = "image_" + (i+1);
      //console.log('ADDING NEXT: '+thumb.jumpTo);
      thumb.imgsrc = otherImg.thumb;
      thumb.textureDescription.sphereFOV = [imgWidth*0.5, 0.5*imgWidth*otherImg.height/otherImg.width];
      thumb.textureDescription.sphereCentre = [imgWidth, 0];
      thumb.textureDescription.plane = true;
      thumb.textureDescription.planeOffset = [0,-20];
      vrSceneDict.dict.decalObjects.push(thumb);
    }

    sceneList.push(vrSceneDict);
  }
  return sceneList;
}

VRImageLoader = function() {
  var self = this;
  this.sceneList = [];
  this.storyManager = null;

  this.init = function(vrStoryManager) {
    this.storyManager = vrStoryManager;
  }

  this.getImages = function(url) {
    var imageList = [];
    var imgurTest = parseImgurURL(url);
    if (imgurTest!=null) {
      if (imgurTest[1]=="image"){
        getImgurImage(imgurTest[0], this.buildFromImageList);
      } else if (imgurTest[1]=="album") {
        getImgurAlbum(imgurTest[0],this.buildFromImageList);
      }
    }
  }

  this.buildFromImageList = function(galleryDict) {
    // construct a vrEmbed scene dict
    var sceneList = galleryDictToSceneDicts(galleryDict);
    console.log(sceneList);
    self.pushFromDictToRender(sceneList);
    // console.log(galleryDict);
  }

  this.getStory = function() {
    if (self.storyManager.storyList != [])
      return self.storyManager.storyList[0];
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
