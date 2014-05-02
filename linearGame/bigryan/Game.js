goog.provide('bigryan.Game');

goog.require('bigryan.Canvas');
goog.require('bigryan.Direction');
goog.require('bigryan.Ego');
goog.require('bigryan.Maze');
goog.require('bigryan.MazeLogic');
goog.require('bigryan.Monsters');

goog.require('goog.events.EventHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.Timer');

/**
 * @param {=number} opt_timeout A timeout in seconds
 * @param {=function} opt_timeoutCallback A callback
 * @constructor
 */
bigryan.Game = function(opt_timeout, opt_timeoutCallback) {

  /**
   * @type {bigryan.Canvas}
   * @private
   */
  this.canvas_ = new bigryan.Canvas();

  
  /**
   * @type {bigryan.Monsters}
   * @private
   */
  this.monsters_ = new bigryan.Monsters();


  /**
   * @type {bigryan.Maze}
   * @private
   */
  this.maze_ = new bigryan.Maze();


  /**
   * All logic in decision making for monsters and maze.
   * @type {bigryan.MazeLogic}
   * @private
   */
  this.mazeLogic_ = new bigryan.MazeLogic(this.maze_, this.monsters_);

 
  this.keyboardEventHandler_ = new goog.events.EventHandler(this);
  
  /**
   * @type {goog.Timer}
   * @private
   */
  this.gameTimer_ = new goog.Timer(500);
  
  /**
   * @private {bigryan.Ego}
   */
  this.ego_ = new bigryan.Ego(Math.floor(bigryan.Constants.mapWidth / 2),
    Math.floor(bigryan.Constants.mapHeight / 2));

  /**
   * @private {function}
   */
  this.timeoutCallback_ = opt_timeoutCallback;
  
  /**
   * @private {number}
   */
  this.timeout_ = opt_timeout; 
  
  /**
   * @private {number}
   */
  this.startTime_ = (new Date()).getTime();
   
  this.init_();
};


/**
 * @private
 */
bigryan.Game.prototype.init_ = function() {
  // This should be done with domHelper
  var canvasWrapper = document.getElementById('canvas');
  this.keyboardEventHandler_.listen(canvasWrapper, goog.events.EventType.KEYDOWN,
      this.keyListener_);
  this.buildNewMaze_();

  this.gameTimer_.listen(goog.Timer.TICK, goog.bind(this.updateTimer_, this));
  this.gameTimer_.start();
};


bigryan.Game.prototype.buildNewMaze_ = function() {
  this.mazeLogic_.generateMaze();
  this.mazeLogic_.addMonsters(10);
  this.drawAll_();
};

/**
 * This is the main game timer that moves monsters 
 */
bigryan.Game.prototype.updateTimer_ = function() {
  if (!this.mazeLogic_.hasMonsters()) {
    // no monsters, the game is won
    this.gameTimer_.stop();
    this.buildNewMaze_();
    this.gameTimer_.start();
    return; // do nothing on new maze built
  };
  this.mazeLogic_.moveAllMonsters(this.ego_);
  this.drawAll_();
  if (this.mazeLogic_.containsMonster(this.ego_.getX(), this.ego_.getY())) {
    this.playerDies_();
  }
  
};


bigryan.Game.prototype.drawAll_ = function() {
  this.maze_.draw(this.canvas_);
  this.monsters_.draw(this.canvas_);
  this.ego_.draw(this.canvas_);
  this.drawTimeout_();
};


/**
 * Draws the timeout in the bottom right corner.
 */
bigryan.Game.prototype.drawTimeout_ = function() {
  if (!goog.isDefAndNotNull(this.timeout_)) {
    return;
  }
  var elapsed = ((new Date).getTime() - this.startTime_) / 1000;
  var remaining = this.timeout_ - elapsed;
  var context = this.canvas_.getContext();
  context.font = 'bold 26px Arial';
  context.fillStyle = '#FFFFFF';
  context.fillText(Math.floor(remaining), 25, 25);
  if (remaining < 0 && goog.isDefAndNotNull(this.timeoutCallback_)) {
    this.timeoutCallback_();
    // only call once
    this.timeoutCallback_ = null;
    this.timeout_ = null;
  }
};

/**
 * @param {bigryan.Direction} direction
 */
bigryan.Game.prototype.moveIfPossible_ = function(direction) {
  if (this.mazeLogic_.pushBlock(direction, this.ego_.getX(), this.ego_.getY())) {
    this.ego_.move(direction);
  }
  if (this.mazeLogic_.containsMonster(this.ego_.getX(), this.ego_.getY())) {
    this.playerDies_();
  }
}

bigryan.Game.prototype.playerDies_ = function() {
  /// maybe show some death thing of some sort?
  this.mazeLogic_.removeAllMonsters();
  this.buildNewMaze_();
}

bigryan.Game.prototype.keyListener_ = function(event) {
  if (event.keyCode == goog.events.KeyCodes.RIGHT) {
    this.moveIfPossible_(bigryan.Direction.E);
  }
  if (event.keyCode == goog.events.KeyCodes.LEFT) {
    this.moveIfPossible_(bigryan.Direction.W);
  }
  if (event.keyCode == goog.events.KeyCodes.UP) {
    this.moveIfPossible_(bigryan.Direction.N);
  }
  if (event.keyCode == goog.events.KeyCodes.DOWN) {
    this.moveIfPossible_(bigryan.Direction.S);
  }
  this.drawAll_();
};

start = function() {
  var game = new bigryan.Game();
};

window['start'] = start; // similar to goog.exportSymbol
