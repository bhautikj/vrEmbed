var imgurImageCache = {};
var imgurGalleryCache = {};

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

//TODO: chack out https://github.com/mauricesvay/ImageResolver
var getImgurImageId = function(imgurURL) {
  var part = null;
  var spl = imgurURL.split('/');
  for (i=0; l=spl.length,i<l; i++) {
    if (spl[i].endsWith("imgur.com")){
      if (i<l-1) {
        part = spl[i+1];
        if (part=="") {
          return null;
        }
        partspl = part.split('.');

        if (partspl[0]=="")
          return null;

        return partspl[0];
      }
    }
  }
  return null;
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

var gotImgurImageSrc = function(imagePart, dataArray, callbackFunc) {
  imgurImageCache[imagePart] = dataArray;
  var imgURL = dataArray.data.link;

  if (callbackFunc!=null && dt!=null){
    var sceneList = galleryDictToSceneDicts(dt);
    callbackFunc(imgURL);
  }
}

var getImgurImage = function(imagePart, callbackFunc) {
  if (imagePart in imgurImageCache) {
    if (callbackFunc!=null)
      gotImgurImage(imgurImageCache[imagePart]);
    return;
  }
  doImgurCall(imagePart, "https://api.imgur.com/3/image/", gotImgurImageSrc, callbackFunc);
};

var fetchImageURL = function(url, callbackFunc) {
  var imgurTest = getImgurImageId(url);
  if (imgurTest!=null) {
    getImgurImage(imgurTest, callbackFunc);
  } else {
    callbackFunc(url);
  }
}
