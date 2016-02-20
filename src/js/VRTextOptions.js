/**
  Copyright 2016 Bhautik J Joshi

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

VRTextOptions = function () {
  this.align = null;
  this.fontface = null;
  this.fontsize = null;
  this.borderThickness = null;
  this.borderColor = null;
  this.backgroundColor = null;
  this.textColor = null;

  this.init = function(elm) {
    this.align = elm.getAttribute("align");
    this.fontface = elm.getAttribute("fontface");
    this.fontsize = elm.getAttribute("fontsize");
    this.borderThickness = elm.getAttribute("borderthickness");
    this.borderColor = elm.getAttribute("bordercolor");
    this.backgroundColor = elm.getAttribute("backgroundcolor");
    this.textColor = elm.getAttribute("textcolor");
  }

  this.setElement = function(elm) {
    if (this.align!=null)
      elm.setAttribute("align", this.align);

    if (this.fontface!=null)
      elm.setAttribute("fontface", this.fontface);

    if (this.fontsize!=null)
      elm.setAttribute("fontsize", this.fontsize);

    if (this.borderThickness!=null)
      elm.setAttribute("borderthickness", this.borderThickness);

    if (this.borderColor!=null)
      elm.setAttribute("bordercolor", this.borderColor);

    if (this.backgroundColor!=null)
      elm.setAttribute("backgroundcolor", this.backgroundColor);

    if (this.textColor!=null)
      elm.setAttribute("textcolor", this.textColor);
  }

};

module.exports = VRTextOptions;
