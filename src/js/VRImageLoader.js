var VRSceneDict = require('./VRSceneDict.js');
var VRURLParser = require('./VRURLParser.js');
var VRMacroStrings = require('./VRMacroStrings.js');

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function strip(inputText) {
    var returnText = "" + inputText;

    //-- remove BR tags and replace them with line break
    returnText=returnText.replace(/<br>/gi, "\n");
    returnText=returnText.replace(/<br\s\/>/gi, "\n");
    returnText=returnText.replace(/<br\/>/gi, "\n");

    //-- remove P and A tags but preserve what's inside of them
    returnText=returnText.replace(/<p.*>/gi, "\n");
    returnText=returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

    //-- remove all inside SCRIPT and STYLE tags
    returnText=returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    returnText=returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
    //-- remove all else
    returnText=returnText.replace(/<(?:.|\s)*?>/g, "");

    //-- get rid of more than 2 multiple line breaks:
    returnText=returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

    //-- get rid of more than 2 spaces:
    returnText = returnText.replace(/ +(?= )/g,'');

    //-- get rid of html-encoded characters:
    returnText=returnText.replace(/&nbsp;/gi," ");
    returnText=returnText.replace(/&amp;/gi,"&");
    returnText=returnText.replace(/&quot;/gi,'"');
    returnText=returnText.replace(/&lt;/gi,'<');
    returnText=returnText.replace(/&gt;/gi,'>');

    //-- return
    return returnText;
}

// function strip(html) {
//    var tmp = document.createElement("DIV");
//    tmp.innerHTML = html;
//    return tmp.textContent || tmp.innerText || "";
// }

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")}
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

var minWidthString = function(st, w) {
  var diff = w-st.length;
  var rs = (' ' + st).slice(1);

  if (diff>0) {
    rs = rs.padRight(diff, " ");
  }

  return rs;
}

var flickrImageURLCache = {};
var flickrImageInfoCache = {};
var flickrAlbumCache = {};
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

var getMacroMode = function(txt) {
  if (txt==null)
    return null;

  for (var key in VRMacroStrings) {
    if (txt.contains(key))
      return key;
  }

  return null;
}

var getTexParams = function(txt) {
  if (txt==null)
    return null;

  var texParamString = "vrEmbed:texParams=";
  var idx = txt.indexOf(texParamString);
  if(idx<0)
    return null;

  var pos = idx + texParamString.length;
  var txtTrimmed = txt.slice(pos+1);
  var endpos = txtTrimmed.indexOf('"');
  var txtTrimmedFinal = txtTrimmed.slice(0, endpos);
  return txtTrimmedFinal;
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
  dict.macro = getMacroMode(data.description);
  dict.texParams = getTexParams(data.description);

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
    var sceneList = galleryDictToSceneDicts(dt);
    callbackFunc(sceneList);
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
    var sceneList = galleryDictToSceneDicts(dt);
    callbackFunc(sceneList);
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
    var sceneList = galleryDictToSceneDicts(dt);
    callbackFunc(sceneList);
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

var doFlickrCall = function(dataPart, apiArgs, postFunc, callbackFunc) {
  var flickrAPI = "";
  flickrAPI += "https://api.flickr.com/services/rest/?";
  flickrAPI += "&api_key=c074e17f92ea52a8d9422928352b0053";
  flickrAPI += "&format=json";
  flickrAPI += "&nojsoncallback=1";
  flickrAPI += apiArgs;

  var xhr= new XMLHttpRequest();
  xhr.open("GET",flickrAPI,true);   //
  xhr.send();
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4 && xhr.status==200) {
      var data = JSON.parse(xhr.responseText);
      postFunc(dataPart, data, callbackFunc);
    }
  };
}

var getFlickrAlbumID = function(flickrURL) {
  var spl = flickrURL.split("/");
  var l = spl.length;
  for (i=0; i<l; i++) {
    if (!spl[0].contains("flickr.com")){
      spl.shift();
    } else {
      break;
    }
  }

  if (spl == [] || (spl[3]!="sets" && spl[3]!="albums"))
    return null;

  return spl[4];
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

var gotFlickrImageURL = function(photo_id, data, callbackFunc) {
  var sizes = data.sizes.size;
  var useMe = 0;
  var maxWidth = 0;
  var thumbUrl = "";
  for (i=0; i<sizes.length; i++) {
    var width = parseInt(sizes[i].width);
    if(width <= 2048 && width>maxWidth){
      maxWidth = width;
      useMe = i;
    }
    if (sizes[i].source.endsWith("_m.jpg")) {
      thumbUrl = sizes[i].source;
    }
  }

  if (thumbUrl=="")
    thumbUrl = sizes[useMe].source;

  var dt = {};
  dt.photo_id = photo_id;
  dt.thumb = thumbUrl;
  dt.img = sizes[useMe].source;
  dt.width = parseInt(sizes[useMe].width);
  dt.height = parseInt(sizes[useMe].height);

  flickrImageURLCache[photo_id] = dt;
  callbackFunc(flickrImageURLCache[photo_id]);
}

var getFlickrImageURL = function(photo_id, callbackFunc) {
  if (photo_id==null)
    return false;

  if (photo_id in flickrImageURLCache) {
    callbackFunc(flickrImageURLCache[photo_id]);
    return;
  }

  doFlickrCall(photo_id, "&method=flickr.photos.getSizes"+"&photo_id=" + photo_id, gotFlickrImageURL, callbackFunc);
}


var gotFlickrImageInfo = function(photo_id, data, callbackFunc) {
  var title = data.photo.title._content;
  var description = data.photo.description._content;
  var tags = data.photo.tags.tag;
  var macro = null;
  var texParams = null;
  for (i=0; i<tags.length;i++) {
    var macroTest = getMacroMode(tags[i].raw);
    if (macroTest!=null)
      macro = macroTest;

    var texParamsTest = getTexParams(tags[i].raw);
    if (texParamsTest!=null)
      texParams = texParamsTest;
  }

  var dt = {};
  dt.photo_id = photo_id;
  dt.title = title;
  dt.description = strip(description);
  dt.macro = macro;
  dt.texParams = texParams;


  flickrImageInfoCache[photo_id] = dt;
  callbackFunc(flickrImageInfoCache[photo_id]);
}

var getFlickrImageInfo = function(photo_id, callbackFunc) {
  if (photo_id==null)
    return false;

  if (photo_id in flickrImageInfoCache) {
    callbackFunc(flickrImageInfoCache[photo_id]);
    return;
  }

  doFlickrCall(photo_id, "&method=flickr.photos.getInfo"+"&photo_id=" + photo_id, gotFlickrImageInfo, callbackFunc);
}

var gotFlickrAlbum = function(album_id, dataArray, callbackFunc) {
  var images = dataArray.photoset.photo;

  var dt = {};
  dt.galleryTitle = "";
  if (dataArray.photoset.title!=undefined)
    dt.galleryTitle = dataArray.photoset.title;
  dt.galleryDescription = "";
  if (dataArray.photoset.ownername!=undefined)
    dt.galleryAttribution = dataArray.photoset.ownername;
  dt.galleryMisc = "";

  var imageIds = [];
  for (i=0; l=images.length,i<l;i++) {
    imageIds.push(images[i].id);
  }

  flickrAlbumCache[album_id] = [dt, imageIds];
  callbackFunc([dt, imageIds]);
}

var getFlickrAlbum = function(album_id, callbackFunc) {
  if (album_id == null)
    return false;

  if (album_id in flickrAlbumCache) {
    callbackFunc(flickrAlbumCache[album_id]);
    return;
  }

  doFlickrCall(album_id, "&method=flickr.photosets.getPhotos"+"&photoset_id=" + album_id, gotFlickrAlbum, callbackFunc);
}

var flickrAlbumStruct = {};
var flickrAlbumCallbackFunc = null;

var parseFlickrImageDict = function(photo_id, urls, infos) {
  var dict = {};
  var url = null;
  var info = null;
  for (i=0; i<urls.length; i++) {
    if (urls[i].photo_id == photo_id)
      url = urls[i];
  }
  for (i=0; i<infos.length; i++) {
    if (infos[i].photo_id == photo_id)
      info = infos[i];
  }

  if (url==null || info== null)
    return null;

  dict.src = url.img;
  dict.thumb = url.thumb;
  dict.title = info.title;
  dict.description = info.description;
  dict.width = url.width;
  dict.height = url.height;
  dict.attribution = "";
  dict.misc = "";
  dict.macro = info.macro;
  return dict;
}

var buildFlickrAlbumGalleryDict = function() {
  var dt = flickrAlbumStruct.dt;

  var numPhotos = flickrAlbumStruct.photoIds.length;
  dt.images = [];

  for (z=0; z<numPhotos; z++) {
    var photo_id = flickrAlbumStruct.photoIds[z];
    var id = parseFlickrImageDict(photo_id, flickrAlbumStruct.imageURLs, flickrAlbumStruct.imageInfos);
    if (id!=null) {
      dt.images.push(id);
    }
  }

  var sceneList = galleryDictToSceneDicts(dt);

  if (flickrAlbumCallbackFunc!=null) {
    flickrAlbumCallbackFunc(sceneList);
  }
}

var flickrAlbumGotImageURL = function(url){
  flickrAlbumStruct.imageURLs.push(url);
  if (flickrAlbumStruct.imageURLs.length == flickrAlbumStruct.targetSize &&
      flickrAlbumStruct.imageInfos.length == flickrAlbumStruct.targetSize){
    buildFlickrAlbumGalleryDict();
  }
}

var flickrAlbumGotImageInfo = function(info){
  flickrAlbumStruct.imageInfos.push(info);
  if (flickrAlbumStruct.imageURLs.length == flickrAlbumStruct.targetSize &&
      flickrAlbumStruct.imageInfos.length == flickrAlbumStruct.targetSize){
    buildFlickrAlbumGalleryDict();
  }
}

var buildFlickrAlbum = function(data) {
  var dt = data[0];
  var imageIds = data[1];
  flickrAlbumStruct = {};
  flickrAlbumStruct.targetSize = imageIds.length;
  flickrAlbumStruct.dt = dt;
  flickrAlbumStruct.photoIds = imageIds;
  flickrAlbumStruct.imageURLs = [];
  flickrAlbumStruct.imageInfos = [];
  for (i=0; i<imageIds.length; i++) {
    getFlickrImageURL(imageIds[i], flickrAlbumGotImageURL);
    getFlickrImageInfo(imageIds[i], flickrAlbumGotImageInfo);
  }
}

// getFlickrAlbum(getFlickrAlbumID("https://www.flickr.com/photos/captin_nod/albums/72157659678214895"), buildFlickrAlbum);
//
// getFlickrAlbumID("https://www.flickr.com/photos/captin_nod/albums/72157659678214895");
// getFlickrAlbumID("flickr.com/photos/captin_nod/sets/72157659678214895");
// getFlickrAlbumID("flickr.com/photos/captin_nod/fools/72157659678214895");
//
// getFlickrAlbumID("meh.com/photos/captin_nod/albums/72157659678214895");


var imgWidth = 70;

var adjustFromMacro = function(photo, img, macro) {
  if (macro == null)
    return [photo,img];

  if (macro == "vrEmbed:macro=360") {
    photo.textureDescription.sphereFOV=[360,180];
    photo.textureDescription.plane=false;
  } else if (macro == "vrEmbed:macro=3dparallel") {
    img.width = 0.5*img.width;
    photo.textureDescription.sphereFOV = [imgWidth, imgWidth*img.height/img.width];
    photo.textureDescription.isStereo = true;
    photo.textureDescription.U_l = [0,0];
    photo.textureDescription.V_l = [0.5,1];
    photo.textureDescription.U_r = [0.5,0];
    photo.textureDescription.V_r = [1,1];
  } else if (macro == "vrEmbed:macro=3dcrosseye") {
    img.width = 0.5*img.width;
    photo.textureDescription.sphereFOV = [imgWidth, imgWidth*img.height/img.width];
    photo.textureDescription.isStereo = true;
    photo.textureDescription.U_l = [0.5,0];
    photo.textureDescription.V_l = [1,1];
    photo.textureDescription.U_r = [0,0];
    photo.textureDescription.V_r = [0.5,1];
  } else if (macro == "vrEmbed:macro=3d360") {
    photo.textureDescription.sphereFOV=[360,180];
    photo.textureDescription.plane=false;
    photo.textureDescription.isStereo = true;
    photo.textureDescription.U_l = [0,0];
    photo.textureDescription.V_l = [1,0.5];
    photo.textureDescription.U_r = [0,0.5];
    photo.textureDescription.V_r = [1,1];
  }
  return [photo,img];
}

var getTexParamsFromString = function(str) {
  var arr = str.split(",");
  //console.log(arr);
  return [[parseFloat(arr[0].trim()), parseFloat(arr[1].trim())],
          [parseFloat(arr[2].trim()), parseFloat(arr[3].trim())],
          [parseFloat(arr[4].trim()), parseFloat(arr[5].trim())],
          [parseFloat(arr[6].trim()), parseFloat(arr[7].trim())]];
};

var galleryDictToSceneDicts = function(galleryDict) {
  var sceneList = [];
  var numPerIndex = 9;
  for (i=0; l=galleryDict.images.length, i<l; i++){
    var indexPage = Math.floor((i/numPerIndex));
    var vrSceneDict = new VRSceneDict();
    vrSceneDict.init();
    vrSceneDict.dict.name = "image_" + i;
    var _img = galleryDict.images[i];
    var _mainPhoto = vrSceneDict.initPhoto();
    // dict.src = data.link;
    // dict.width = data.width;
    // dict.height = data.height;
    _mainPhoto.textureDescription.src = _img.src;
    _mainPhoto.textureDescription.sphereFOV = [imgWidth, imgWidth*_img.height/_img.width];
    _mainPhoto.textureDescription.plane = true;

    var macroExec = adjustFromMacro(_mainPhoto, _img, _img.macro);
    var mainPhoto = macroExec[0];
    var img = macroExec[1];

    if (_img.texParams != null) {
      var tparams = getTexParamsFromString(_img.texParams);
      mainPhoto.textureDescription.U_l = tparams[0];
      mainPhoto.textureDescription.V_l = tparams[1];
      mainPhoto.textureDescription.U_r = tparams[2];
      mainPhoto.textureDescription.V_r = tparams[3];
    }

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
      title.textOptions.fontface = 'Times';
      title.textOptions.fontsize = 36;
      title.textureDescription.sphereFOV = [imgWidth/1.5,20];
      title.textureDescription.sphereCentre = [imgWidth,0];
      title.textureDescription.plane = true;
      title.textureDescription.planeOffset = [0,0];
      vrSceneDict.dict.textObjects.push(title);
    }

    var vrEmbedLogo = vrSceneDict.initDecal();
    vrEmbedLogo.imgsrc = "http://vrembed.org/src/assets/vrEmbedLogo.png";
    vrEmbedLogo.textureDescription.sphereFOV = [imgWidth*thumbFac, imgWidth*thumbFac];
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
    galleryIdx.imgsrc = "http://vrembed.org/src/assets/gallery.png";
    galleryIdx.textureDescription.sphereFOV = [imgWidth*thumbFac, imgWidth*thumbFac];
    galleryIdx.textureDescription.sphereCentre = [0, 0];
    galleryIdx.textureDescription.plane = true;
    // galleryIdx.textureDescription.planeOffset = [0,-0.5*imgWidth*img.height/img.width + -0.75*imgWidth*thumbFac];
    galleryIdx.textureDescription.planeOffset = [0,lowerbarOffset];
    vrSceneDict.dict.decalObjects.push(galleryIdx);

    sceneList.push(vrSceneDict);
  }

  // now build index scenes. going to go with a square grid of 9 per page
  // 90/3=30deg for each thumb
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
    for (v=0; v<3; v++) {
      var uLoc = -30;
      for (u=0; u<3; u++) {
        if (imgIdx>=numImages)
          break;
        var thumb = vrSceneDict.initDecal();
        var otherImg = temparray[tmpIdx];
        thumb.jumpTo = "image_" + (imgIdx);
        thumb.imgsrc = otherImg.thumb;
        thumb.textureDescription.sphereFOV = [25, 25];
        thumb.textureDescription.sphereCentre = [0, 0];
        thumb.textureDescription.plane = true;
        thumb.textureDescription.planeOffset = [uLoc,vLoc];
        vrSceneDict.dict.decalObjects.push(thumb);
        tmpIdx += 1;
        imgIdx += 1;
        uLoc += 30;
      }
      vLoc += -30;
    }

    // prev
    if (indexScnIdx>0) {
      var prevDecal = vrSceneDict.initDecal();
      prevDecal.jumpTo = "index_" + (indexScnIdx-1);
      prevDecal.imgsrc = "http://vrembed.org/src/assets/prevArrow.png";;
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
      nextDecal.imgsrc = "http://vrembed.org/src/assets/nextArrow.png";;
      nextDecal.textureDescription.sphereFOV = [15,15];
      nextDecal.textureDescription.sphereCentre = [0, 0];
      nextDecal.textureDescription.plane = true;
      nextDecal.textureDescription.planeOffset = [20,-60];
      vrSceneDict.dict.decalObjects.push(nextDecal);
    }

    var vrEmbedLogo = vrSceneDict.initDecal();
    vrEmbedLogo.imgsrc = "http://vrembed.org/src/assets/vrEmbedLogo.png";
    vrEmbedLogo.textureDescription.sphereFOV = [2*imgWidth*thumbFac, 2*imgWidth*thumbFac];
    vrEmbedLogo.textureDescription.sphereCentre = [0, -90];
    vrEmbedLogo.textureDescription.plane = false;
    vrEmbedLogo.textureDescription.planeOffset = [0,0];
    vrSceneDict.dict.decalObjects.push(vrEmbedLogo);

    var galleryText  = galleryDict.galleryTitle + " \n";
        galleryText += galleryDict.galleryDescription + " \n";
        galleryText += "by " + galleryDict.galleryAttribution + " \n";
        galleryText += galleryDict.galleryMisc + " \n";

    var title = vrSceneDict.initText();
    title.message = galleryText;
    title.textOptions.borderthickness = 0;
    title.textOptions.align = 'left';
    title.textOptions.fontface = 'Courier';
    title.textOptions.fontsize = 36;
    title.textureDescription.sphereFOV = [75,20];
    title.textureDescription.sphereCentre = [90,0];
    title.textureDescription.plane = true;
    title.textureDescription.planeOffset = [0,0];
    vrSceneDict.dict.textObjects.push(title);

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
    self.getImagesCallback(url, this.buildFromImageList);
  }

  this.getImagesCallback = function(url, callbackFunc) {
    if (self.getStory()!=null)
      self.getStory().setGallerySrc(url);

    var imageList = [];
    var imgurTest = parseImgurURL(url);
    if (imgurTest!=null) {
      if (imgurTest[1]=="image"){
        getImgurImage(imgurTest[0], callbackFunc);
      } else if (imgurTest[1]=="album") {
        getImgurAlbum(imgurTest[0], callbackFunc);
      } else if (imgurTest[1]=="gallery") {
        getImgurGallery(imgurTest[0], callbackFunc);
      }
    }

    var flickrAlbumID = getFlickrAlbumID(url);
    if (flickrAlbumID!=null) {
      getFlickrAlbum(flickrAlbumID, buildFlickrAlbum);
      flickrAlbumCallbackFunc = this.buildFromImageList;
    }

    // trigger loading animation
    self.getStory().setLoading(true);
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
    self.pushFromDictToRender(sceneList);
    self.getStory().setLoading(false);

  }

  this.buildFromImageList = function(sceneList) {
    self.pushFromDictToRender(sceneList);
    self.getStory().setLoading(false);
  }

  this.getStory = function() {
    if (self.storyManager == null) {
      return null;
    }

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
