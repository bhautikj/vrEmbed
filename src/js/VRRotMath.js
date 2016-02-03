twgl = require('../js-ext/twgl-full.js');

var matFromOrient = function( alpha, beta, gamma ) {
  var d2r = Math.PI / 180;

  var _x = beta  ? beta  * d2r : 0; // beta value
  var _y = gamma ? gamma * d2r : 0; // gamma value
  var _z = alpha ? alpha * d2r : 0; // alpha value

  var cX = Math.cos( _x );
  var cY = Math.cos( _y );
  var cZ = Math.cos( _z );
  var sX = Math.sin( _x );
  var sY = Math.sin( _y );
  var sZ = Math.sin( _z );

  //
  // ZXY rotation matrix construction.
  //

  var m11 = cZ * cY - sZ * sX * sY;
  var m12 = - cX * sZ;
  var m13 = cY * sZ * sX + cZ * sY;

  var m21 = cY * sZ + cZ * sX * sY;
  var m22 = cZ * cX;
  var m23 = sZ * sY - cZ * cY * sX;

  var m31 = - cX * sY;
  var m32 = sX;
  var m33 = cX * cY;

  return [
    m11,    m12,    m13, 0,
    m21,    m22,    m23, 0,
    m31,    m32,    m33, 0,
    0,      0,      0,   1
  ];
}

function matFromScreen( screenOrientation ) {
  var d2r = Math.PI / 180;

	var orientationAngle = screenOrientation ? screenOrientation * d2r : 0;

	var cA = Math.cos( orientationAngle );
	var sA = Math.sin( orientationAngle );

	// Construct our screen transformation matrix
	var r_s = [
		cA,    -sA,    0,  0,
		sA,    cA,     0,  0,
		0,     0,      1,  0,
    0,     0,      0,  1
	];

	return r_s;
}


var degToRad = function (degrees) {
	var degreeToRadiansFactor = Math.PI / 180;
	return degrees * degreeToRadiansFactor;
}

// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/
var _matToEuler = function(mat) {
  var x = Math.atan2(-mat[2],mat[0]);
  var y = Math.atan2(-mat[9],mat[5]);
  var z = Math.asin(mat[1]);
  return [x,y,z];
}

VRRotMath = function() {
  this.timer = 0.0;
  this.gyroToMat = function(_alpha, _beta, _gamma, _orientation, _offset) {

    // based on: https://dev.opera.com/articles/w3c-device-orientation-usage/
    var orientMat = matFromOrient(_alpha, _beta, _gamma);
    var screenMat = matFromScreen(-_orientation);

    var outMat = twgl.m4.multiply(orientMat, screenMat);

    // var pt = twgl.m4.transformPoint(outMat, [1,0,0]);
    // document.getElementById("log").innerHTML = Math.floor(pt[0]*10) + "," + Math.floor(pt[1]*10) + "," + Math.floor(pt[2]*10);

    // fix yaw
    twgl.m4.rotateZ(outMat,-Math.PI/2 + _offset,outMat);
    return outMat;
// /// TEST
//     var euler = this.matToEuler(outMat);
//     var yaw = (euler[0] + 1.5*Math.PI)%(Math.PI*2) - Math.PI; // z
//     var pitch = euler[2]; // -y
//
//     // document.getElementById("log").innerHTML = Math.floor(180*yaw/Math.PI) + "," +
//     //                                            Math.floor(180*pitch/Math.PI);
//
//     var cameraMatrix = twgl.m4.identity();
//
//     twgl.m4.rotateX(cameraMatrix, Math.PI/2, cameraMatrix);
//     twgl.m4.rotateZ(cameraMatrix, Math.PI/2, cameraMatrix);
//     twgl.m4.rotateX(cameraMatrix, Math.PI, cameraMatrix);
//
//     //roll
//     //twgl.m4.rotateX(cameraMatrix, this.eulerX, cameraMatrix);
//     //pitch
//     twgl.m4.rotateY(cameraMatrix, -pitch, cameraMatrix);
//     //yaw
//     twgl.m4.rotateZ(cameraMatrix, yaw, cameraMatrix);
//
//     return cameraMatrix;
  }

  this.matToEuler = function(mat) {
    return _matToEuler(mat);
  }
}

module.exports = VRRotMath;
