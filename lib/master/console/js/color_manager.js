/* Color Manager for UI status lights
 * Styles defined in css/colors.css
 */

var MAX_COLORS = 20;

var ColorManager = function() {
  this.available = [];
  for (var i=MAX_COLORS; i>0; i--) {
    this.available.push(i);
  }
  this.next = function() {
    if (!this.available.length) {
      throw "No more colors available";
    }
    return this.available.pop();
  }
  this.release = function(i) {
    if (i == null) return; // just in case
    this.available.push(parseInt(i));
  }
}

try {
  module.exports = {
    ColorManager: ColorManager
  }
} catch(err) {}
