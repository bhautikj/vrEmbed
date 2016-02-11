
// create a test quad from this element: <twglTest></twglTest>
runTest = function() {
  VRtwglQuadTest = require('./VRtwglQuadTest.js');

  console.log("INIT");
  var twglTestElements=document.getElementsByTagName("twglTest");
  for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
    console.log("FOUND");
    var twglTestElement = twglTestElements[twglTestIt];
    var vrTwglQuadTest = new VRtwglQuadTest();
    vrTwglQuadTest.init(twglTestElement);
    vrTwglQuadTest.resize();
    window.addEventListener('resize', vrTwglQuadTest.resize, false);
    vrTwglQuadTest.anim();
  }
}

runTestBuffer = function() {
  VRtwglQuadTestBuffer = require('./VRtwglQuadTestBuffer.js');

  console.log("INIT");
  var twglTestElements=document.getElementsByTagName("twglTest");
  for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
    console.log("FOUND");
    var twglTestElement = twglTestElements[twglTestIt];
    var vrTwglQuadTest = new VRtwglQuadTestBuffer();
    vrTwglQuadTest.init(twglTestElement);
    vrTwglQuadTest.resize();
    window.addEventListener('resize', vrTwglQuadTest.resize, false);
    vrTwglQuadTest.anim();
  }
}

// create a test quad from this element: <twglTest></twglTest>
runTestStereographic = function() {
  VRtwglQuadStereoProjection = require('./VRtwglQuadStereoProjection.js');
  VRTextureDescription = require('./VRTextureDescription.js');

  var twglTestElements=document.getElementsByTagName("twglTest");
  for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
    var twglTestElement = twglTestElements[twglTestIt];
    var vrtwglQuadStereoProjection = new VRtwglQuadStereoProjection();
    vrtwglQuadStereoProjection.init(twglTestElement);

    var texArray = [];
    var texDescA = new VRTextureDescription();
    texDescA.textureSource = 'src/assets/rheingauer_dom_crv.jpg';
    texDescA.isStereo = false;
    texDescA.sphereFOV = [360,180];
    texDescA.sphereCentre = [0,0];
    texDescA.U_l = [0.,0.];
    texDescA.V_l = [1.,1.];
    texDescA.U_r = [0.,0.];
    texDescA.V_r = [1.,1.];
    texArray.push(texDescA);

    var texDescB = new VRTextureDescription();
    texDescB.textureSource='src/assets/stereograph_b.jpg';
    texDescB.isStereo = true;
    texDescB.sphereFOV = [30,30];
    texDescB.sphereCentre = [30,30];
    texDescB.U_l = [0.,0.];
    texDescB.V_l = [.5,1.];
    texDescB.U_r = [.5,0.];
    texDescB.V_r = [1.,1.];
    texArray.push(texDescB);

    var texDescC = new VRTextureDescription();
    texDescC.textureSource='src/assets/stereograph_b.jpg';
    texDescC.isStereo = true;
    texDescC.sphereFOV = [90,90];
    texDescC.sphereCentre = [90,0];
    texDescC.U_l = [0.,0.];
    texDescC.V_l = [.5,1.];
    texDescC.U_r = [.5,0.];
    texDescC.V_r = [1.,1.];
    // texArray.push(texDescC);

    vrtwglQuadStereoProjection.loadTextures(texArray);

    vrtwglQuadStereoProjection.resize();
    window.addEventListener('resize', vrtwglQuadStereoProjection.resize, false);
    vrtwglQuadStereoProjection.anim();
  }
}

var rad2deg = function(x) {
  return Math.floor(180*x/Math.PI);
}

var lonLatToPtOrig = function(lon, lat) {
  var x2y2 = lon * lon + lat * lat;
  var pt = [lon*2/(x2y2+1), lat*2/(x2y2+1), (x2y2-1)/(x2y2+1)];
  return pt;
}

var ptToLonLatOrig = function(tpt) {
  var r = Math.sqrt(tpt[0]*tpt[0] + tpt[1]*tpt[1] + tpt[2]*tpt[2]);
  var _lon = -1.*Math.atan2(tpt[1], tpt[0]);
  var _lat = 2.0*(Math.acos(tpt[2] / r) - Math.PI*.5) + Math.PI*.5;
  return [_lon, _lat];
}

var lonLatToPt = function(lon, lat) {
  var clon = Math.cos(lon);
  var slon = Math.sin(lon);
  var clat = Math.cos(lat);
  var slat = Math.sin(lat);

  return [clon*clat, clat*slon, slat];
}

var ptToLonLat = function(tpt) {
  var r = Math.sqrt(tpt[0]*tpt[0] + tpt[1]*tpt[1] + tpt[2]*tpt[2]);
  var _lon = Math.atan2(tpt[1], tpt[0]);
  var _lat = Math.asin(tpt[2] / r);
  return [_lon, _lat];
}

runTestMatrix = function() {
  VRRotMath = require('./VRRotMath.js');
  var rotMath = new VRRotMath();

  var orientList = [ { name: "portraitForward", orient: [0,90,0,0] },
                     { name: "portraitRight", orient: [270,90,0,0] },
                     { name: "landscapeForward", orient: [270,0,90,-90] },
                     { name: "landscapeRight", orient: [180,0,90,-90]} ];

  var uvList = [[0,0],[0,1],[1,0],[1,1],[0.5,0.5]];

  for (objit = 0;objit<orientList.length; objit++){
    var name = orientList[objit]["name"];
    var orient = orientList[objit]["orient"];
    var rotMat = rotMath.gyroToMat(orient[0], orient[1], orient[2], orient[3], 0)[0];

    var fov = 0.5;
    for (uvit = 0; uvit<uvList.length; uvit++) {
      var _uv = uvList[uvit];
      var uv = [];
      uv[0] = 0.5+fov*(_uv[0]-0.5);
      uv[1] = 0.5+fov*(_uv[1]-0.5);

      var lat = 0.5*Math.PI*(2.*uv[1]-1.0);
      var lon = Math.PI*(2.0*uv[0]-1.0);

      var pt = lonLatToPt(lon,lat);

      var tpt =[];
      twgl.m4.transformPoint(rotMat,pt,tpt);

      var ll = ptToLonLat(tpt);

      // negate to fix for view rot
      var _lon = -ll[0];
      var _lat = -ll[1];

      document.getElementById("log").innerHTML += "<br/><b>" + name + "</b>";
      document.getElementById("log").innerHTML += " input (" + rad2deg(lon) + "," + rad2deg(lat) + ")";
      document.getElementById("log").innerHTML += " output (" + rad2deg(_lon) + "," + rad2deg(_lat) + ")";
    }
  }

};

// runTestMatrix();
//runTestBuffer();
// runTest();
runTestStereographic();
