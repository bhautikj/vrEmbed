#!/bin/sh


browserify -t [ exposify --expose [ --three THREE ] ] src/vr-bundle-main.js > bin/vrEmbed.js

cat bin/vrEmbed.js | uglifyjs -cm > vrEmbed.min.js
