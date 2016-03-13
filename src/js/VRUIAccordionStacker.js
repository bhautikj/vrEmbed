var VRUIAccordion = require('./VRUIAccordion.js');

VRUIAccordionStacker = function() {
  var self = this;
  this.accordions = [];
  this.active = null;

  this.add = function(name) {
    var accordion = new VRUIAccordion();
    accordion.init(self, name);
    self.accordions.push([name,accordion]);
  }

  this.showNamed = function(name) {
    // hide everything except named
    for (i = 0; i < self.accordions.length; i++) {
      if (name == self.accordions[i][0]) {
        self.active = name;
        self.accordions[i][1].show(true);
      } else {
        self.accordions[i][1].show(false);
      }
    }
  }

  this.toggle = function(name) {
    // cant turn self off - quit!
    if (self.active == name)
      return;
    self.showNamed(name);
  }

  this.totalHide = function(name, doit) {
    for (i = 0; i < self.accordions.length; i++) {
      if (name == self.accordions[i][0]) {
        self.accordions[i][1].totalHide(doit);
        return;
      }
    }
  }
}

module.exports = VRUIAccordionStacker;
