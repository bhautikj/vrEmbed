#!/bin/sh

# cat src/js-ext/three.js | uglifyjs -cm > bin/three.min.js

browserify -t [ exposify --expose [ --three THREE ] ] src/vr-bundle-main.js > bin/vr-bundle.js