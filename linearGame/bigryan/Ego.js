goog.provide('bigryan.Ego');

goog.require('bigryan.Constants');
goog.require('bigryan.Sprite');

/**
 * @constructor
 */
bigryan.Ego = function(x ,y) {

  /**
   * @type {number}
   * @private
   */
  this.x_ = x;
  
  /**
   * @type {number}
   * @private
   */
  this.y_ = y;
};


bigryan.Ego.sprite_ = new bigryan.Sprite(bigryan.Constants.egoImg);

/**
 * @return {number}
 */
bigryan.Ego.prototype.getX = function() {
  return this.x_;
};


/**
 * @return {number}
 */
bigryan.Ego.prototype.getY = function() {
  return this.y_;
};

/**
 * Moves in the given direction.
 * @param {!bigryan.Direction} direction
 */
bigryan.Ego.prototype.move = function(direction) {
  switch (direction) {
    case bigryan.Direction.N:
      this.y_ = this.y_ - 1;
      break;
    case bigryan.Direction.S:
      this.y_ = this.y_  + 1;
      break;
    case bigryan.Direction.E:
      this.x_ = this.x_ + 1;
      break;
    case bigryan.Direction.W:
      this.x_ = this.x_ - 1;
      break;
  }
};

/**
 * @param {bigryan.Canvas}
 */
bigryan.Ego.prototype.draw = function(canvas) {
  bigryan.Ego.sprite_.draw(canvas, this.getX() * bigryan.Constants.BLOCKSIZE,
     this.getY() * bigryan.Constants.BLOCKSIZE);
};
