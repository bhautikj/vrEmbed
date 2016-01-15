VRtwglQuad = require('./VRtwglQuad.js');
twgl = require('../js-ext/twgl-full.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fsPassthrough = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = texture2D(textureSource, vec2(uv.x, uv.y));\n"+
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
"  lonLat.x = (lonLat.x/(2.0*PI))+0.5;\n"+
"  lonLat.y = (lonLat.y/(.5*PI))+0.5;\n"+
"  gl_FragColor = texture2D(textureSource, lonLat);\n"+
"}\n"

var fsWindowed = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  uv.y = .5+2.*(uv.y-0.5);\n"+
"  //map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2\n"+
"  float lat = 0.5*PI*(uv.y-0.5);\n"+
"  float lon = PI*(uv.x-0.5);\n"+
"  // map lat/lon to point on unit sphere\n"+
"  vec4 sphere_pnt = vec4(cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat), 1.);\n"+
"  // rotate point around origin via transform - pitch/yaw etc\n"+
"  sphere_pnt *= transform;\n"+
"  // now map point in sphere back to lat/lon coords\n"+
"  float R = length(sphere_pnt);\n"+
"  // map asin, which is -PI/2..PI/2 to 0..1\n"+
"  float finalLat = 0.5+asin(sphere_pnt.z/R)/(0.5*PI);\n"+
"  // map atan, which is -PI..PI to 0..1\n"+
"  float finalLon = 0.5+atan(sphere_pnt.y, sphere_pnt.x)/(PI);\n"+
"  vec2 sphPt = vec2(finalLon, finalLat);\n"+
"  vec2 sphX = vec2(0.25,0.25);\n"+
"  vec2 sphY = vec2(0.75,0.75);\n"+
"  vec2 sphYX = sphY-sphX;\n"+
"  vec2 testPt = (sphPt-sphX);\n"+
"  testPt = mod(testPt, 1.)/sphYX;\n"+
"  if (testPt.x<0. || testPt.x>1. || testPt.y<0. || testPt.y>1.){ discard; return;}\n"+
"  gl_FragColor = texture2D(textureSource, vec2(finalLon, finalLat));\n"+
"}\n"

VRtwglQuadStereoProjection = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.uniforms = {
    resolution:[0,0],
    textureSource:null,
    transform:twgl.m4.identity()
  };

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fsFull360180);
    // var axisYaw = twgl.v3.create(0,1,0);
    // twgl.m4.axisRotate(this.uniforms.transform, axisYaw, Math.PI/2, this.uniforms.transform);
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.render = function() {
    this.uniforms["resolution"] = [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight];
    // var axisYaw = twgl.v3.create(0,1,0);
    // twgl.m4.axisRotate(this.uniforms.transform, axisYaw, 0.005, this.uniforms.transform);
    // var axisPitch = twgl.v3.create(0,0,1);
    // twgl.m4.axisRotate(this.uniforms.transform, axisPitch, 0.005, this.uniforms.transform);

    self.vrtwglQuad.setUniforms(this.uniforms);
    self.vrtwglQuad.render();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

  this.setupProjection = function (textureDescription) {
    var gl = self.vrtwglQuad.glContext;
    var tex = twgl.createTexture(gl, {
      min: gl.LINEAR,
      mag: gl.LINEAR,
      src: textureDescription.textureSource,
      crossOrigin: "", // either this or use twgl.setDefaults
    });

    this.uniforms["textureSource"] = tex;
  }


}

module.exports = VRtwglQuadStereoProjection;
