twgl = require('../js-ext/twgl-full.js');

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



VRRotMath = function() {
  this.gyroToMat = function(_alpha, _beta, _gamma, _orientation) {
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
    var tmpQuaternion = setFromEulerYXZ(beta, alpha, -1.0*gamma);
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

    return outMat;
  }
}

module.exports = VRRotMath;