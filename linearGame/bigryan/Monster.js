goog.provide('bigryan.Monster');

goog.require('bigryan.Constants');
goog.require('bigryan.Sprite');

/**
 * @constructor
 */
bigryan.Monster = function(x, y) {
  /**
   * @type {number}
   */
  this.x_ = x;
  
  /**
   * @type {number}
   */
  this.y_ = y;
};


bigryan.Monster.sprite_ = new bigryan.Sprite(bigryan.Constants.monsterImg);

bigryan.Monster.prototype.getX = function() {
  return this.x_;
}

bigryan.Monster.prototype.getY = function() {
  return this.y_;
}

/**
 * Moves in the given direction.
 * @param {!bigryan.Direction} direction
 */
bigryan.Monster.prototype.move = function(direction) {
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

bigryan.Monster.prototype.draw = function(canvas) {
  bigryan.Monster.sprite_.draw(canvas, this.getX() * bigryan.Constants.BLOCKSIZE, this.getY() * bigryan.Constants.BLOCKSIZE);
};
