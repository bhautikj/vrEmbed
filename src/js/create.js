
VRCreateSphere = require('./VRCreateSphere.js');

// via: http://stackoverflow.com/questions/22575636/how-to-check-if-a-canvas-element-has-been-tainted/22580129#22580129
var newImage = function(src,callWhenTainted,callWhenNotTainted){
  // tmpCanvas to test CORS
  var tmpCanvas=document.createElement("canvas");
  var tmpCtx=tmpCanvas.getContext("2d");
  // tmpCanvas just tests CORS, so make it 1x1px
  tmpCanvas.width=tmpCanvas.height=1;

  var img=new Image();
  var isLoaded =false;
  // set the cross origin flag (and cross our fingers!)
  img.crossOrigin="anonymous";
  img.onload=function(){
    if (isLoaded)
      return;
    // add a tainted property to the image
    // (initialize it to true--is tainted)
    img.tainted=true;
    // draw the img on the temp canvas
    tmpCtx.drawImage(img,0,0);
    // just in case this onload stops on a CORS error...
    // set a timer to call afterOnLoad shortly
    setTimeout(function(){
       afterOnLoad(img,callWhenTainted,callWhenNotTainted);
    },500);  // you can probably use less than 1000ms
    // try to violate CORS
    var i=tmpCtx.getImageData(1,1,1,1);
    // if we get here, CORS is OK so set tainted=false
    img.tainted=false;
    isLoaded =true;
  };

  if(img.addEventListener) {
    img.addEventListener('error', function (e) {
        e.preventDefault(); // Prevent error from getting thrown
        // Handle error here
        callWhenTainted(img);
    });
  }
  img.src=src;
  return(img);
}

// called from image.onload
// at this point the img.tainted flag is correct
var afterOnLoad = function(img,callWhenTainted,callWhenOK){
  if(img.tainted){
    // it's tainted
    callWhenTainted(img);
  } else {
    // it's OK, do dataURL stuff
    callWhenOK(img);
  }
}

var imageNotOK = function(img) {
  var msg = "Cannot load image: " + img.src + " - problem loading image or host does not allow remote loading of images (CORS error)."
  console.log(msg);
}

var proceed = function(img) {
  console.log("PROCEEDING");
  vrCreateSphere = new VRCreateSphere();
  sp = vrCreateSphere.createSphere(document.getElementById("sphere"),img);
  vrCreateSphere.tiltTurn(20,90);
  sp.renderFrame(0);
}


var loadImage = function() {
  console.log("LOADIMAGE");

  //var imageURL = document.getElementById('imageURL').value;
  var imageURL = "http://localhost:8000/src/assets/rheingauer_dom.jpg";
  var img = newImage(imageURL, imageNotOK, proceed);
}

var paramChange = function() {
  var hfovButton = document.getElementById("hfov");
  var vfovButton = document.getElementById("vfov");
  var xposButton = document.getElementById("xpos");
  var yposButton = document.getElementById("ypos");
  var xpos = parseFloat(xposButton.value) + 360;
  var ypos = parseFloat(yposButton.value) + 360;

  vrCreateSphere.tiltTurn(ypos, xpos);
  sp.renderFrame(0);
}

var init = function() {
   var loadButton = document.getElementById("loadImage");
   loadButton.onclick = loadImage;

   var hfovButton = document.getElementById("hfov");
   var vfovButton = document.getElementById("vfov");
   var xposButton = document.getElementById("xpos");
   var yposButton = document.getElementById("ypos");

   hfovButton.oninput = paramChange;
   hfovButton.onchange = paramChange;
   vfovButton.oninput = paramChange;
   vfovButton.onchange = paramChange;
   xposButton.oninput = paramChange;
   xposButton.onchange = paramChange;
   yposButton.oninput = paramChange;
   yposButton.onchange = paramChange;

  //  paramChange();
}

init();
