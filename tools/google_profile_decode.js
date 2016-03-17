"use strict";

// derived from: https://wwgc.firebaseapp.com/js/Cardboard.js
var CARDBOARD = function() {
  // to and from URL-safe variant of base64 encoding
  function base64ToUrl(s) {
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  }

  function base64FromUrl(s) {
    s = s + '==='.slice(0, [0, 3, 2, 1][s.length % 4]);
    return s.replace(/-/g, '+').replace(/_/g, '/');
  }

  var PARAMS_URI_PREFIXES = 'http://google.com/cardboard/cfg?p=';

  var DeviceParams = dcodeIO.ProtoBuf
      .loadProtoFile('CardboardDevice.proto').build().DeviceParams;

  function paramsToUri(params) {
    var msg = new DeviceParams(params);
    return PARAMS_URI_PREFIX + base64ToUrl(msg.toBase64());
  }

  // TODO: support Cardboard v1 URI (i.e. default params)
  function uriToParamsProto(uri) {
    if (uri.substring(0, PARAMS_URI_PREFIX.length) !== PARAMS_URI_PREFIX) {
      return;
    }
    var base64_msg = base64FromUrl(uri.substring(PARAMS_URI_PREFIX.length));
    // TODO: round numeric values
    return DeviceParams.decode64(base64_msg);
  }

  function argToParams(arg) {
    var base64_msg = base64FromUrl(arg);
    // TODO: round numeric values
    return DeviceParams.decode64(base64_msg);
  }

  // Returns plain object having only properties of interest.
  function uriToParams(uri) {
    var source = uriToParamsProto(uri), dest = {}, k;
    for (k in source) {
      if (source.hasOwnProperty(k)) {
        dest[k] = source[k];
      }
    }
    return dest;
  }

  return {
    DeviceParams: DeviceParams,
    paramsToUri: paramsToUri,
    uriToParams: uriToParams,
    uriToParamsProto: uriToParamsProto,
    argToParams: argToParams
  };
}

// via: http://stackoverflow.com/a/901144
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


var paramsFromURI = function(testURI) {
  var qs = getParameterByName('p', testURI);
  var cardboard = new CARDBOARD();
  console.log(qs);
  var params = cardboard.argToParams(qs);
  processParams(params);
}

function jsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

var unshortenURL = function(url) {
  var request = "http://api.longurl.org/v2/expand?url="
      request += url;
      request += "&format=json";

  jsonp(request, function(data) {
    var longurl = data["long-url"];
    console.log(longurl);
    paramsFromURI(longurl);
  });
}

// quirc block, via http://www.lab4games.net/zz85/blog/2015/12/03/quirc-js-an-alternative-javascript-qrcode-decoder/
function decoded(i, version, ecc_level, mask, data_type, payload, payload_len) {
  // console.log('decoded', arguments)
  var buffer = read(payload, payload_len);
  var str = String.fromCharCode.apply(null, buffer)
  console.log(str);
  unshortenURL(str);
}

function read(offset, len) {
  return new Uint8Array(Module.HEAPU8.buffer, offset, len);
}

function raw_quirc_apis() {
  var quirc = {}
  Object
    .keys(Module)
    .filter(function(f) { return f.startsWith('_quirc') })
    .map(function(f) { return f.substring(7) })
    .some(function(f) { quirc[f] = Module['_quirc_' + f] });
  log('quirc', quirc);
}

var execQRDecode = function(imgsrc) {
  var img = new Image;
  img.crossOrigin = "Anonymous";
  img.src = imgsrc;
  img.onload = function() {
    var width = this.width, height = this.height;
    var canvas = document.createElement('canvas');
  	canvas.width = width;
  	canvas.height = height;
  	var ctx = canvas.getContext('2d');
  	ctx.drawImage(this, 0, 0);
  	var imageData = ctx.getImageData(0,0, width, height);
  	var data = imageData.data;
    var image = image = Module._xsetup(width, height);

    for (var i=0, j=0; i < data.length; i+=4, j++) {
      Module.HEAPU8[image + j] = data[i];
    }
    var a = Module._xprocess();
  }
}

var processParams = function(params){

  var jsonOut = document.getElementById('outJSON');

  var jsonString = JSON.stringify(params);
  jsonOut.innerHTML += jsonString + "," + "<br/>";

  var vrEmbedOut = document.getElementById('outvrEmbed');

  var intName = params["vendor"]+ params["model"]
  intName = intName.replace(/\W/g, '');
  intName = intName.toUpperCase();

  var vrDict = intName + ' : {' +
    'name: "' + params["vendor"] + " " + params["model"] + '",'+
    'renderMode: VRRenderModes.STEREOANAGLYPH,'+
    'icon: VRIcons.logoAnaglyph,'+
    'hfov:' + params["left_eye_field_of_view_angles"][0] + ','+
    'ipd:' + parseInt(params["inter_lens_distance"]*1000) + ','+
    'ipdAdjust: 0,'+
    'k: [' + parseInt(params["distortion_coefficients"][0]*1000)/1000.0 + "," +
             parseInt(params["distortion_coefficients"][1]*1000)/1000.0 + "] }";

   vrEmbedOut.innerHTML += vrDict + "," + "<br/>";
}

// ex: gv2.jpg
var decodeQR = function() {
  var qrURL = document.getElementById('qrCodeURL').value;
  execQRDecode(qrURL);
}

// ex: goo.gl/R2gCV1
var decodeShortURL = function() {
  var shortURL = document.getElementById('shortURL').value;
  unshortenURL(shortURL);
}

// ex: https://www.google.com/get/cardboard/download/?p=CgZHb29nbGUSEkNhcmRib2FyZCBJL08gMjAxNR2ZuxY9JbbzfT0qEAAASEIAAEhCAABIQgAASEJYADUpXA89OgiCc4Y-MCqJPlAAYAM
var decodeLongURL = function() {
  var longURL = document.getElementById('longURL').value;
  paramsFromURI(longURL);
}

var qrCodeButton = document.getElementById('qrCodeButton');
qrCodeButton.onclick = decodeQR;

var shortURLButton = document.getElementById('shortURLButton');
shortURLButton.onclick = decodeShortURL;

var longURLButton = document.getElementById('longURLButton');
longURLButton.onclick = decodeLongURL;
