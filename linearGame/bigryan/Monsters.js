goog.provide('bigryan.Monsters');


goog.require('bigryan.Monster');
goog.require('goog.array');

/**
 * All the monsters in the maze.
 * @constructor
 */
bigryan.Monsters = function() {
  this.monsters_ = [];
};


/**
 * @param {bigryan.Monster} monster
 */
bigryan.Monsters.prototype.add = function(monster) {
  this.monsters_.push(monster);
};


/**
 * @return {number}
 */
bigryan.Monsters.prototype.length = function() {
  return this.monsters_.length;
};


/**
 * @param {number} i
 * @return {bigryan.Monster}
 */
bigryan.Monsters.prototype.get = function(i) {
  return this.monsters_[i];
};

/**
 * @param {bigryan.Monster} monster
 */
bigryan.Monsters.prototype.remove = function(monster) {
  goog.array.remove(this.monsters_, monster);
};


/**
 *
 */
bigryan.Monsters.prototype.draw = function(canvas) {
  goog.array.forEach(this.monsters_, function(monster) {
    monster.draw(canvas);
  }, this);
};