goog.provide('bigryan.Sprite');


/**
 * @constructor
 */
bigryan.Sprite = function(url) {

  this.img = new Image();
  this.img.src = url;

};

/**
 * @param {Canvas} c
 * @param {number} x
 * @param {number} y
 */
bigryan.Sprite.prototype.draw = function(c, x ,y) {
  c.getContext().drawImage(this.img, x, y);
};
