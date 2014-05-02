goog.provide('bigryan.Maze');

goog.require('bigryan.Constants');
goog.require('bigryan.Monster');
goog.require('bigryan.Sprite');
goog.require('bigryan.Terrain');

goog.require('goog.array');
/**
 * @constructor
 */
bigryan.Maze = function() {
  
  
  this.map_ = new Array(bigryan.Constants.mapHeight * bigryan.Constants.mapWidth);
  
  this.monsters_ = [];

  this.sprite_ = [];
  this.sprite_[bigryan.Terrain.BLOCK] = new bigryan.Sprite(bigryan.Constants.blockImg);
  this.sprite_[bigryan.Terrain.WALL] = new bigryan.Sprite(bigryan.Constants.mountainImg);
};


/**
 * @param x {number}
 * @param y {number}
 * @return someEnum
 */
bigryan.Maze.prototype.getElemAt = function(x, y) {
  return this.map_[y * bigryan.Constants.mapWidth + x];
};

/**
 * @param x {number}
 * @param y {number}
 * @param type {bigryan.Terrain}
 */
bigryan.Maze.prototype.setElemAt = function(x, y, type) {
  this.map_[y * bigryan.Constants.mapWidth + x] = type;
};


/**
 * return true if empty
 * @param x {number}
 * @param y {number}
 * @return {boolean}
 */
bigryan.Maze.prototype.isEmpty = function(x, y) {
  if (this.getElemAt(x, y) == bigryan.Terrain.EMPTY) {
    return true;
  }
  return false;
};


/**
 * Draws the entire maze onto the context
 * 
 * @param {element} canvas
 */
bigryan.Maze.prototype.draw = function(canvas) {
  var context = canvas.getContext();
  var b = bigryan.Constants.BLOCKSIZE;
  for (var x =0; x < bigryan.Constants.mapWidth ; x++ ) {
    for (var y=0; y < bigryan.Constants.mapHeight; y++) {
      var type = this.getElemAt(x,y);
      if (type == bigryan.Terrain.EMPTY) {
        context.fillStyle = '#000';
        context.fillRect(x*b, y*b, b, b);
      }
      else if (type == bigryan.Terrain.WALL) {
        this.sprite_[bigryan.Terrain.WALL].draw(canvas, x*b, y*b);
      } else if (type == bigryan.Terrain.BLOCK) {
        this.sprite_[bigryan.Terrain.BLOCK].draw(canvas, x*b, y*b);
      }
    }
  }
};


/**
 * @return {Array.<Object>}
 **/
bigryan.Maze.prototype.getAllEmpty = function() {
  var allEmpty = [];
  for (var x =0; x < bigryan.Constants.mapWidth ; x++ ) {
    for (var y=0; y < bigryan.Constants.mapHeight; y++) {
      if (this.getElemAt(x,y) == bigryan.Terrain.EMPTY) {
        allEmpty.push([x,y]);
     }
    }
  }
  return allEmpty;
};
