/**
 * @fileoverview A sample non linear VPAID ad.  Even though this is designed
 * in a way that it can be compiled by closure it does not make use of the
 * libraries.  This simplifies debugging.
 */



/**
 * A non linear VPAID ad useful for testing functionality of the sdk.
 * @constructor
 */
var VpaidNonLinear = function() {
  /**
   * The slot is the div element on the main page that the ad is supposed to
   * occupy.
   * @private {Element}
   */
  this.slot_ = null;

  /**
   * An object containing all registered events.  These events are all
   * callbacks for use by the VPAID ad.
   * @private {Object}
   */
  this.eventCallbacks_ = {};

  /**
   * A list of getable and setable attributes.
   * @private {Object}
   */
  this.attributes_ = {
    'companions' : '',
    'desiredBitrate' : 256,
    'duration' : 10,
    'expanded' : false,
    'height' : 0,
    'icons' : '',
    'linear' : false,
    'skippableState' : false,
    'viewMode' : 'normal',
    'width' : 0,
    'volume' : 50
  };

  /**
   * When the ad was started.
   * @private {number}
   */
  this.startTime_ = 0;

  /**
   * An array of urls pointing to images.
   * @private {!Array.<string>}
   */
  this.imageUrls_ = [];

  /**
   * An array of video urls and mime types.
   * @private {!Array.<!Object>}
   */
  this.videos_ = [];
};


/**
 * CSS for the image that will perform a small animation.
 */
VpaidNonLinear.IMG_CSS = '.animatedImg {\n' +
    '-webkit-animation-duration: 4s;\n' +
    '-webkit-animation-name: slidein;\n' +
    'position: absolute;\n' +
    'bottom: 5px;\n' +
    'left: 25%;\n' +
    '}\n' +
    '@-webkit-keyframes slidein {\n' +
    'from {\n' +
    'bottom: 200px;\n' +
    'left: 0%;\n' +
    '}\n' +
    'to {\n' +
    'bottom: 5px;\n' +
    'left: 25%;\n' +
    '}\n' +
    '}';


/**
 * VPAID defined init ad, initializes all attributes in the ad.  The ad will
 * not start until startAd is called.
 *
 * @param {number} width The ad width.
 * @param {number} height The ad heigth.
 * @param {string} viewMode The ad view mode.
 * @param {number} desiredBitrate The desired bitrate.
 * @param {Object} creativeData Data associated with the creative.
 * @param {Object} environmentVars Variables associated with the creative like
 *     the slot and video slot.
 */
VpaidNonLinear.prototype.initAd = function(
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
  // slot and videoSlot are passed as part of the environmentVars
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.attributes_['desiredBitrate'] = desiredBitrate;
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;
  this.videoSlot_.style = "display: none";

  var data = JSON.parse(creativeData['AdParameters']);
  this.imageUrls_ = data.overlays || [];
  this.videos_ = data.videos || [];

  this.log('initAd ' + width + 'x' + height +
      ' ' + viewMode + ' ' + desiredBitrate);
  this.invokeCallback_('AdLoaded');
};


/**
 * Helper function to update the size of the video player.
 * @private
 */
VpaidNonLinear.prototype.updateVideoPlayerSize_ = function() {
  this.videoSlot_.setAttribute('width', this.attributes_['width']);
  this.videoSlot_.setAttribute('height', this.attributes_['height']);
};


/**
 * Returns the versions of VPAID ad supported.
 * @param {string} version
 * @return {string}
 */
VpaidNonLinear.prototype.handshakeVersion = function(version) {
  return '2.0';
};


/**
 * Called when the overlay is clicked.  Increases the ad duration 10 seconds.
 * @private
 */
VpaidNonLinear.prototype.overlayOnClick_ = function() {
  this.eventCallbacks_['AdClickThru'](
      '', // optional URL
      '0',  // id of the clickThru
      true); // whether the player should handle the clickthrough event

  // Make the duration longer when a click happens.
  // This is mostly a method to test AdRemainingTimeChange behavior works.
  this.attributes_.duration += 10;
  this.invokeCallback_('AdRemainingTimeChange');
};


/**
 * Called when the second overlay is clicked.  Plays the video passed in the
 * parameters.
 * @private
 */
VpaidNonLinear.prototype.overlay2OnClick_ = function() {
  //This will turn the ad into a linear ad.
  this.attributes_.linear = true;
  this.invokeCallback_('AdLinearChange');
  // remove all elements
  while (this.slot_.firstChild) {
    this.slot_.removeChild(this.slot_.firstChild);
  }
  //start a video
  var foundSource = false;
  for (var i = 0; i < this.videos_.length; i++) {
    // Choose the first video with a supported mimetype.
    if (this.videoSlot_.canPlayType(this.videos_[i].mimetype) != '') {
      this.videoSlot_.setAttribute('src', this.videos_[i].url);
      foundSource = true;
      break;
    }
  }
  if (!foundSource) {
    // Unable to find a source video.
    this.invokeCallback_('AdError');
  }
  this.videoSlot_.addEventListener(
    'loadedmetadata',
    (function() {
      if (this.attributes_.duration != this.videoSlot_.duration) {
        this.attributes_.duration = this.videoSlot_.duration;
        this.startTime_ = new Date().getTime();
        this.timePaused_ = 0;
        this.invokeCallback_('AdDurationChange');
      }
    }).bind(this),
      false);
  this.videoSlot_.addEventListener(
      'ended',
      this.stopAd.bind(this),
      false);
  this.videoSlot_.style = "display: block";
  this.videoSlot_.play();
};


/**
 * Starts the ad.
 */
VpaidNonLinear.prototype.startAd = function() {
  this.log('Starting ad');
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = VpaidNonLinear.IMG_CSS;
  } else {
    style.appendChild(document.createTextNode(VpaidNonLinear.IMG_CSS));
  }
  this.slot_.appendChild(style);
  var date = new Date();
  this.startTime_ = date.getTime();
  this.timePaused_ = 0;
  this.lastRemainingTime_ = -1;
  this.isPaused_ = false;
  var img = document.createElement('img');
  img.src = this.imageUrls_[0] || '';
  img.classList.add('animatedImg');
  this.slot_.appendChild(img);
  img.addEventListener('click', this.overlayOnClick_.bind(this), false);

  img = document.createElement('img');
  img.src = this.imageUrls_[1] || '';
  this.slot_.appendChild(img);
  img.addEventListener('click', this.overlay2OnClick_.bind(this), false);

  this.invokeCallback_('AdStarted');
  this.invokeCallback_('AdImpression');
};


/**
 * Stops the ad.
 */
VpaidNonLinear.prototype.stopAd = function() {
  this.log('Stopping ad');
  // Calling AdStopped immediately terminates the ad. Setting a timeout allows
  // events to go through.
  var callback = this.invokeCallback_.bind(this);
  setTimeout(callback, 75, ['AdStopped']);
};


/**
 * @param {number} value The volume in percentage.
 */
VpaidNonLinear.prototype.setAdVolume = function(value) {
  this.attributes_['volume'] = value;
  this.log('setAdVolume ' + value);
  this.invokeCallback_('AdVolumeChanged');
};


/**
 * @return {number} The volume of the ad.
 */
VpaidNonLinear.prototype.getAdVolume = function() {
  this.log('getAdVolume');
  return this.attributes_['volume'];
};


/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidNonLinear.prototype.resizeAd = function(width, height, viewMode) {
  this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.updateVideoPlayerSize_();
  this.invokeCallback_('AdSizeChange');
};


/**
 * Pauses the ad.
 */
VpaidNonLinear.prototype.pauseAd = function() {
  if (!this.attributes_.linear) {
    // cannot pause a non-linear ad
    return;
  }
  this.log('pauseAd');
  this.isPaused_ = true;
  var date = new Date();
  this.pauseStartTime_ = date.getTime();
  this.videoSlot_.pause();
  this.invokeCallback_('AdPaused');
};


/**
 * Resumes the ad.
 */
VpaidNonLinear.prototype.resumeAd = function() {
  this.log('adPlaying');
  this.isPaused_ = false;
  var date = new Date();
  this.timePaused_ += (date.getTime() - this.pauseStartTime_);
  this.videoSlot_.play();
  this.invokeCallback_('AdPlaying');
};


/**
 * Expands the ad.
 */
VpaidNonLinear.prototype.expandAd = function() {
  this.log('expandAd');
  this.attributes_['expanded'] = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
  this.invokeCallback_('AdExpanded');
};


/**
 * Returns true if the ad is expanded.
 * @return {boolean}
 */
VpaidNonLinear.prototype.getAdExpanded = function() {
  this.log('getAdExpanded');
  return this.attributes_['expanded'];
};


/**
 * Returns the skippable state of the ad.
 * @return {boolean}
 */
VpaidNonLinear.prototype.getAdSkippableState = function() {
  this.log('getAdSkippableState');
  return this.attributes_['skippableState'];
};


/**
 * Collapses the ad.
 */
VpaidNonLinear.prototype.collapseAd = function() {
  this.log('collapseAd');
  this.attributes_['expanded'] = false;
};


/**
 * Skips the ad.
 */
VpaidNonLinear.prototype.skipAd = function() {
  this.log('skipAd');
  var skippableState = this.attributes_['skippableState'];
  if (skippableState) {
    this.invokeCallback_('AdSkipped');
  }
};


/**
 * Registers a callback for an event.
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VpaidNonLinear.prototype.subscribe = function(
    aCallback,
    eventName,
    aContext) {
  this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.eventCallbacks_[eventName] = callBack;
};


/**
 * Removes a callback based on the eventName.
 *
 * @param {string} eventName The callback type.
 */
VpaidNonLinear.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.eventCallbacks_[eventName] = null;
};


/**
 * @return {number} The ad width.
 */
VpaidNonLinear.prototype.getAdWidth = function() {
  return this.attributes_['width'];
};


/**
 * @return {number} The ad height.
 */
VpaidNonLinear.prototype.getAdHeight = function() {
  return this.attributes_['height'];
};


/**
 * @return {number} The time remaining in the ad.
 */
VpaidNonLinear.prototype.getAdRemainingTime = function() {
  if (this.isPaused_) {
    return this.lastRemainingTime_;
  }
  var date = new Date();
  var currentTime = date.getTime();
  var elapsedTime = (currentTime - this.startTime_ - this.timePaused_) / 1000.0;
  var remainingTime = this.attributes_.duration - elapsedTime;
  this.lastRemainingTime_ = remainingTime;
  return remainingTime;
};


/**
 * @return {number} The duration of the ad.
 */
VpaidNonLinear.prototype.getAdDuration = function() {
  return this.attributes_['duration'];
};


/**
 * @return {string} List of companions in vast xml.
 */
VpaidNonLinear.prototype.getAdCompanions = function() {
  return this.attributes_['companions'];
};


/**
 * @return {string} A list of icons.
 */
VpaidNonLinear.prototype.getAdIcons = function() {
  return this.attributes_['icons'];
};


/**
 * @return {boolean} True if the ad is a linear, false for non linear.
 */
VpaidNonLinear.prototype.getAdLinear = function() {
  return this.attributes_['linear'];
};


/**
 * Logs events and messages.
 * @param {string} message
 */
VpaidNonLinear.prototype.log = function(message) {
  console.log(message);
};


/**
 * Calls an event if there is a callback.
 * @param {string} eventType
 * @private
 */
VpaidNonLinear.prototype.invokeCallback_ = function(eventType) {
  if (eventType in this.eventCallbacks_) {
    this.eventCallbacks_[eventType]();
  }
};


/**
 * Main function called by wrapper to get the VPAID ad.
 * @return {Object} The VPAID compliant ad.
 */
var getVPAIDAd = function() {
  return new VpaidNonLinear();
};
