#!/bin/sh

# cat src/js-ext/three.js | uglifyjs -cm > bin/three.min.js


browserify   src/vr-bundle-main.js > bin/vr-bundle.js