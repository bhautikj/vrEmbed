VRtwglQuad = require('./VRtwglQuad.js');
VRRenderModes = require('./VRRenderModes.js');
VRLookController = require('./VRControllers.js');
VRDeviceManager = require('./VRDeviceManager.js');
VRCanvasFactory = require('./VRCanvasFactory.js');
VRRotMath = require('./VRRotMath.js');
Util = require('./VRUtil.js');

twgl = require('../js-ext/twgl-full.js');

var vs = "precision highp float;\n"+
"attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fsTex = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = texture2D(textureSource, uv);\n"+
"}\n";

var fsTest = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = vec4(uv.x, uv.y,0.0,1.0);\n"+
"}\n"

var fsFull360180 = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  //map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2\n"+
"  float lat = 0.5*PI*(2.*uv.y-1.0);\n"+
"  float lon = PI*(2.0*uv.x-1.0);\n"+
"  // map lat/lon to point on unit sphere\n"+
"  float r = cos(lat);\n"+
"  vec4 sphere_pnt = vec4(r*cos(lon), r*sin(lon), sin(lat), 1.0);\n"+
"  sphere_pnt *= transform;\n"+
"  // now map point in sphere back to lat/lon coords\n"+
"  float sphere_pnt_len = length(sphere_pnt);\n"+
"  sphere_pnt /= sphere_pnt_len;\n"+
"  vec2 lonLat = vec2(atan(sphere_pnt.y, sphere_pnt.x), asin(sphere_pnt.z));\n"+
"  // map back to 0..1\n"+
"  lonLat.x = (lonLat.x/(2.0*PI))+0.5;\n"+
"  lonLat.y = (lonLat.y/(.5*PI))+0.5;\n"+
"  gl_FragColor = texture2D(textureSource, lonLat);\n"+
"}\n"

// display lens distorter equations:
// https://support.google.com/cardboard/manufacturers/answer/6324808?hl=en
var fsRenderDisplay = "precision highp float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform sampler2D textureGui;\n"+
"uniform mat4 transform;\n"+
"uniform int renderMode;\n"+
"uniform vec2 fovParams;\n"+
"uniform vec2 k;\n"+
"uniform float ipdAdjust;\n"+
"uniform float guiMult;\n"+
"void main(void) {\n"+
   //normalize uv so it is between 0 and 1
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.x = (1. - uv.x);\n"+
"  bool leftImg=false;\n"+
"  vec2 fov = fovParams;\n"+
"  if (renderMode == 1) {\n"+
"    fov.y *= 2.;\n"+
"    if (uv.x<0.5) { \n"+
"      uv.x *= 2.; \n"+
"      uv.x += ipdAdjust;\n"+
"      leftImg=true; }\n"+
"    else {\n"+
"      uv.x = 2.*(uv.x - .5);\n"+
"      uv.x -= ipdAdjust;\n"+
"    }\n"+
     // lens distorter
"    float r2 = (uv.x-0.5)*(uv.x-0.5) + (uv.y-0.5)*(uv.y-0.5);\n"+
"    uv.x = 0.5+(uv.x-0.5)*(1. + k.x*r2 + k.y*r2*r2);\n"+
"    uv.y = 0.5+(uv.y-0.5)*(1. + k.x*r2 + k.y*r2*r2);\n"+
"    uv.x = 0.5+fov.x*(uv.x-0.5);\n"+
"    uv.y = 0.5+fov.y*(uv.y-0.5);\n"+
"  } else {\n"+
     //constrain to FOV
"    uv.x = 0.5+fov.x*(uv.x-0.5);\n"+
"    uv.y = 0.5+fov.y*(uv.y-0.5);\n"+
"  }\n"+
   //map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2
"  float lat = 0.5*PI*(2.*uv.y-1.0);\n"+
"  float lon = PI*(2.0*uv.x-1.0);\n"+
   // map lat/lon to point on unit sphere
"  float r = cos(lat);\n"+
"  vec4 sphere_pnt = vec4(r*cos(lon), r*sin(lon), sin(lat), 1.0);\n"+
"  sphere_pnt *= transform;\n"+
   // now map point in sphere back to lat/lon coords
"  float sphere_pnt_len = length(sphere_pnt);\n"+
  // disabling this seems to fix the scaling wonkiness??
  // "  sphere_pnt /= sphere_pnt_len;\n"+
"  vec2 lonLat = vec2(atan(sphere_pnt.y, sphere_pnt.x), asin(sphere_pnt.z));\n"+
  // map back to 0..1
"  lonLat.x = (lonLat.x/(2.0*PI))+0.5;\n"+
"  lonLat.y = (lonLat.y/(PI))+0.5;\n"+
   // vanilla monocular render
"  if (renderMode != 2) {\n"+
"    if (renderMode == 0) {\n"+
"      lonLat.y *= 0.5;\n"+
"    } else {\n"+
"      if (leftImg == true) {\n"+
"        lonLat.y *= 0.5;\n"+
"      } else {\n"+
"        lonLat.y = 0.5 + lonLat.y*0.5;\n"+
"      }\n"+
"    }\n"+
"    vec4 spherePx = texture2D(textureSource, lonLat);\n"+
"    vec4 guiPx = texture2D(textureGui, lonLat);\n"+
"    guiPx.a *= guiMult;\n"+
"    gl_FragColor = guiPx*guiPx.a + spherePx*(1.-guiPx.a);\n"+
"  } else if (renderMode == 2) {\n"+
    // anaglyph render
"    vec4 colorL, colorR, colorLSphere, colorLGui, colorRSphere, colorRGui;\n"+
"    colorLSphere = texture2D(textureSource, vec2(lonLat.x, 0.5+lonLat.y*0.5));\n"+
"    colorLGui = texture2D(textureGui, vec2(lonLat.x, 0.5+lonLat.y*0.5));\n"+
"    colorLGui.a *= guiMult;\n"+
"    colorL = colorLGui*colorLGui.a + colorLSphere*(1.-colorLGui.a);\n"+
"    colorRSphere = texture2D(textureSource, vec2(lonLat.x, lonLat.y*0.5));\n"+
"    colorRGui = texture2D(textureGui, vec2(lonLat.x, lonLat.y*0.5));\n"+
"    colorRGui.a *= guiMult;\n"+
"    colorR = colorRGui*colorRGui.a + colorRSphere*(1.-colorRGui.a);\n"+
"    gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;\n"+
"  }\n"+
"}\n"

var fsWindowed = "precision highp float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"uniform vec2 sphX;\n"+
"uniform vec2 sphYX;\n"+
"uniform vec4 uvL;\n"+
"uniform vec4 uvR;\n"+
"uniform vec2 planeOffset;\n"+
"uniform float planar;\n"+
"void uvToSphere(in vec2 uv, out vec4 sphere_pnt) {\n"+
"  float lon = PI*(2.0*uv.x-1.0);\n"+
"  float lat = 0.5*PI*(2.*uv.y-1.0);\n"+
"  float r = cos(lat);\n"+
"  sphere_pnt = vec4(r*cos(lon), r*sin(lon), sin(lat), 1.0);\n"+
"}\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  bool leftImg=true;\n"+
"  if (uv.y<0.5) { \n"+
"    uv.y *= 2.; \n"+
"    leftImg=false; }\n"+
"  else {\n"+
"    uv.y = 2.*(uv.y - .5);\n"+
"  }\n"+
  // map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2
"  vec4 sphere_pnt;\n"+
"  uvToSphere(uv, sphere_pnt);\n"+
"  sphere_pnt *= transform;\n"+
   // now map point in sphere back to lat/lon coords
"  float sphere_pnt_len = length(sphere_pnt);\n"+
// vanilla sphere projection
"  vec2 lonLat;\n"+
"  if (planar<0.5) {\n"+
"    lonLat = vec2(atan(sphere_pnt.y, sphere_pnt.x), asin(sphere_pnt.z));\n"+
"  } else {\n"+
// cube projection
"    lonLat = vec2(0.25*PI*sphere_pnt.y/sphere_pnt.x, 0.25*PI*sphere_pnt.z/sphere_pnt.x);\n"+
"    vec2 pofs = vec2(planeOffset.x*-0.25*PI,planeOffset.y*0.25*PI);\n"+
"    lonLat += pofs;\n"+
"    if (sphere_pnt.x<0. || abs(lonLat.x)>PI || abs(lonLat.y)>0.5*PI){ discard; return;}\n"+
"  }\n"+
  // map back to 0..1
"  lonLat.x = (lonLat.x/(2.0*PI))+0.5;\n"+
"  lonLat.y = (lonLat.y/(PI))+0.5;\n"+
"  vec2 testPt = (lonLat-sphX);\n"+
"  testPt = mod(testPt, 1.)/sphYX;\n"+
"  // bail out if we're out of drawable region\n"+
"  if (testPt.x<0. || testPt.x>1. || testPt.y<0. || testPt.y>1.){ discard; return;}\n"+
"  // now map to either left or right UV tex\n"+
"  vec2 uvX;\n"+
"  vec2 uvYX;\n"+
"  if (leftImg == true) {\n"+
"    uvX = uvL.xy;\n"+
"    uvYX = uvL.zw;\n"+
"  } else {\n"+
"    uvX = uvR.xy;\n"+
"    uvYX = uvR.zw;\n"+
"  }\n"+
"  vec2 texC = uvX + (testPt*uvYX);\n"+
"  gl_FragColor = texture2D(textureSource, texC); \n"+
"}\n"

VRtwglQuadStereoProjection = function() {
  var self = this;
  this.vrDeviceManager = VRDeviceManager;
  this.vrtwglQuad = null;
  this.vrtwglQuadFb = null;
  this.vrtwglQuadFbGui = null;
  this.textureSet = [];
  this.textureDescriptions = {};
  this.textures = [];
  this.fovX = 40;
  this.tick = 0.0;
  this.vrGui = null;
  this.controller = new VRLookController();
  this.cameraMatrix = twgl.m4.identity();
  this.controller.setCamera(this.cameraMatrix);
  this.textureLoadStartAnim = Date.now();
  this.textureLoadEndAnim = this.textureLoadStartAnim + 1000;
  this.texReady = false;
  this.rotMath = new VRRotMath();

  this.pickResolution = function() {
    var tmpCanvas = document.createElement('canvas');
    var gl = twgl.getWebGLContext(tmpCanvas);
    var maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    tmpCanvas.remove();

    if (maxTex<=1024) {
      return 1024;
    } else if (maxTex<=2048) {
      return 2048;
    } else {
      return 4096;
    }
  }

  this.fbRes = this.pickResolution();

  this.getContainer = function() {
    return this.vrtwglQuad.container;
  }

  this.getDrawCanvas = function() {
    return this.vrtwglQuad.canvas;
  }

  this.getContext = function() {
    return this.vrtwglQuad.glContext;
  }

  this.setVrGui = function(vrGui) {
    this.vrGui = vrGui;
  }

  this.uniforms = {
    resolution:[0,0],
    fovParams:[0,0],
    textureSource:null,
    textureGui:null,
    transform:twgl.m4.identity(),
    renderMode:VRRenderModes.STEREOSIDEBYSIDE,
    k:[0,0],
    ipdAdjust:0,
    guiMult:0.6
  }

  this.uniformsFb = {
    resolution:[this.fbRes,this.fbRes],
    textureSource:null,
    transform:twgl.m4.identity(),
    planar:0,
    planeOffset:[0,0],
  }

  this.uniformsFbGui = {
    resolution:[this.fbRes,this.fbRes],
    textureSource:null,
    transform:twgl.m4.identity(),
    planar:1,
    planeOffset:[0,0],
  }

  this.setupFromDevice = function(device) {
    this.uniforms.renderMode = device.renderMode;
    this.fovX = device.hfov;
    this.uniforms.k = device.k;
    this.uniforms.ipdAdjust = device.ipdAdjust;
  }

  this.getRenderMode = function() {
    return this.uniforms.renderMode;
  }

  this.getIPDAdjust = function() {
    return this.uniforms.ipdAdjust;
  }

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fsRenderDisplay);

    // device config params
    this.setupFromDevice (this.vrDeviceManager.getWindowedDevice());
    // ---

    this.vrtwglQuadFb = new VRtwglQuad();
    this.vrtwglQuadFb.initFramebuffer(this.fbRes, this.vrtwglQuad.glContext, vs, fsWindowed);
    self.vrtwglQuadFb.clearFrameBuffer(0, 0, 0, 1.0);

    this.vrtwglQuadFbGui = new VRtwglQuad();
    this.vrtwglQuadFbGui.initFramebuffer(this.fbRes, this.vrtwglQuad.glContext, vs, fsWindowed);
    self.vrtwglQuadFbGui.clearFrameBuffer(0, 0, 0, 0);

    self.vrtwglQuad.resetViewport();
  }

  this.createImageFromSphereTexture = function() {
    return this.vrtwglQuadFb.createImageFromTexture();
  }

  this.renderGui = function() {
    if (this.vrGui == null) {
      console.log("ERROR: trying to render before gui is ready");
      return;
    }

    var gl = self.vrtwglQuad.glContext;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    self.vrtwglQuadFbGui.clearFrameBuffer(0, 0, 0, 0);

    for(texIt = 0;texIt < self.vrGui.canvasSet.length; texIt++) {
      var canvasTex = self.vrGui.canvasSet[texIt][0];
      var textureDesc = canvasTex.vrTextureDescription;
      self.uniformsFbGui["textureSource"] = canvasTex.glTex;
      self.uniformsFbGui["sphX"] = [0.5-0.5*(textureDesc.sphereFOV[0]/360.0),0.5-0.5*(textureDesc.sphereFOV[1]/180.0)];
      self.uniformsFbGui["sphYX"] = [(textureDesc.sphereFOV[0]/360.0),(textureDesc.sphereFOV[1]/180.0)];
      self.uniformsFbGui["transform"] = self.createOrientation(Math.PI*textureDesc.sphereCentre[0]/180.0, Math.PI*textureDesc.sphereCentre[1]/180.0);
      self.uniformsFbGui["uvL"] = [textureDesc.U_l[0],
                                textureDesc.U_l[1],
                                textureDesc.V_l[0]-textureDesc.U_l[0],
                                textureDesc.V_l[1]-textureDesc.U_l[1]];
      self.uniformsFbGui["uvR"] = [textureDesc.U_r[0],
                                textureDesc.U_r[1],
                                textureDesc.V_r[0]-textureDesc.U_r[0],
                                textureDesc.V_r[1]-textureDesc.U_r[1]];
      if (textureDesc.plane) {
        self.uniformsFbGui["planar"] = 1;
        self.uniformsFbGui["planeOffset"] = textureDesc.planeOffset;
      } else {
        self.uniformsFbGui["planar"] = 0;
        self.uniformsFbGui["planeOffset"] = [0,0];
      }
      self.renderFbGui();
    }

    self.vrtwglQuad.resetViewport();
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.guiToLonLat = function(pt) {
    var uniforms = this.uniforms;

    var uv = [pt[0], pt[1]];
    uv[0] = (1. - uv[0]);
    var leftImg = false;

    var fov = [uniforms.fovParams[0], uniforms.fovParams[1]];
    var k = uniforms.k;
    var renderMode = uniforms.renderMode;
    var ipdAdjust = uniforms.ipdAdjust;

    if (renderMode == 1) {
      fov[1] *= 2.;
      if (uv[0]<0.5) {
        uv[0] *= 2.;
        uv[0] += ipdAdjust;
        leftImg=true;
      } else {
        uv[0] = 2.*(uv[0] - .5);
        uv[0] -= ipdAdjust;
      }
         // lens distorter
      var r2 = (uv[0]-0.5)*(uv[0]-0.5) + (uv[1]-0.5)*(uv[1]-0.5);
      uv[0] = 0.5+(uv[0]-0.5)*(1. + k[0]*r2 + k[1]*r2*r2);
      uv[1] = 0.5+(uv[1]-0.5)*(1. + k[0]*r2 + k[1]*r2*r2);
      uv[0] = 0.5+fov[0]*(uv[0]-0.5);
      uv[1] = 0.5+fov[1]*(uv[1]-0.5);
    } else {
         //constrain to FOV
      uv[0] = 0.5+fov[0]*(uv[0]-0.5);
      uv[1] = 0.5+fov[1]*(uv[1]-0.5);
    }

    //map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2
    var lon = Math.PI*(2.0*uv[0]-1.0);
    var lat = 0.5*Math.PI*(2.*uv[1]-1.0);
    // map lat/lon to point on unit sphere
    var r = Math.cos(lat);
    var sphere_pnt = [r*Math.cos(lon), r*Math.sin(lon), Math.sin(lat)];
    // sphere_pnt *= transform;
    sphere_pnt = twgl.m4.transformPoint(uniforms.transform, sphere_pnt);

    // now map point in sphere back to lat/lon coords
    var lonLat = [Math.atan2(sphere_pnt[1], sphere_pnt[0]), Math.asin(sphere_pnt[2])];
    // map back to 0..1
    // lonLat[0] = (lonLat[0]/(2.0*Math.PI))+0.5;
    // lonLat[1] = (lonLat[1]/(Math.PI))+0.5;

    return [180.0*lonLat[0]/Math.PI, 180.0*lonLat[1]/Math.PI];
  }

  this.getGuiMult = function() {
    return this.uniforms.guiMult;
  }

  this.setGuiMult = function(mv) {
    this.uniforms.guiMult = mv;
  }

  this.render = function() {
    this.controller.update(false);
    twgl.m4.copy(this.cameraMatrix, this.uniforms.transform);
    this.uniforms["resolution"] = [self.vrtwglQuad.canvas.width, self.vrtwglQuad.canvas.height];
    var aspect = 2.0*self.vrtwglQuad.canvas.height/self.vrtwglQuad.canvas.width;
    this.uniforms["fovParams"] = [this.fovX/360.0, aspect*this.fovX/360.0];
    // console.log(this.uniforms["fovParams"]);
    this.uniforms["textureSource"] = self.vrtwglQuadFb.getFramebufferTexture();
    this.uniforms["textureGui"] = self.vrtwglQuadFbGui.getFramebufferTexture();

    self.vrtwglQuad.setUniforms(this.uniforms);
    self.vrtwglQuad.render();
  }

  this.renderFb = function() {
    self.vrtwglQuadFb.setUniforms(this.uniformsFb);
    self.vrtwglQuadFb.renderFramebuffer();
  }

  this.renderFbGui = function() {
    self.vrtwglQuadFbGui.setUniforms(this.uniformsFbGui);
    self.vrtwglQuadFbGui.renderFramebuffer();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

  this.createOrientation = function(pitch, yaw) {
    return this.rotMath.rotateZX(pitch, yaw);
  }

  this.texturesLoaded = function(err, textures, sources) {
    if (err != undefined) {
      alert(err);
    }
    var gl = self.vrtwglQuad.glContext;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    self.vrtwglQuadFb.clearFrameBuffer(0.0, 0.0, 0.0, 1.0);
    //alert("TEXTURES LOADED");
    for (var key in self.textures) {
      if (self.textures.hasOwnProperty(key)) {
        var textureDesc = self.textureDescriptions[key];
        self.uniformsFb["textureSource"] = self.textures[key];
        self.uniformsFb["sphX"] = [0.5-0.5*(textureDesc.sphereFOV[0]/360.0),0.5-0.5*(textureDesc.sphereFOV[1]/180.0)];
        self.uniformsFb["sphYX"] = [(textureDesc.sphereFOV[0]/360.0),(textureDesc.sphereFOV[1]/180.0)];
        self.uniformsFb["transform"] = self.createOrientation(Math.PI*textureDesc.sphereCentre[0]/180.0, Math.PI*textureDesc.sphereCentre[1]/180.0);
        self.uniformsFb["uvL"] = [textureDesc.U_l[0],
                                  textureDesc.U_l[1],
                                  textureDesc.V_l[0]-textureDesc.U_l[0],
                                  textureDesc.V_l[1]-textureDesc.U_l[1]];
        self.uniformsFb["uvR"] = [textureDesc.U_r[0],
                                  textureDesc.U_r[1],
                                  textureDesc.V_r[0]-textureDesc.U_r[0],
                                  textureDesc.V_r[1]-textureDesc.U_r[1]];
        if (textureDesc.plane) {
          self.uniformsFb["planar"] = 1;
          self.uniformsFb["planeOffset"] = textureDesc.planeOffset;
        } else {
          self.uniformsFb["planar"] = 0;
          self.uniformsFb["planeOffset"] = [0,0];
        }

        self.renderFb();
        gl.deleteTexture(self.textures[key]);
      }
    }

    self.vrtwglQuad.resetViewport();
    self.resize();

    self.texReady = true;
    self.textureLoadStartAnim = Date.now();
    self.textureLoadEndAnim = self.textureLoadStartAnim + 250;
  }

  this.loadTextures = function (textureDescriptions) {
    var gl = self.vrtwglQuad.glContext;
    var texArray = [];
    for(texIt = 0;texIt < textureDescriptions.length; texIt++) {
      var texSpec = {
        min: gl.LINEAR,
        mag: gl.LINEAR,
        src: textureDescriptions[texIt].textureSource,
        crossOrigin: "", // either this or use twgl.setDefaults
      };
      texArray[texIt] = texSpec;
      this.textureDescriptions[texIt] = textureDescriptions[texIt];
    }

    this.texReady = false;
    this.textureLoadStartAnim = Date.now();
    this.textureLoadEndAnim = this.textureLoadStartAnim + 1000;
    var gl = self.vrtwglQuad.glContext;
    this.textures = twgl.createTextures(gl, texArray, this.texturesLoaded);
  }

  this.teardown = function() {
    this.textures = [];
    this.textureDescriptions = [];
  }

}

module.exports = VRtwglQuadStereoProjection;
