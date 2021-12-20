/****************************************************************************
map_locate.js

Extend L.Map with methods to get the location of the device

****************************************************************************/

(function (L, window/*, document, undefined*/) {
	"use strict";

    //Create namespaces
    var ns = window.fcoo = window.fcoo || {},
        nsGeo = ns.geolocation = ns.geolocation || {};


    var XXXId = 0;

    /***********************************************************
    GeolocationProvider
    Obejct that provides position, heading, speed etc. from
    a source. Differnet inherrited versions are created for
    geolocation, AIS, manual entering etc.
    Each GeolocationProvider has 0-N GeolocationXXX that gets its
    coords from this
    ***********************************************************/
    var GeolocationProvider = nsGeo.GeolocationProvider = function( options = {}){
        this.options = options;
        this.active = false;
        this.coords = {
            latitude        : null,
            longitude       : null,
            altitude        : null,
            accuracy        : null,
            altitudeAccuracy: null,
            heading         : null,
            speed           : null
        };
        this.geolocationXXXs = {};
        this.nrOfGeolocationXXXs = 0;
    };

    GeolocationProvider.prototype = {
        activate    : function(){},
        deactivate  : function(){},


        add: function( geolocationXXX ){
            geolocationXXX.id = 'geolocationXXX' + XXXId++;
            this.geolocationXXXs[geolocationXXX.id] = geolocationXXX;
            this.nrOfGeolocationXXXs++;
            if (this.nrOfGeolocationXXXs == 1)
                this.activate();
            else
                geolocationXXX.setCoords( this.coords );
        },

        remove: function( geolocationXXX ){
            this.nrOfGeolocationXXXs--;
            delete this.geolocationXXXs[geolocationXXX.id];

            if (this.nrOfGeolocationXXXs == 0)
                this.deactivate();
        }
    };







    /***********************************************************
    geolocationList = []GeolocationAction
    GeolocationAction = object to handle position, heading, speed
    from any source (eq. geoLocation, AIS or manually entered
    ***********************************************************/




//    function error(error){
//HER switch(error.code) {
//HER    case error.PERMISSION_DENIED:
//HER      x.innerHTML = "User denied the request for Geolocation."
//HER      break;
//HER    case error.POSITION_UNAVAILABLE:
//HER      x.innerHTML = "Location information is unavailable."
//HER      break;
//HER    case error.TIMEOUT:
//HER      x.innerHTML = "The request to get user location timed out."
//HER      break;
//HER    case error.UNKNOWN_ERROR:
//HER      x.innerHTML = "An unknown error occurred."
//HER      break;

        //console.log('error', error.PERMISSION_DENIED, error);

//    }


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
        enableHighAccuracy  : true
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


    function niels( geolocationPosition ){
        var c = geolocationPosition.coords;
        window.notyInfo(
            'latitude:'+c.latitude+'<br>'+
            'longitude:'+c.longitude+'<br>'+
            'altitude:'+c.altitude+'<br>'+
            'accuracy:'+c.accuracy+'<br>'+
            'altitudeAccuracy:'+c.altitudeAccuracy+'<br>'+
            'heading:'+c.heading+'<br>'+
            'speed:'+c.speed
        );
    }

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(niels, null/*error*/, geolocationOptions);
//HER        navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);
//HER        navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);

//HER        window.setTimeout(function(){
//HER            navigator.geolocation.getCurrentPosition(niels, error, geolocationOptions);
//HER        }, 12000);
    }
    else {
        //console.log("Geolocation is not supported by this browser.");
    }


















    /*
    New global events on window.fcoo.events

    id                                  event-function              Description
    ==================================  ==========================  =========================================================


    DEVICEORIENTATION                   function( orientation )     When the orientation of the device change. orientation = degree clockwise from north

    COMPASSNEEDSCALIBRATION             function()                  See https://www.w3.org/TR/orientation-event/#introduction




    */

/*

Locate options
Some of the geolocation methods for Map take in an options parameter. This is a plain javascript object with the following optional components:
Option	Type	Default	Description
watch	Boolean	false	If true, starts continuous watching of location changes (instead of detecting it once) using W3C watchPosition method. You can later stop watching using map.stopLocate() method.
setView	Boolean	false	If true, automatically sets the map view to the user location with respect to detection accuracy, or to world view if geolocation failed.
maxZoom	Number	Infinity	The maximum zoom for automatic view setting when using setView option.
timeout	Number	10000	Number of milliseconds to wait for a response from geolocation before firing a locationerror event.
maximumAge	Number	0	Maximum age of detected location. If less than this amount of milliseconds passed since last geolocation response, locate will return a cached location.
enableHighAccuracy	Boolean	false	Enables high accuracy, see description in the W3C spec.





    readonly attribute double accuracy;
    readonly attribute double latitude;
    readonly attribute double longitude;
    readonly attribute double? altitude;
    readonly attribute double? altitudeAccuracy;
    readonly attribute double? heading;
    readonly attribute double? speed;

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

        if (deviceOrientation !== null)
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


    //COMPASS NEEDS CALIBRATION
    L.DomEvent.on(window, 'compassneedscalibration', function(){
        ns.events.fire('COMPASSNEEDSCALIBRATION');
    });

































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


;
/****************************************************************************
    fcoo-maps-your-position.js,

    (c) 2021, FCOO

    https://github.com/FCOO/fcoo-maps-your-position
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    var ns = window.fcoo = window.fcoo || {},
        nsMap = ns.map = ns.map || {}/*,

        defaultOptions = {


        }*/;

    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};


    nsMap.mainMapOptions.deviceLocate = true;

    /***********************************************************
    MapLayer_YourPosition
    ***********************************************************/
    function MapLayer_YourPosition(options) {
        //Adjust options

        nsMap.MapLayer.call(this, options); //Or nsMap.MapLayer_ANOTHER.call(this, options);

    }
    nsMap.MapLayer_YourPosition = MapLayer_YourPosition;

    MapLayer_YourPosition.prototype = Object.create(nsMap.MapLayer.prototype); //OR = Object.create(nsMap.MapLayer_ANOTHER.prototype);

    MapLayer_YourPosition.prototype.createLayer = function( /*options*/ ){
        //return new L.SOME_LAYER_CONSTRUCTOR(null, options); //<- TODO
    };


    MapLayer_YourPosition.prototype = $.extend({}, nsMap.MapLayer.prototype, {    //OR nsMap.MapLayer_ANOTHER.prototype, {

        //Extend METHOD
        METHOD: function (METHOD) {
            return function () {

                //New extended code
                //......extra code

                //Original function/method
                METHOD.apply(this, arguments);
            };
        } (nsMap.MapLayer.prototype.METHOD),


        //Overwrite METHOD2
        METHOD2: function(){

        },

    });


    /***********************************************************
    Add MapLayer_YourPosition to createMapLayer
    ***********************************************************/
/*
    nsMap.createMapLayer["YOUR_POSITION"] = function(options, addMenu){

        //adjust default options with options into mapLayerOptions

        var mapLayer = nsMap._addMapLayer(id, nsMap.MapLayer_YourPosition, mapLayerOptions )

        addMenu( mapLayer.menuItemOptions() ); //OR list of menu-items
    };
*/


}(jQuery, L, this, document));




;
/*
Estendetions to L.Control.locate
*/

(function (L, window/*, document, undefined*/) {
	"use strict";

    //Create namespaces
    var ns = window.fcoo = window.fcoo || {};

    //Add senses to i18next
    window.i18next.addPhrases( 'locate', {
        distance: {
            da: "Din placering<br>er indenfor<br><strong>{{distance}} meter</strong><br>fra dette punkt",
            en: "Your location<br>is within<br><strong>{{distance}} metre</strong><br>from this point"
        },
        state_inactive: {
            da: "Vis din placering",
            en: "Show your location",
        },
        state_requesting: {
            da: "Arbejder...",
            en: "Working..."
        },
        state_following: {
            da: "Følger din placering. Klik for at stoppe",
            en: "Following your location. Click to stop"
        },
        state_active: {
            da: "Viser din placering. Klik for at stoppe",
            en: "Showing your location. Click to stop"
        },
        tooltip: {
            da: "Din placering",
            en: "Your location",
        },
    });


    //Extending the default options
    L.extend( L.Control.Locate.prototype.options, {

            position            : 'bottomright', //Position of the control
            layer               : undefined,     //The layer that the user's location should be drawn on. By default creates a new layer.
            setView             : 'untilPan',    //Updates the map view when location changes. The map view follows the users location. Stops updating the view if the user has manually panned the map.
            keepCurrentZoomLevel: true,          // Keep the current map zoom level when setting the view and only pan.
            flyTo               : true,          // Smooth pan and zoom to the location of the marker. Only works in Leaflet 1.0+.
            clickBehavior: {
                inView   : 'stop',    //When the user clicks on the control while the location is within the current view: stop locating and remove the location marker
                outOfView: 'setView', //When user clicks on the control while the location is outside the current view: zoom and pan to the current location
            },
            returnToPrevBounds: false, //If set, save the map bounds just before centering to the user's location. When control is disabled, set the view back to the bounds that were saved.
            cacheLocation     : true,  // Keep a cache of the location after the user deactivates the control. If set to false, the user has to wait until the locate API returns a new location before they see where they are again.

            drawCircle: true, // If set, a circle that shows the location accuracy is drawn.
            drawMarker: true, // If set, the marker at the users' location is drawn.

            markerClass: L.BsMarkerCircle, // The class to be used to create the marker. For example L.CircleMarker or L.Marker
            markerStyle: {
                size           : 'sm',
                colorName      : 'standard',
                borderColorName: 'black',
                puls           : true,
                tooltipHideWhenPopupOpen: true
            },

            // The CSS class for the icon.
            icon          : 'far fa-crosshairs', //'far fa-dot-circle',
            iconLoading   : ns.icons.working,    //Same spinner as fcoo-application
            iconElementTag: 'i',                 // The element to be created for icons. For example span or i

            circlePadding: [0, 0], // Padding around the accuracy circle.

            metric: true,           // Use metric units.

            // This event is called in case of any location error that is not a time out error.
            onLocationError: function(err) {
                window.notyError({ en: 'ERROR<br><em>' + err.message + '</em>', da: 'FEJL<br><em>' + err.message + '</em>' });
            },

             // This even is called when the user's location is outside the bounds set on the map. The event is called repeatedly when the location changes.
            onLocationOutsideMapBounds: function(control) {
                control.stop();
                window.notyInfo(
                    { en: 'You seem located outside the boundaries of the map', da: 'Du ser ud til at befinde dig udenfor kortets grænser' },
                    { timeout: 5000 }
                );
            },


            showPopup: true, //Display a pop-up when the user click on the inner marker.

            //
            strings: {
                title              : "", //Not used. Is changed in _updateLinkTitle
                metersUnit         : "", //Not used. Is changed in _drawMarker
                feetUnit           : "", //Not used. Is changed in _drawMarker
                popup              : "NOT USED", //Not used. Is changed in _drawMarker
                outsideMapBoundsMsg: "", //Not used. Is set in onLocationOutsideMapBounds
            },

            /** The default options passed to leaflets locate method. */
            locateOptions: {
                maxZoom: Infinity,
                watch  : true,    // if you overwrite this, visualization cannot be updated
                setView: false    // have to set this to false because we have to do setView manually
            }

    });

/* When bsButton is implementet use something a la
<span class="fa-stack fa-sm">
<i class="text-primary far fa-circle fa-pulsate fa-stack-2x"></i>
<i class="fas fa-circle fa-stack-1x" style="color: red;"></i>
<i class="text-primary fas fa-circle fa-xs fa-stack-1x"></i>
</span>For icon in popup selector
*/

    /***********************************************************
    Ocverwrite onAdd to update title on the button
    ***********************************************************/
    L.Control.Locate.prototype.onAdd = function ( onAdd ) {
        return function () {
            var result = onAdd.apply(this, arguments);

            //Add class="leaflet-control-fa-button" to adjust size of icon
            L.DomUtil.addClass( result, "leaflet-control-fa-button" );

            this._updateLinkTitle();

            //Only allow locate if protocol is https
            if (  (window.location.protocol.indexOf('https') == -1) &&
                  (window.location.host.indexOf('localhost') == -1)){
                //Remove onClick and replace with info-box
                L.DomEvent.off(this._link, 'click', this._onClick, this);
                L.DomEvent.on(this._link, 'click', function(){
                    window.notyWarning(
                        {
                            en: 'For security reasons <em>Your location</em> is only available when the protocol is <em>http<strong>s</strong></em>',
                            da: 'Af sikkerhedshensyn er <em>Din placering</em> kun tilgængelig, hvis protokollen er <em>http<strong>s</strong></em>'
                        },
                        { layout :'bottomRight', timeout: 5000, queue: 'leaflet_locateControl', }
                    );
                });
            }


            return result;
        };
	} ( L.Control.Locate.prototype.onAdd );


    /***********************************************************
    Ocverwrite _drawMarker to capture and change the popup
    ***********************************************************/
    L.Control.Locate.prototype._drawMarker = function ( _drawMarker ) {
        return function () {

            var result = _drawMarker.apply(this, arguments);

            this._marker.locateControl = this;

            //Remove the circle again
            this._map.removeLayer( this._circle );

            if (this._marker && !this._marker._tooltip)
                this._marker.bindTooltip({text: 'locate:tooltip'});

            //Replace default text with i18next-translated
            if (this._marker && this._marker._popup){
                var distance = Math.round(this._event.accuracy);
                this._marker
                    .on('popupopen', function( popup ){
                        //Add the circle
                        var locateControl = popup.target.locateControl;
                        locateControl._circle.addTo( locateControl._layer );
                    })
                    .on('popupclose', function( popup ){
                        //Remove the circle
                        var locateControl = popup.target.locateControl;
                        locateControl._map.removeLayer( locateControl._circle );
                    })
                    .setPopupContent(
                            $('<div style="text-align:center"></div>')
                                .i18n('locate:distance', 'html', {distance: distance})
                                .localize()[0]
                        );
            }
            this._updateLinkTitle();

            return result;
        };
	} ( L.Control.Locate.prototype._drawMarker );



    /***********************************************************
    Overwrite _updateContainerStyle to update title on the button and style for marker
    ***********************************************************/
    L.Control.Locate.prototype._updateContainerStyle = function ( _updateContainerStyle ) {
        return function () {
            var result = _updateContainerStyle.apply(this, arguments);
            //Change pulsing of marker
            if (this._marker && this._marker._icon)
                $(this._marker._icon).toggleClass('lbm-puls', !!this._isFollowing());

            this._updateLinkTitle();
            return result;
        };
	} ( L.Control.Locate.prototype._updateContainerStyle );


    /***********************************************************
    _updateLinkTitle
    ***********************************************************/
    L.Control.Locate.prototype._updateLinkTitle = function () {
        var i18n = '';

        //Get the current i18n-code for the title of the button
        if (this._active && !this._event)
            // active but don't have a location yet
            i18n = 'state_requesting';
        else
            if (this._isFollowing())
                i18n = 'state_following';
            else
                if (this._active)
                    i18n = 'state_active';
                else
                    i18n = 'state_inactive';

        $(this._link).i18n('locate:'+i18n, 'title').localize();

    };

}(L, this/*, document*/));

