/*
 * TabView is base code for all tab boxes. Other features with be separate add ons
 * that can be mixed and match without conflicts. The add on features currently available are:
 * 		TabViewRotation, TabViewControls, TabViewTracking
 *
 * Params:
 * tabboxDiv = the ID of the html element that holds the tabbox
 * tabStyle = a string or number to set the tab width (flex, fill, or 100)
 * heightMode = a string or number to set the tab width (flex, calculated, or 300)
 * features = an array of javascript classes with their params
 * params = an object literal of parameters {"tabStyle": "fill", "heightMode": "calculated"}
 *
 * Example:
 * var addedFeatures = [
 * 		{ "name": "YAHOO.SentientBit.tabbox.TabViewRotation", "params":{"rate": "2000"} },
 * 		{ "name": "YAHOO.SentientBit.tabbox.TabViewControls" },
 *		{ "name": "YAHOO.SentientBit.tabbox.TabViewTracking", params:{"dcsid": "dcs11111"} }
 * ]
 * YAHOO.SentientBit.tabbox.tabbox1 = new YAHOO.SentientBit.tabbox.TabView("tabbox1", addedFeatures, {"tabStyle": "fill", "heightMode": "calculated"});
 */
YAHOO.namespace("SentientBit.tabbox");
YAHOO.SentientBit.tabbox.TabView = function(tabboxDiv, features, params) {
	
/* Private Variables */	   
	var _tabboxDiv,		// html element (div) that wraps the entire tab box
		_tabView, 		// tabview object created by YAHOO
		_tabNav,  		// html element (ul) that contains the navigation elements (tabs)
		_navWrap, 		// html element (div) that contains the tabNav
		_contentWrap,	// html element (div) that wraps the content area
		_tabs,	 		// and array of html elements (li). The tabs
		_numTabs,		// number of tabs
		_tabStyle,		// how tabs display (flex = fit according to text, fill = tabs evenly sized to fill nav width, fixed = tabs are specific size)
		_heightMode,	// how height of the overall tabbox is calculated (flex = height is variable depending on the content, calculated = calculated by height of tallest, fixed = specified height)
		_navWidth, 		// width of the div that contains the navigations
		_contentHeight,	// calculated height based on the tallest content div
		_featureList,	// array of added features to the tab box
		_this = this;	// fixing scope of the keyword 'this'. Refers to this tabbox object
		
		var loader = new YAHOO.util.YUILoader(); 
		
/* Public variables */
		this.tabChanged;
		this.tabChosen;		
		
/* Private Methods */
	function _initLoader() {
		loader.sandbox({
			require:["tabview"],
			base: "/sandbox/lib/yui/build/",
			onSuccess: _init
		});
		loader.addModule({
			name: "fakeLib", //module name; must be unique
			type: "js", //can be "js" or "css"
		    fullpath: "/sandbox/lib/fakeLib/logging.js",
		    varName: "fakeLib"
		});
		loader.require("fakeLib");
		loader.insert();
	}
	
	function _init() {
		_tabboxDiv = typeof tabboxDiv == "string" ? document.getElementById(tabboxDiv) : tabboxDiv;
   		_tabNav = YAHOO.util.Dom.getElementsByClassName("yui-nav", "ul", _tabboxDiv)[0];
		_navWrap = YAHOO.util.Dom.getElementsByClassName("nav-wrap", "div", _tabboxDiv)[0];
		_contentWrap = YAHOO.util.Dom.getElementsByClassName("content-wrap", "div", _tabboxDiv)[0];
		_tabs = _tabNav.getElementsByTagName("li");
		_numTabs = _tabs.length;
		_tabStyle = params.tabStyle;
		_heightMode = params.heightMode;
		_navWidth = _setNavWidth();
		_contentHeight = _setContentHeight();
		_featureList = features;
		_tabView = new YAHOO.widget.TabView(_tabboxDiv);
		_initializeEventListeners();
		_loadFeatures();
	};
	
	function _loadFeatures() {
		YAHOO.util.Get.script(
			"http://sentientbit.com/sandbox/tabbox/js/tabRotation.js",
			{ 
				onSuccess: function() {
		        	YAHOO.SentientBit.tabbox.TabViewRotation(_this, _featureList[0].params);
				},
				onFailure: function() { console.log("could not load http://sentientbit.com/sandbox/tabbox/js/tabViewRotation.js"); }
		    }
		);
	};
	
	/*
	 *	Instantiating the YAHOO tabview.
	 */
	function _initializeEventListeners() {
		YAHOO.util.Event.addListener(_tabNav, "click", _announceTabChosen);
		_tabView.addListener("activeTabChange", _announceTabChanged);
		
		_this.tabChanged = new YAHOO.util.CustomEvent("YAHOO.SentientBit.tabbox.TabView.tabChanged", this),
		_this.tabChosen = new YAHOO.util.CustomEvent("YAHOO.SentientBit.tabbox.TabView.tabChosen", this);
	};
	
	/*
	 * Depending on the style chosen for the tabs (fixed, flex, or fill), the width
	 * of the tabs are calculated, the css is set on the tabs, then the width is 
	 * saved into the _tabWidth variable
	 */
	function _setNavWidth() {
		var totalWidth = _tabboxDiv.offsetWidth;
		_allTabsWidth = totalWidth;
		var width;
		var remainder = 0;
		if (typeof _tabStyle == 'number' || !(isNaN(parseInt(_tabStyle)))) {
			YAHOO.util.Dom.setStyle(_tabs, "width", tabStyle + "px");
		} else if (_tabStyle == "fill") { // need to calculate remainder and add extra pixels because of IE
			width = (Math.floor(totalWidth / _numTabs));
			remainder = (totalWidth % _numTabs);
			for (var i=0; i<_tabs.length; i++) {
		 		var tabWidth;
		 		tabWidth = (remainder > 0) ? (width +1) : width;
		 		YAHOO.util.Dom.setStyle(_tabs[i], "width", (tabWidth) + "px");
		 		remainder--;
		 	}
		} else {
			YAHOO.util.Dom.setStyle(_tabs, "width", "auto");
		}
		
		YAHOO.util.Dom.addClass(_tabs[0], "first");
		YAHOO.util.Dom.addClass(_tabs[_tabs.length-1], "last");
		return totalWidth;
	};
	
	/*
	 * Sets height according to the heightMode.
	 *
	 * heightMode = 400 - The height will be set to 400px
	 *
	 * heightMode = calculated - Measures the height of each of the content divs. Then sets the height of the container div
	 * to give the look of a fixed height.
	 *
	 * Otherwise it will be set to default
	 */
	function _setContentHeight() {
		var contentDiv = YAHOO.util.Dom.getElementsByClassName('yui-content', 'div', _tabboxDiv)[0];
		if (typeof _heightMode == 'number' || !(isNaN(parseInt(_heightMode)))) {
			contentDiv.style.height = _heightMode + "px";
			return _heightMode;
		} else if (_heightMode == "calculated") {
		 	
		 	var children = YAHOO.util.Dom.getChildren(contentDiv);
		 	var height = 0;
		 	for (var i=0; i<children.length; i++) {
		 		if (children[i].offsetHeight > height) {
		 			height = children[i].offsetHeight;
		 		}
		 	}
		 	contentDiv.style.height = height + "px";
		 	return height;
		 } else {
		 	return "auto";
		 }
	}
	
	/*
	 * Used to announce anytime the the tab has been changed on a tabbox.
	 * It passes the tabbox that has changed, as well as the tab number and tab text.  
	 */	   
	function _announceTabChanged(e) {
		var tabNumber = _tabView.getTabIndex(e.newValue)+1;
		var tabText = e.newValue.get("label");
		var source = { box: _this, tabNumber: tabNumber, tabText: tabText };
		_this.tabChanged.fire(source);
	};
	
	/*
	 * Event called when user selects a tab. Used to distinguish between user selected tabs and
	 * automated tab changes (see _announceTabChanged).
	 */
	function _announceTabChosen(e) {
		var elTarget = YAHOO.util.Event.getTarget(e);
		var tabText = elTarget.innerHTML;
		var tabNumber;
		for (var i=0; i<_tabView.get("tabs").length; i++) {
			if (_tabView.get('tabs')[i].get('labelEl') == elTarget) {
				tabNumber = i+1;
				break;
			}
		}
		var source = { box: _this, tabNumber: tabNumber, tabText: tabText }; 
		_this.tabChosen.fire(source);
	};
		
/* Public Methods */
	
	this.getTabboxDiv = function() { return _tabboxDiv; };
	this.getTabView = function() { return _tabView; };
	this.getNavWrap = function() { return _navWrap; };
	this.getTabNav = function() { return _tabNav; };
	this.getContentWrap = function() { return _contentWrap; };
	this.getNumTabs = function() {	return _numTabs; };
	this.getNumTabsShowing = function() { return _numTabsShowing; };
	this.getFeatureList = function() { return _featureList; };
	
	/**
	 * Increments the focus of the tabs by one to the right
	 */
	this.showNextTab = function() {
		var activeTab = _tabView.get("activeIndex"),
			  nextTab;
	
		if (activeTab == _numTabs - 1) {
			nextTab = 0;
		} else {
			nextTab = activeTab + 1;
		};
	
		_tabView.set("activeIndex", nextTab);
	};
	
	/**
	 * Increments the focus of the tabs by one to the left
	 */
	this.showPrevTab = function() {
		var activeTab = _tabView.get("activeIndex"),
			  prevTab;
	
		if (activeTab == 0) {
			prevTab = _numTabs - 1;
		} else {
			prevTab = activeTab - 1;
		};
	
		_tabView.set("activeIndex", prevTab);
	};
  
/* Make It Go */
	_initLoader();
};
