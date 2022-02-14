/****************************************************************************
fcoo-geolocation.js

Define global events to handle device orientation and calibration


Using geolocation-provider-handler and create global versions of window.geolocation.GeolocationProvider:
window.fcoo.geo.standardProvider:
    Provide geolocation-info from the browser geolocation API together with device orientation events



****************************************************************************/

(function (L, window/*, document, undefined*/) {
	"use strict";

    //Create namespaces
    var ns    = window.fcoo = window.fcoo || {},
        nsGeo = ns.geo = ns.geo || {};


    /*
    New global events on window.fcoo.events

    id                                  event-function              Description
    ==================================  ==========================  =========================================================


    DEVICEORIENTATION                   function( orientation )     When the orientation of the device change.
                                                                    orientation = degree clockwise from north.
                                                                    orientation = null if not found or not supported by browser/device

    COMPASSNEEDSCALIBRATION             function()                  See https://www.w3.org/TR/orientation-event/#introduction





	_rotateHandler: function(e) {

		var self = this, angle;

		if(!this._isActive) return false;

		if(e.webkitCompassHeading)	//iphone
			angle = 360 - e.webkitCompassHeading;

		else if(e.alpha)			//android
			angle = e.alpha;
		else {
			this._errorCompass({message: 'Orientation angle not found'});
		}

		angle = Math.round(angle);

		if(angle % this.options.angleOffset === 0)
			self.setAngle(angle);
	},





    */

//globalEvents.fire(eventNames [,arg1, arg2,.., argN]);


    //DEVICE ORIENTATION
    function onDeviceOrientation(e) {
        var deviceOrientation = null;
        if (e.webkitCompassHeading)
            // iOS
            deviceOrientation = e.webkitCompassHeading;
        else
            if (e.absolute && e.alpha)
                // Android
                deviceOrientation = 360 - e.alpha;


//MANGLER beta og gamma


        if (deviceOrientation !== null)
            deviceOrientation = Math.round(deviceOrientation);

        ns.events.fire('DEVICEORIENTATION', deviceOrientation);
    }

    //Set correct event
    var oriAbs = 'ondeviceorientationabsolute' in window;
    if (oriAbs || ('ondeviceorientation' in window)) {

        var add_event_deviceorientation = function() {
            L.DomEvent.on(window, oriAbs ? 'deviceorientationabsolute' : 'deviceorientation', onDeviceOrientation);
        };

        if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function')
            DeviceOrientationEvent.requestPermission().then(function (permissionState) {
                if (permissionState === 'granted')
                    add_event_deviceorientation();
            });
        else
            add_event_deviceorientation();
    }




    /**********************************
    COMPASS NEEDS CALIBRATION
    ***********************************/
    L.DomEvent.on(window, 'compassneedscalibration', function(){
        ns.events.fire('COMPASSNEEDSCALIBRATION');
    });










    /***********************************************************
    fcoo.geo.standardProvider
    Obejct that provides position, heading, speed, and device orientations
    from the browsers geolocation API and deice-orientation-events
    ***********************************************************/
    nsGeo.standardProvider = new window.geolocation.GeolocationProvider({

    });

    $.extend(nsGeo.standardProvider, {
        activate  : function(){



        },

        deactivate: function(){


        },
    });










    function error(error){

        window.notyError(error.code);
/*
switch(error.code) {
    case error.PERMISSION_DENIED:
        x.innerHTML = "User denied the request for Geolocation."
        break;
    case error.POSITION_UNAVAILABLE:
        x.innerHTML = "Location information is unavailable."
        break;
    case error.TIMEOUT:
        x.innerHTML = "The request to get user location timed out."
        break;
    case error.UNKNOWN_ERROR:
        x.innerHTML = "An unknown error occurred."
        break;

        //console.log('error', error.PERMISSION_DENIED, error);

Value	Associated constant	Description
1	PERMISSION_DENIED	The acquisition of the geolocation information failed because the page didn't have the permission to do it.
2	POSITION_UNAVAILABLE	The acquisition of the geolocation failed because at least one internal source of position returned an internal error.
3	TIMEOUT	The time allowed to acquire the geolocation was reached before the information was obtained.

*/
    }


    var geolocationOptions = {
        /* From https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
        maximumAge:
            Is a positive long value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return.
            If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position.
            If set to Infinity the device must return a cached position regardless of its age. Default: 0.

        timeout:
            Is a positive long value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position.
            The default value is Infinity, meaning that getCurrentPosition() won't return until the position is available.

        enableHighAccuracy:
            Is a boolean value that indicates the application would like to receive the best possible results.
            If true and if the device is able to provide a more accurate position, it will do so.
            Note that this can result in slower response times or increased power consumption (with a GPS chip on a mobile device for example).
            On the other hand, if false, the device can take the liberty to save resources by responding more quickly and/or using less power. Default: false.
        */

        maximumAge          : 10 * 1000, //Allow 10sec old position

        timeout             : 10 * 1000,

        enableHighAccuracy  : false
    };

    /*


    GeolocationPosition = {
        coords   : GeolocationCoordinates
        timestamp: Millisecond

    From https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates:
    GeolocationCoordinates = {
        latitude        : Position's latitude in decimal degrees.
        longitude       : Position's longitude in decimal degrees.
        altitude        : Position's altitude in meters, relative to sea level. This value can be null if the implementation cannot provide the data.
        accuracy        : Accuracy of the latitude and longitude properties, expressed in meters.
        altitudeAccuracy: Accuracy of the altitude expressed in meters. This value can be null.
        heading         : Direction towards which the device is facing. This value, specified in degrees, indicates how far off from heading true north the device is. 0 degrees represents true north, and the direction is determined clockwise (which means that east is 90 degrees and west is 270 degrees). If speed is 0, heading is NaN. If the device is unable to provide heading information, this value is null.
        speed           : Velocity of the device in meters per second. This value can be null.
    }
    All properties are double

    */

var timestamp = 0;
    function niels( geolocationPosition ){

console.log(geolocationPosition);
        if (timestamp == geolocationPosition.timestamp) return;

        timestamp = geolocationPosition.timestamp;

        var c = geolocationPosition.coords;
        window.notyInfo(
            'VERSION: 0.0.10<br>'+
            'latitude:'+c.latitude+'<br>'+
            'longitude:'+c.longitude+'<br>'+
            'altitude:'+c.altitude+'<br>'+
            'accuracy:'+c.accuracy+'<br>'+
            'altitudeAccuracy:'+c.altitudeAccuracy+'<br>'+
            'heading:'+c.heading+'<br>'+
            'speed:'+c.speed+'<br>'+
            'window.deviceOrientation:'+window.deviceOrientation,
            {killer: true}
        );
    }

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(niels, error, geolocationOptions);

//HER        navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);
//HER        navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);

//HER        window.setTimeout(function(){
//HER            navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);
//HER        }, 12000);
    }
    else {
        //console.log("Geolocation is not supported by this browser.");
    }


















































//this._map.on('locationfound', this._onLocationFound, this);


//    L.Map.prototype



//HER    L.Map.mergeOptions({
//HER        deviceLocate: false,
//HER        bsZoomOptions: {}
//HER    });

//HER    L.Map.addInitHook(function () {
//HER        if (this.options.deviceLocate) {
//HER        }
//HER    });







return;
/*
/*
 * Leaflet Control Compass v1.5.3 - 2018-11-23
 *
 * Copyright 2014 Stefano Cudini
 * stefano.cudini@gmail.com
 * https://opengeo.tech/
 *
 * Licensed under the MIT license.
 *
 * Demos:
 * https://opengeo.tech/maps/leaflet-compass/
 *
 * Source:
 * git@github.com:stefanocudini/leaflet-compass.git
 *
 */
/*
(function (factory) {
    if(typeof define === 'function' && define.amd) {
    //AMD
        define(['leaflet'], factory);
    } else if(typeof module !== 'undefined') {
    // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
    // Browser globals
        if(typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
})(function (L) {

L.Control.Compass = L.Control.extend({

	includes: L.version[0] =='1' ? L.Evented.prototype : L.Mixin.Events,
	//
	//Managed Events:
	//	Event				Data passed		Description
	//
	//	compass:rotated		{angle}			fired after compass data is rotated
	//	compass:disabled					fired when compass is disabled
	//
	//Methods exposed:
	//	Method 			Description
	//
	//  getAngle		return Azimut angle
	//  setAngle		set rotation compass
	//  activate		active tracking on runtime
	//  deactivate		deactive tracking on runtime
	//
	options: {
		position: 'topright',	//position of control inside map
		autoActive: false,		//activate control at startup
		showDigit: false,		//show angle value bottom compass
		textErr: '',			//error message on alert notification
		callErr: null,			//function that run on compass error activating
		angleOffset: 2			//min angle deviation before rotate

        // big angleOffset is need for device have noise in orientation sensor
	},

	initialize: function(options) {
		if(options && options.style)
			options.style = L.Util.extend({}, this.options.style, options.style);
		L.Util.setOptions(this, options);
		this._errorFunc = this.options.callErr || this.showAlert;
		this._isActive = false;//global state of compass
		this._currentAngle = null;	//store last angle
	},

	onAdd: function (map) {

		var self = this;

		this._map = map;

		var container = L.DomUtil.create('div', 'leaflet-compass');

		this._button = L.DomUtil.create('span', 'compass-button', container);
		this._button.href = '#';

		this._icon = L.DomUtil.create('div', 'compass-icon', this._button);
		this._digit = L.DomUtil.create('span', 'compass-digit', this._button);

		this._alert = L.DomUtil.create('div', 'compass-alert', container);
		this._alert.style.display = 'none';

		L.DomEvent
			.on(this._button, 'click', L.DomEvent.stop, this)
			.on(this._button, 'click', this._switchCompass, this);

		L.DomEvent.on(window, 'compassneedscalibration', function(e) {
			self.showAlert('Your compass needs calibrating! Wave your device in a figure-eight motion');
		}, this);

		if(this.options.autoActive)
			this.activate();

		return container;
	},

	onRemove: function(map) {

		this.deactivate();

		L.DomEvent
			.off(this._button, 'click', L.DomEvent.stop, this)
			.off(this._button, 'click', this._switchCompass, this);
	},

	_switchCompass: function() {
		if(this._isActive)
			this.deactivate();
		else
			this.activate();
	},

	_rotateHandler: function(e) {

		var self = this, angle;

		if(!this._isActive) return false;

		if(e.webkitCompassHeading)	//iphone
			angle = 360 - e.webkitCompassHeading;

		else if(e.alpha)			//android
			angle = e.alpha;
		else {
			this._errorCompass({message: 'Orientation angle not found'});
		}

		angle = Math.round(angle);

		if(angle % this.options.angleOffset === 0)
			self.setAngle(angle);
	},

	_errorCompass: function(e) {
		this.deactivate();
		this._errorFunc.call(this, this.options.textErr || e.message);
	},

	_rotateElement: function(el) {
		el.style.webkitTransform = "rotate("+ this._currentAngle +"deg)";
		el.style.MozTransform = "rotate("+ this._currentAngle +"deg)";
		el.style.transform = "rotate("+ this._currentAngle +"deg)";
	},

	setAngle: function(angle) {

		if(this.options.showDigit && !isNaN(parseFloat(angle)) && isFinite(angle))
			this._digit.innerHTML = angle+'Â°';

		this._currentAngle = angle;
		this._rotateElement( this._icon );

		this.fire('compass:rotated', {angle: angle});
	},

	getAngle: function() {	//get last angle
		return this._currentAngle;
	},

	activate: function() {

		this._isActive = true;

		L.DomEvent.on(window, 'deviceorientation', this._rotateHandler, this);

		L.DomUtil.addClass(this._button, 'active');
	},

	deactivate: function() {

		this.setAngle(0);

		this._isActive = false;

		L.DomEvent.off(window, 'deviceorientation', this._rotateHandler, this);

		L.DomUtil.removeClass(this._button, 'active');

		this.fire('compass:disabled');
	},

	showAlert: function(text) {
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		}, 5000);
	}
});

L.control.compass = function (options) {
	return new L.Control.Compass(options);
};

return L.Control.Compass;

});




*/
}(L, this/*, document*/));

