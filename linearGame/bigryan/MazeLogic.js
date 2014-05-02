goog.provide('bigryan.MazeLogic');

goog.require('bigryan.Maze');
goog.require('bigryan.PathFinder');

/**
 * All logic associated with movement of blocks and monsters.
 * @param {bigryan.Maze} maze
 * @param {bigryan.Monsters} monsters
 * @constructor
 */
bigryan.MazeLogic = function(maze, monsters) {
  /**
   * @type {bigryan.Maze}
   * @private
   */
  this.maze_ = maze;

  /**
   * @type {bigryan.Monsters}
   * @private
   */
   this.monsters_ = monsters;
}


/**
 * Pushes the block in the requested direction, if no block or the block is blocked no-op
 * returns true if the block can be pushed
 * 
 * @param direction {bigryan.Direction}
 * @param x {number}
 * @param y {number}
 * @return boolean
 */
bigryan.MazeLogic.prototype.pushBlock = function(direction, x, y) {
  if (!this.canPush_(direction, x, y)) {
    return false;
  }
  var toSwitch = bigryan.Terrain.EMPTY;  //first push an empty spot to where we go
  while (1) {
    switch (direction) {
      case bigryan.Direction.N:
        y -= 1;
        break;
      case bigryan.Direction.S:
        y +=1;
        break;
      case bigryan.Direction.E:
        x+=1;
        break;
      case bigryan.Direction.W:
        x-=1;
        break;
    }
    var done = false;
    if (this.maze_.getElemAt(x,y) == bigryan.Terrain.EMPTY) {
      done = true;
      if (toSwitch == bigryan.Terrain.BLOCK) {
        //push or squish any monsters that were in this empty spot
        this.pushMonster_(direction, x, y);
      }
    }
    this.maze_.setElemAt(x,y, toSwitch);
    toSwitch = bigryan.Terrain.BLOCK;
    if (done) {
      break;
    }
  }
  return true;
};


/**
 * determines if even possible to push in a direction.
 */
bigryan.MazeLogic.prototype.canPush_ = function(direction, x, y) { 
  while (1) {
    switch (direction) {
      case bigryan.Direction.N:
        y -= 1;
        break;
      case bigryan.Direction.S:
        y += 1;
        break;
      case bigryan.Direction.E:
        x+=1;
        break;
      case bigryan.Direction.W:
        x-=1;
        break;
    }
    if (x < 0 || y <0 || x >= bigryan.Constants.mapWidth || y >= bigryan.Constants.mapHeight) {
      return false;
    }
    var elem = this.maze_.getElemAt(x,y);
    if (elem == bigryan.Terrain.WALL) {
      return false;
    }
    if (elem == bigryan.Terrain.EMPTY) {
      return true;
    }
  }
};



/**
 * Determines if there is a monter in the square, and pushes him or squishes him.
 */
bigryan.MazeLogic.prototype.pushMonster_ = function(direction, x, y) { 
  var monstersInSpace = [];
  for (var i=0; i < this.monsters_.length(); i++) {
    var m = this.monsters_.get(i);
    if(m.getX() == x && m.getY() == y) {
      // I'm allowing multiple monsters in the same spot
      monstersInSpace.push(m);
    }
  }
  if (goog.array.isEmpty(monstersInSpace)) {
    // no monsters to worry about
    return;
  }
  var isSplat = false;
  switch (direction) {
      case bigryan.Direction.N:
        y -= 1;
        break;
      case bigryan.Direction.S:
        y += 1;
        break;
      case bigryan.Direction.E:
        x+=1;
        break;
      case bigryan.Direction.W:
        x-=1;
        break;
  }
  if (x<0 || y<0 || x >= bigryan.Constants.mapWidth || y >= bigryan.Constants.mapHeight) {
    isSplat = true;
  }
  else if (this.maze_.getElemAt(x,y) != bigryan.Terrain.EMPTY) {
    isSplat = true;
  }
  if (isSplat) {
    //remove all monsters
    for (var i in monstersInSpace) {
      this.monsters_.remove(monstersInSpace[i]);
    }
  } else {
    for (var i in monstersInSpace) {
      monstersInSpace[i].move(direction);
    }
  }
}


/**
 * Generates a random maze.
 * 
 */
bigryan.MazeLogic.prototype.generateMaze = function() {
  for (var x =0; x < bigryan.Constants.mapWidth ; x++ ) {
    for (var y=0; y < bigryan.Constants.mapHeight; y++) {
      var r = Math.random();
      var type = r < 7/10 ? bigryan.Terrain.EMPTY : r <97/100 ? bigryan.Terrain.BLOCK : bigryan.Terrain.WALL;
      this.maze_.setElemAt(x, y, type);
    }
  }
};


/**
 * Adds monsters to a maze.
 * @param {number} numMonstsers Number of monsters to add to a maze.
 */
bigryan.MazeLogic.prototype.addMonsters = function(numMonsters) {
  var allEmpty = this.maze_.getAllEmpty();
  for (var i =0; i < numMonsters; i++) {
    var emptyIndex = Math.floor(Math.random() * allEmpty.length);
    var elem = allEmpty[emptyIndex];
    var monster = new bigryan.Monster(elem[0], elem[1]);
    this.monsters_.add(monster);
  }
};


bigryan.MazeLogic.prototype.removeAllMonsters = function() {
  this.monsters_ = [];
};


/**
 * @param {bigryan.Ego} ego
 * moves all the monsters in the maze in some direction
 */
bigryan.MazeLogic.prototype.moveAllMonsters = function(ego) {
  var pathFinder = new bigryan.PathFinder(this.maze_, ego.getX(), ego.getY());
  for (var i =0; i < this.monsters_.length(); i++) {
    this.moveMonster_(this.monsters_.get(i), pathFinder);
  }
};

/**
 * Moves one monster
 * @private
 */
bigryan.MazeLogic.prototype.moveMonster_ = function(monster, pathFinder) {
    var x = monster.getX();
    var y = monster.getY();
    var direction = pathFinder.getDirection(this.maze_, x, y);
    switch (direction) {
      case bigryan.Direction.N:
        y -= 1;
        break;
      case bigryan.Direction.S:
        y += 1;
        break;
      case bigryan.Direction.E:
        x+=1;
        break;
      case bigryan.Direction.W:
        x-=1;
        break;
    }
    if (x >= 0 
        && x < bigryan.Constants.mapWidth 
        && y >= 0 
        && y < bigryan.Constants.mapHeight 
        && this.maze_.getElemAt(x, y) == bigryan.Terrain.EMPTY) {
      monster.move(direction);
    }
}


/**
 * @return {Boolean} true if there are monsters present false if not.
 */
bigryan.MazeLogic.prototype.hasMonsters = function() {
  if (this.monsters_.length == 0) {
    return false;
  }
  return true;
};


/**
 * @param {number} x
 * @param {number} y
 * @return {Boolean} true if there is a monster in this space
 */
bigryan.MazeLogic.prototype.containsMonster = function(x, y) {
  for (var i =0; i < this.monsters_.length; i++) {
    var monster = this.monsters_.get(i);
    if (monster.getX() == x && monster.getY() == y) {
      return true;
    }
  }
  return false;
};


/**
 * @return {bigryan.Direction}
 */
bigryan.MazeLogic.prototype.getRandomDirection_ = function() {
    var direction = Math.floor(Math.random() * 4);
    switch(direction) {
      case 0:
        return bigryan.Direction.N;
      case 1:
        return bigryan.Direction.S;
      case 2:
        return bigryan.Direction.E;
    }
    return bigryan.Direction.W;
};

