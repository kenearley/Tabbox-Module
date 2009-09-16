/*
 * TabViewRotation adds rotation functionality to TabView.
 *
 * Params:
 * theBox = the TabView object that this feature is being added to
 * params = an object literal of parameters {"rate": "2000"}
 */
YAHOO.namespace("SentientBit.tabbox");
YAHOO.SentientBit.tabbox.TabViewRotation = function(theBox, params) {
	
/* Private Variables */
	 
	var	_rotationRate,	// length of time between rotation in milliseconds
		_intervalId,	// a unique interval ID you can pass to clearInterval()
		_isRotating,	// boolean signifying whether the tab box is currently rotating
		_this = this;
			
/* Private Methods */
	
	function _init() {
		_setRotationRate();
		theBox.startRotation();
		theBox.tabChosen.subscribe(_onTabChosen);
	};
	
	function _setRotationRate() {
		if (typeof params.rate == 'number') {
			_rotationRate = params[0];
		} else if (!(isNaN(parseInt(params.rate, 10)))) {
			_rotationRate = parseInt(params.rate, 10);
		} else {
			_rotationRate = 5000;
		}
	}
	
	function _onTabChosen(e) {
			theBox.stopRotation();
		};
		
/* Public Methods -- These methods get added to the instance of the tabbox to which this feature has been added */
	
	theBox.getRotationRate = function() { return _rotationRate; };
	theBox.getIntervalId = function() { return _intervalId; };
	theBox.getIsRotating = function() { return _isRotating; };
	
	theBox.startRotation = function() {
		_intervalId = window.setInterval(theBox.showNextTab, _rotationRate);
		YAHOO.util.Event.addListener(theBox.getTabboxDiv(), "mouseover", theBox.pauseRotation);
		YAHOO.util.Event.removeListener(theBox.getTabboxDiv(), "mouseout", theBox.startRotation);
		_isRotating = true;
	};
	
	theBox.stopRotation = function() {
		window.clearInterval(_intervalId);
		YAHOO.util.Event.removeListener(theBox.getTabboxDiv(), "mouseout", theBox.startRotation);
		YAHOO.util.Event.removeListener(theBox.getTabboxDiv(), "mouseover", theBox.pauseRotation);
		_isRotating = false;
	};
	
	theBox.pauseRotation = function() {
		window.clearInterval(_intervalId);
		YAHOO.util.Event.addListener(theBox.getTabboxDiv(), "mouseout", theBox.startRotation);
		YAHOO.util.Event.removeListener(theBox.getTabboxDiv(), "mouseover", theBox.pauseRotation);
	};
	 	
/* Make It Go */
	_init();	
};

