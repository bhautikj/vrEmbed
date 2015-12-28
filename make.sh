#!/bin/sh


browserify -t [ exposify --expose [ --three THREE ] ] src/js/main.js > bin/vrEmbed.js

cat bin/vrEmbed.js | uglifyjs -cm > vrEmbed.min.js
