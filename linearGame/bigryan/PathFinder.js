goog.provide('bigryan.PathFinder');

goog.require('bigryan.Maze');
goog.require('bigryan.Constants');

goog.require('goog.Timer');
goog.require('goog.array');


/**
 * @param {bigryan.Maze} maze
 * @param {number} egoX
 * @param {number} egoY
 * @constructor
 */
bigryan.PathFinder = function(maze, egoX, egoY) {
  this.path_ = Array(bigryan.Constants.mapWidth);
  for (var x =0 ; x< bigryan.Constants.mapWidth; x++) {
    this.path_[x] = Array(bigryan.Constants.mapHeight);
  }
  this.runPathFinderAlgo_(maze, egoX, egoY,  50);  //50 ms timeout? 
};


/**
 * @private
 */
bigryan.PathFinder.prototype.runPathFinderAlgo_ = function(maze, egoX, egoY, timeout) {
  var start = goog.now();
  var locs = [[egoX, egoY]];
  var steps = 0;
  this.path_[egoX][egoY] = steps;

  while (locs.length !== 0 && goog.now() < start + timeout) {
    var nextLocs = [];
    goog.array.forEach(locs, function(loc) {
      this.path_[loc[0]][loc[1]] = steps;
      var allAdjacent = this.getAdjacent_(maze, loc[0], loc[1]);
      goog.array.forEach(allAdjacent, function(adj) {
        if (!goog.isDef(this.path_) || !goog.isDef(this.path_[adj[0]])) {
          console.log('this.path_ not def ' + this.toString());
        }
        if (!goog.isDefAndNotNull(this.path_[adj[0]][adj[1]])) {
          nextLocs.push(adj);
        }
      }, this);
    }, this);
    locs = nextLocs;
    steps +=1;
  }
};


bigryan.PathFinder.prototype.getAdjacent_ = function(maze, x, y) {
  var allAdj = [];
   if (x >= 1 && maze.isEmpty(x-1 ,y)) allAdj.push([x-1, y]);
   if (y >= 1 && maze.isEmpty(x, y-1)) allAdj.push([x, y-1]);
   if (x < bigryan.Constants.mapWidth - 1 && maze.isEmpty(x+1, y)) allAdj.push([x+1, y]);
   if (y < bigryan.Constants.mapHeight - 1 && maze.isEmpty(x, y+1)) allAdj.push([x, y+1]); 
   return allAdj;
};



/**
 * @return {bigryan.Direction}
 */
bigryan.PathFinder.prototype.getDirection = function(maze, x, y) {
  // you know, lets just move randomly sometimes.
  if (Math.random() < 0.3) {
    return this.getRandomDirection_();
  }
  
  var allAdj = this.getAdjacent_(maze, x, y);
  var min = 99999;
  var best = [-1, -1];

  if (!this.path_) {
     console.log('ERROR: path not defined -- remove this error?');
  }
  goog.array.forEach(allAdj, function(adj) {
    var moves = this.path_[adj[0]][adj[1]]; //number of moves
    if (goog.isDefAndNotNull(moves) && moves < min) {
      best = adj;
      min = moves;
    }
    
  }, this);
  
  if (best[0] == -1) {
    return this.getRandomDirection_();
  }

  // a monster is taking this space so lets make it less attractive
  this.path_[best[0]][best[1]] = this.path_[best[0]][best[1]] + 4;

  if (best[0] == x) {
    if (best[1] > y) {
      return bigryan.Direction.S;
    }
    else {
      return bigryan.Direction.N;
    }
  } else {
    if (best[0] > x) {
      return bigryan.Direction.E;
    }
  }
  return bigryan.Direction.W;
};


/**
 * @return {bigryan.Direction}
 */
bigryan.PathFinder.prototype.getRandomDirection_ = function() {
    var direction = Math.floor(Math.random() * 5);
    switch(direction) {
      case 0:
        return bigryan.Direction.N;
      case 1:
        return bigryan.Direction.S;
      case 2:
        return bigryan.Direction.E;
      case 3:
        return bigryan.Direction.W;
    }
    return bigryan.Direction.NONE;
};

