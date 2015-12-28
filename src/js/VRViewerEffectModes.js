/**
  Copyright 2015 Bhautik J Joshi

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/

var THREE = require('../js-ext/three.js');

// 0  (00): one viewport, no anaglyph
// 2  (10): two viewports, no anaglyph
// 1  (01): one viewport, anaglyph

THREE.VRViewerEffectModes = {
  ONE_VIEWPORT: 0,
  ANAGLYPH: 1,
  TWO_VIEWPORTS: 2
};

module.exports = THREE.VRViewerEffectModes;
