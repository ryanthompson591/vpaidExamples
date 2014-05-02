/*
 * @fileoverview A VPAID ad useful for testing functionality of the sdk.
 *
 */


/**
 * @constructor
 */
var VpaidAd = function() {
  // The slot is the div element on the main page that the ad is supposed to
  // occupy.
  this.slot_ = null;
  // The video slot is the video object that the creative can use to render the
  // video element it might have.
  this.videoSlot_ = null;
  // An object containing all registered events.  These events are all
  // callbacks from the vpaid ad.
  this.events_ = {};
  // A list of attributes getable and setable.
  this.attributes_ = {
    'companions' : '',
    'desiredBitrate' : 256,
    'duration' : 30,
    'expanded' : false,
    'height' : 0,
    'icons' : '',
    'linear' : true,
    'remainingTime' : 10,
    'skippableState' : false,
    'viewMode' : 'normal',
    'width' : 0,
    'volume' : 50
  };
};


/**
 * Html to populate into the ad.  This provides all UI elements for the ad.
 */
VpaidAd.HTML_TEMPLATE =
  '<div style="background:blue">' +
  '<div>Tracking events ' +
  '<select id="eventSelect">' +
    '<option>----</option>' +
    '<option value="AdStarted">AdStarted</option>' +
    '<option value="AdStopped">AdStopped</option>' +
    '<option value="AdLoaded">AdLoaded</option>' +
    '<option value="AdLinearChange">AdLinearChange</option>' +
    '<option value="AdSizeChange">AdSizeChange</option>' +
    '<option value="AdExpandedChange">AdExpandedChange</option>' +
    '<option value="AdSkippableStateChange">AdSkippableStateChange</option>' +
    '<option value="AdDurationChange">AdDurationChange</option>' +
    '<option value="AdRemainingTimeChange">AdRemainingTimeChange</option>' +
    '<option value="AdVolumeChange">AdVolumeChange</option>' +
    '<option value="AdImpression">AdImpression</option>' +
    '<option value="AdVideoStart">AdVideoStart</option>' +
    '<option value="AdVideoFirstQuartile">AdVideoFirstQuartile</option>' +
    '<option value="AdVideoMidpoint">AdVideoMidpoint</option>' +
    '<option value="AdVideoThirdQuartile">AdVideoThirdQuartile</option>' +
    '<option value="AdVideoComplete">AdVideoComplete</option>' +
    '<option value="AdUserAcceptInvitation">AdUserAcceptInvitation</option>' +
    '<option value="AdUserMinimize">AdUserMinimize</option>' +
    '<option value="AdUserClose">AdUserClose</option>' +
    '<option value="AdPaused">AdPaused</option>' +
    '<option value="AdPlaying">AdPlaying</option>' +
  '</select></div><br>' +
  '<div>AdClickThru (make sure player handles works)' +
    '<input type="text" id="clickThruUrl" value="http://fake.com"/>' +
    '<input type="text" id="clickThruId" value="1"/>' +
    '<input type="text" id="clickThruPlayerHandels" value="false"/>' +
    '<input type="button" id="clickThruButton"/ value="AdClickThru">' +
  '</div>' +
  '<div>AdError' +
    '<input type="text" id="adErrorMsg" value="ad error message"/>' +
    '<input type="button" id="adErrorButton"/ value="AdError">' +
  '</div>' +
  '<div>AdLog' +
    '<input type="text" id="adLogMsg" value="ad log message"/>' +
    '<input type="button" id="adLogButton"/ value="AdLog">' +
  '</div>' +
  '<div>AdInteraction' +
    '<input type="text" id="adInteractionId" value="1"/>' +
    '<input type="button" id="adInteractionButton"/ value="AdInteraction">' +
  '</div>' +
  '<div> Last Action <textarea id="lastAction">None</textarea></div>' +
  '<table>' +
    '<tr>' +
      '<td>Companions</td>' +
      '<td>Desired Bitrate</td>' +
      '<td>Duration</td>' +
      '<td>Expanded</td>' +
    '</tr>' +
    '<tr>' +
      '<td><input type="text" id="companions"/></td>' +
      '<td><input type="text" id="desiredBitrate"/></td>' +
      '<td><input type="text" id="duration"/></td>' +
      '<td><input type="text" id="expanded"/></td>' +
    '</tr>' +
    '<tr>' +
      '<td>Height</td>' +
      '<td>Icons</td>' +
      '<td>Linear</td>' +
      '<td>Remaining Time</td>' +
    '</tr>' +
    '<tr>' +
      '<td><input type="text" id="height"/></td>' +
      '<td><input type="text" id="icons"/></td>' +
      '<td><input type="text" id="linear"/></td>' +
      '<td><input type="text" id="remainingTime"/></td>' +
    '</tr>' +
    '<tr>' +
      '<td>Skippable State</td>' +
      '<td>ViewMode</td>' +
      '<td>Volume</td>' +
      '<td>Width</td>' +
    '</tr>' +
    '<tr>' +
      '<td><input type="text" id="skippableState"/></td>' +
      '<td><input type="text" id="volume"/></td>' +
      '<td><input type="text" id="viewMode"/></td>' +
      '<td><input type="text" id="width"/></td>' +
    '</tr>' +
  '</table>' +
  '<textarea rows="10" cols="50" id="logTextArea">' +
  '</textarea>' +
  '</div>';


/**
 * VPAID defined init ad, initializes all attributes in the ad.  Ad will
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
VpaidAd.prototype.initAd = function(
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
  // slot and videoSlot are passed as part of the environmentVars
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.attributes_['desiredBitrate'] = desiredBitrate;

  this.log('initAd ' + width + 'x' + height +
      ' ' + viewMode + ' ' + desiredBitrate);
  this.renderSlot_();
  this.addButtonListeners_();
  this.fillProperties_();
  this.events_['AdLoaded']();
};


/**
 * Populates the inner html of the slot.
 * @private
 */
VpaidAd.prototype.renderSlot_ = function() {
  var slotExists = this.slot_ && this.slot_.tagName === 'DIV';
  if (!slotExists) {
    this.slot_ = document.createElement('div');
    if (!document.body) {
      document.body = /**@type {HTMLDocument}*/ document.createElement('body');
    }
    document.body.appendChild(this.slot_);
  }
  this.slot_.innerHTML = VpaidAd.HTML_TEMPLATE;
};


/**
 * Adds all listeners to buttons.
 *
 * @private
 */
VpaidAd.prototype.addButtonListeners_ = function() {
  var eventSelect = document.getElementById('eventSelect');
  eventSelect.addEventListener('change', this.eventSelected_.bind(this));
  var clickThruButton = document.getElementById('clickThruButton');
  clickThruButton.addEventListener(
      'click',
      this.adClickThruHandler_.bind(this));
  var adErrorButton = document.getElementById('adErrorButton');
  adErrorButton.addEventListener(
      'click',
      this.adErrorHandler_.bind(this));
  var adLogButton = document.getElementById('adLogButton');
  adLogButton.addEventListener(
      'click',
      this.adLogHandler_.bind(this));
  var adInteractionButton = document.getElementById('adInteractionButton');
  adInteractionButton.addEventListener(
      'click',
      this.adInteractionHandler_.bind(this));
};

/**
 * Returns the versions of vpaid ad supported.
 * @param {string} version
 * @return {string}
 */
VpaidAd.prototype.handshakeVersion = function(version) {
  return ('2.0');
};


/**
 * Called by the wrapper to start the ad.
 */
VpaidAd.prototype.startAd = function() {
  this.log('Starting ad');
  if ('AdStart' in this.events_) {
    this.events_['AdStarted']();
  }
};


/**
 * Called by the wrapper to stop the ad.
 */
VpaidAd.prototype.stopAd = function() {
  this.log('Stopping ad');
  if ('AdStop' in this.events_) {
    this.events_['AdStopped']();
  }
};

/**
 * @param {number} value The volume in percentage.
 */
VpaidAd.prototype.setAdVolume = function(value) {
  this.attributes_['volume'] = value;
  this.log('setAdVolume ' + value);
  if ('AdVolumeChanged' in this.events_) {
    this.events_['AdVolumeChanged']();
  }
};


/**
 * @return {number} The volume of the ad.
 */
VpaidAd.prototype.getAdVolume = function() {
  this.log('getAdVolume');
  return this.attributes_['volume'];
};


/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidAd.prototype.resizeAd = function(width, height, viewMode) {
  this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  if ('AdSizeChange' in this.events_) {
    this.events_['AdSizeChange']();
  }
};

/**
 * Pauses the ad.
 */
VpaidAd.prototype.pauseAd = function() {
  this.log('pauseAd');
  if ('AdPaused' in this.events_) {
    this.events_['AdPaused']();
  }
};

/**
 * Resumes the ad.
 */
VpaidAd.prototype.resumeAd = function() {
  this.log('resumeAd');
  if ('AdResumed' in this.events_) {
    this.events_['AdResumed']();
  }
};

/**
 * Expands the ad.
 */
VpaidAd.prototype.expandAd = function() {
  this.log('expandAd');
  this.attributes_['expanded'] = true;
  if ('AdExpanded' in this.events_) {
    this.events_['AdExpanded']();
  }
};

/**
 * Returns true if the ad is expanded.
 *
 * @return {boolean}
 */
VpaidAd.prototype.getAdExpanded = function() {
  this.log('getAdExpanded');
  return this.attributes_['expanded'];
};


/**
 * Returns the skippable state of the ad.
 *
 * @return {boolean}
 */
VpaidAd.prototype.getAdSkippableState = function() {
  this.log('getAdSkippableState');
  return this.attributes_['skippableState'];
};


/**
 * Collapses the ad.
 */
VpaidAd.prototype.collapseAd = function() {
  this.log('collapseAd');
  this.attributes_['expanded'] = false;
};


/**
 * Skips the ad.
 */
VpaidAd.prototype.skipAd = function() {
  this.log('skipAd');
  var skippableState = this.attributes_['skippableState'];
  if (skippableState) {
    if ('AdSkipped' in this.events_) {
      this.events_['AdSkipped']();
    } else {
      this.log('Error: Invalid ad skip request.');
    }
  }
};


/**
 * Registers a callback for an event.
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VpaidAd.prototype.subscribe = function(aCallback, eventName, aContext) {
  this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.events_[eventName] = callBack;
};


/**
 * Removes a callback based on the eventName.
 *
 * @param {string} eventName The callback type.
 */
VpaidAd.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.events_[eventName] = null;
};


/**
 * @return {number} The ad width.
 */
VpaidAd.prototype.getAdWidth = function() {
  return this.attributes_['width'];
};


/**
 * @return {number} The ad height.
 */
VpaidAd.prototype.getAdHeight = function() {
  return this.attributes_['height'];
};


/**
 * @return {number} The time remaining in the ad.
 */
VpaidAd.prototype.getRemainingTime = function() {
  return this.attributes_['remainingTime'];
};


/**
 * @return {number} The duration of the ad.
 */
VpaidAd.prototype.getAdDuration = function() {
  return this.attributes_['duration'];
};


/**
 * @return {string} List of companions in vast xml.
 */
VpaidAd.prototype.getAdCompanions = function() {
  return this.attributes_['companions'];
};


/**
 * @return {string} A list of icons.
 */
VpaidAd.prototype.getAdIcons = function() {
  return this.attributes_['icons'];
};

/**
 * @return {boolean} True if the ad is a linear, false for non linear.
 */
VpaidAd.prototype.getAdLinear = function() {
  return this.attributes_['linear'];
};


/**
 * Logs events and messages.
 *
 * @param {string} message
 */
VpaidAd.prototype.log = function(message) {
  var logTextArea = document.getElementById('logTextArea');
  if (typeof logTextArea != 'undefined' && logTextArea != null) {
    var content = logTextArea.innerHTML;
    content = message + '\n' + content;
    logTextArea.innerHTML = content;
  } else {
    console.log(message);
  }
};


/**
 * Callback for AdClickThru button.
 *
 * @private
 */
VpaidAd.prototype.adClickThruHandler_ = function() {
  if (!this.isEventSubscribed_('AdClickThru')) {
    this.log('Error: AdClickThru function callback not subscribed.');
    return;
  }
  var clickThruUrl = document.getElementById('clickThruUrl').value;
  var clickThruId = document.getElementById('clickThruId').value;
  var clickThruPlayerHandles =
      document.getElementById('clickThruPlayerHandels').value;
  this.log('AdClickThu(' + clickThruUrl + ',' +
      clickThruId + ',' + clickThruPlayerHandles + ')');
  this.events_['AdClickThru'](
      clickThruUrl,
      clickThruId,
      clickThruPlayerHandles);
};


/**
 * Callback for AdError button.
 *
 * @private
 */
VpaidAd.prototype.adErrorHandler_ = function() {
  if (!this.isEventSubscribed_('AdError')) {
    this.log('AdError function callback not subscribed.');
    return;
  }
  var adError = document.getElementById('adErrorMsg').value;
  this.log('adError(' + adError + ')');
  this.events_['AdError'](adError);
};


/**
 * Callback for AdLogMsg button.
 *
 * @private
 */
VpaidAd.prototype.adLogHandler_ = function() {
  if (!this.isEventSubscribed_('AdLog')) {
    this.log('Error: AdLog function callback not subscribed.');
    return;
  }
  var adLogMsg = document.getElementById('adLogMsg').value;
  this.log('adLog(' + adLogMsg + ')');
  this.events_['AdLog'](adLogMsg);
};


/**
 * Callback for AdInteraction button.
 *
 * @private
 */
VpaidAd.prototype.adInteractionHandler_ = function() {
  if (!this.isEventSubscribed_('AdInteraction')) {
    this.log('Error: AdInteraction function callback not subscribed.');
    return;
  }
  var adInteraction = document.getElementById('adInteractionId').value;
  this.log('adLog(' + adInteraction + ')');
  this.events_['AdInteraction'](adInteraction);
};


/**
 * Callback function when an event is selected from the dropdown.
 *
 * @private
 */
VpaidAd.prototype.eventSelected_ = function() {
  var eventSelect = document.getElementById('eventSelect');
  var value = eventSelect.value;
  this.log(value);
  if (value in this.events_) {
    if (this.events_[value] != null) {
      this.events_[value](); // Call subscribed listener.
    }
  }
};


/**
 * @param {string} eventName
 * @return {Boolean} True if this.events_ contains the callback.
 * @private
 */
VpaidAd.prototype.isEventSubscribed_ = function(eventName) {
  return typeof(this.events_[eventName]) === 'function';
};


/**
 * Populates all of the vpaid ad properties.
 *
 * @private
 */
VpaidAd.prototype.fillProperties_ = function() {
  for (var key in this.attributes_) {
    var textBox = document.getElementById(key);
    textBox.setAttribute('value', this.attributes_[key]);
  }
};


/**
 * Main function called by wrapper to get the vpaid ad.
 *
 * @return {Object}
 */
var getVPAIDAd = function() {
  return new VpaidAd();
};
