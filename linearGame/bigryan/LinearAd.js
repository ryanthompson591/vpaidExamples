goog.provide('bigryan');
goog.provide('bigryan.LinearAd');

goog.require('bigryan.Constants');
goog.require('bigryan.Game');

/**
 * @constructor
 */
bigryan.LinearAd = function() { 
  /**
   * @private {Element}
   */
  this.slot_ = null; 
 
 /**
  * @private {Element}
  */
  this.videoSlot_ = null; 
  
 /**
  * @private {!object}
  */
  this.callBacks_ = {};
};

/**
 * Initializes ad
 */
bigryan.LinearAd.prototype.initAd = function(width, height, viewMode, desiredBitrate, 
  creativeData, environmentVars) { 
  // slot and videoSlot are passed as part of the environmentVars 
  this.slot_ = environmentVars['slot']; 
  this.videoSlot_ = environmentVars['videoSlot'];
  
  var params = creativeData['AdParameters'];

  // REPLACE IMAGES
  var data = JSON.parse(params);
  if (goog.isDefAndNotNull(data.ego)) {
    bigryan.Constants.egoImg = data.ego;
  }
  if (goog.isDefAndNotNull(data.monster)) {
    bigryan.Constants.monsterImg = data.monster;
  }
  if (goog.isDefAndNotNull(data.mountain)) {
    bigryan.Constants.mountainImg = data.mountain;
  }
  if (goog.isDefAndNotNull(data.block)) {
    bigryan.Constants.blockImg = data.block;
  }




  // add a canvas element to the slot
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.tabIndex = 1;
  canvas.height = height;
  canvas.width = width;
  this.slot_.appendChild(canvas);
  
  bigryan.Constants.mapWidth = Math.floor(width / bigryan.Constants.BLOCKSIZE);
  bigryan.Constants.mapHeight = Math.floor(height / bigryan.Constants.BLOCKSIZE);

  //Lets make a max height/width just to not get crazy
  if (bigryan.Constants.mapWidth > 40) bigryan.Constants.mapWidth = 40;
  if (bigryan.Constants.mapHeight > 40) bigryan.Constants.mapHeight = 40;

  // create the canvas element that the ad expects.
  this.callBacks_['AdLoaded'].callback();
}; 
 
bigryan.LinearAd.prototype.startAd = function() { 
  var game = new bigryan.Game(20, goog.bind(this.stopAd, this));
  this.callBacks_['AdStarted'].callback();
};
 
bigryan.LinearAd.prototype.stopAd = function() { 
  this.callBacks_['AdStopped'].callback();
  console.log('Ad Stopped');
}; 

bigryan.LinearAd.prototype.setAdVolume = function(val) { 
}; 
 
bigryan.LinearAd.prototype.getAdVolume = function() { 
}; 

bigryan.LinearAd.prototype.resizeAd = function(width, height, viewMode) { 
}; 

bigryan.LinearAd.prototype.pauseAd = function() { 
};
 
bigryan.LinearAd.prototype.resumeAd = function() { 
}; 

bigryan.LinearAd.prototype.expandAd = function() { 
}; 

bigryan.LinearAd.prototype.getAdExpanded = function(val) { 
}; 
 
bigryan.LinearAd.prototype.getAdSkippableState = function(val) { 
}; 
 
bigryan.LinearAd.prototype.collapseAd = function() { 
}; 
 
bigryan.LinearAd.prototype.skipAd = function() { 
}; 

/**
 * @param {function} callback
 * @param {object} context
 * @constructor
 */
bigryan.LinearAd.CallBack = function(callback, context) {
  this.callback = callback;
  this.context = context;
};

/**
 * Callbacks for events are registered here.
 * @param {function} callback
 * @param {string} eventName
 * @param {=aContext} context
 */
bigryan.LinearAd.prototype.subscribe = function(callback, eventName, context) {
  this.callBacks_[eventName] = new bigryan.LinearAd.CallBack(callback, context || null);
}; 

// Callbacks are removed based on the eventName 
bigryan.LinearAd.prototype.unsubscribe = function(eventName) { 
};

/**
 * @param {string} version The VPAID version.
 * @return {string}
 */
bigryan.LinearAd.prototype.handshakeVersion = function(version) { 
return '2.0';
};
 
getVPAIDAd = function() { 
 return new bigryan.LinearAd(); 
};

bigryan.LinearAd.prototype['initAd'] = bigryan.LinearAd.prototype.initAd;
bigryan.LinearAd.prototype['startAd'] = bigryan.LinearAd.prototype.startAd;
bigryan.LinearAd.prototype['stopAd'] = bigryan.LinearAd.prototype.stopAd;
bigryan.LinearAd.prototype['setAdVolume'] = bigryan.LinearAd.prototype.setAdVolume;
bigryan.LinearAd.prototype['getAdVolume'] = bigryan.LinearAd.prototype.getAdVolume;
bigryan.LinearAd.prototype['resizeAd'] = bigryan.LinearAd.prototype.resizeAd;
bigryan.LinearAd.prototype['pauseAd'] = bigryan.LinearAd.prototype.pauseAd;
bigryan.LinearAd.prototype['resumeAd'] = bigryan.LinearAd.prototype.resumeAd;
bigryan.LinearAd.prototype['expandAd'] = bigryan.LinearAd.prototype.expandAd;
bigryan.LinearAd.prototype['getAdExpanded'] = bigryan.LinearAd.prototype.getAdExpanded;
bigryan.LinearAd.prototype['getAdSkippableState'] = bigryan.LinearAd.prototype.getAdSkippableState;
bigryan.LinearAd.prototype['collapseAd'] = bigryan.LinearAd.prototype.collapseAd;
bigryan.LinearAd.prototype['skipAd'] = bigryan.LinearAd.prototype.skipAd;
bigryan.LinearAd.prototype['subscribe'] = bigryan.LinearAd.prototype.subscribe;
bigryan.LinearAd.prototype['unsubscribe'] = bigryan.LinearAd.prototype.unsubscribe;
bigryan.LinearAd.prototype['handshakeVersion'] = bigryan.LinearAd.prototype.handshakeVersion;
window['getVPAIDAd'] = getVPAIDAd;