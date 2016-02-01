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

// create quaternion from euler, YXZ order
var setFromEulerYXZ = function (_x, _y, _z) {
  var c1 = Math.cos( _x / 2 );
	var c2 = Math.cos( _y / 2 );
	var c3 = Math.cos( _z / 2 );
	var s1 = Math.sin( _x / 2 );
	var s2 = Math.sin( _y / 2 );
	var s3 = Math.sin( _z / 2 );

	var x = s1 * c2 * c3 + c1 * s2 * s3;
	var y = c1 * s2 * c3 - s1 * c2 * s3;
	var z = c1 * c2 * s3 - s1 * s2 * c3;
	var w = c1 * c2 * c3 + s1 * s2 * s3;

  return [x,y,z,w];
}

function getQuaternion( alpha, beta, gamma ) {
  var d2r = Math.PI / 180;

  var _x = beta  ? beta  * d2r : 0; // beta value
  var _y = gamma ? gamma * d2r : 0; // gamma value
  var _z = alpha ? alpha * d2r : 0; // alpha value

  var cX = Math.cos( _x/2 );
  var cY = Math.cos( _y/2 );
  var cZ = Math.cos( _z/2 );
  var sX = Math.sin( _x/2 );
  var sY = Math.sin( _y/2 );
  var sZ = Math.sin( _z/2 );

  //
  // ZXY quaternion construction.
  //

  var w = cX * cY * cZ - sX * sY * sZ;
  var x = sX * cY * cZ - cX * sY * sZ;
  var y = cX * sY * cZ + sX * cY * sZ;
  var z = cX * cY * sZ + sX * sY * cZ;

  return [x,y,z,w];
  //return [ w, x, y, z ];
}


var makeRotationMatrixFromQuaternion = function ( q ) {
	var te = [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];

	var x = q[0], y = q[1], z = q[2], w = q[3];
	var x2 = x + x, y2 = y + y, z2 = z + z;
	var xx = x * x2, xy = x * y2, xz = x * z2;
	var yy = y * y2, yz = y * z2, zz = z * z2;
	var wx = w * x2, wy = w * y2, wz = w * z2;

	te[ 0 ] = 1 - ( yy + zz );
	te[ 4 ] = xy - wz;
	te[ 8 ] = xz + wy;

	te[ 1 ] = xy + wz;
	te[ 5 ] = 1 - ( xx + zz );
	te[ 9 ] = yz - wx;

	te[ 2 ] = xz - wy;
	te[ 6 ] = yz + wx;
	te[ 10 ] = 1 - ( xx + yy );

	// last column
	te[ 3 ] = 0;
	te[ 7 ] = 0;
	te[ 11 ] = 0;

	// bottom row
	te[ 12 ] = 0;
	te[ 13 ] = 0;
	te[ 14 ] = 0;
	te[ 15 ] = 1;

	return te;
}

var multiplyQuat = function(a, b) {
  var result = [];
  var qax = a[0], qay = a[1], qaz = a[2], qaw = a[3];
  var qbx = b[0], qby = b[1], qbz = b[2], qbw = b[3];

  result[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  result[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  result[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  result[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
  return result;
}

var degToRad = function (degrees) {
	var degreeToRadiansFactor = Math.PI / 180;
	return degrees * degreeToRadiansFactor;
}

var quatIdentity = function () {
	return [0.,0.,0.,1.];
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
  this.gyroToMat = function(_alpha, _beta, _gamma, _orientation) {
    document.getElementById("log").innerHTML = Math.floor(_orientation);

    var orientMat = matFromOrient(_alpha, _beta, _gamma);
    var screenMat = matFromScreen(-_orientation);

    var outMat = twgl.m4.multiply(orientMat, screenMat);

    twgl.m4.rotateZ(outMat,-Math.PI/2,outMat);
    twgl.m4.rotateX(outMat,Math.PI,outMat);

    return outMat;
  }

  this._gyroToMat = function(_alpha, _beta, _gamma, _orientation) {
    // document.getElementById("log").innerHTML = "PING";

    // Rotation around the z-axis.
    var alpha = degToRad(_alpha);
    // Front-to-back (in portrait) rotation (x-axis).
    var beta = degToRad(_beta);
    // Left to right (in portrait) rotation (y-axis).
    var gamma = degToRad(_gamma);
    var orient = degToRad(_orientation);

    // Inspired by
    // https://github.com/richtr/threeVR/blob/master/js/DeviceOrientationController.js
    var tmpQuaternion = setFromEulerYXZ(beta, alpha, -gamma);
    var minusHalfAngle = -orient / 2;
    var screenTransform = [0, Math.sin(minusHalfAngle), 0, Math.cos(minusHalfAngle)];
    var worldTransform = [-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)];
    var finalQuaternion = quatIdentity();
    finalQuaternion = multiplyQuat(finalQuaternion, tmpQuaternion);
    finalQuaternion = multiplyQuat(finalQuaternion, screenTransform);
    finalQuaternion = multiplyQuat(finalQuaternion, worldTransform);

    //flip some axes yo
    finalQuaternion[0] = -1.*finalQuaternion[0];
    finalQuaternion[1] = 1.*finalQuaternion[1];
    finalQuaternion[2] = -1.*finalQuaternion[2];
    finalQuaternion[3] = 1.*finalQuaternion[3];

    var outMat = makeRotationMatrixFromQuaternion(finalQuaternion);
    twgl.m4.transpose(outMat,outMat);

    twgl.m4.rotateX(outMat,Math.PI/2,outMat);
    twgl.m4.rotateZ(outMat,Math.PI/2,outMat);

    // X-axis: roll
    // Z-axis: definitely pitch

    // document.getElementById("log").innerHTML = Math.floor(180*roll/Math.PI);

    return outMat;
  }

  this.matToEuler = function(mat) {
    return _matToEuler(mat);
  }
}

module.exports = VRRotMath;
