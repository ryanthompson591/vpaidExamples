goog.provide('bigryan.Canvas');

/**
 * @constructor
 */
bigryan.Canvas = function() {
  /**
   * @type {Object}
   * @private
   */
  this.context_ = document.getElementById('canvas').getContext('2d');
  document.getElementById('canvas').height = bigryan.Constants.mapHeight * bigryan.Constants.BLOCKSIZE;
  document.getElementById('canvas').width = bigryan.Constants.mapWidth * bigryan.Constants.BLOCKSIZE;
};


/**
 * @return element
 */
bigryan.Canvas.prototype.setContext = function() {
  return this.context_;
};


/**
 * @return element
 */
bigryan.Canvas.prototype.getContext = function() {
  return this.context_;
};