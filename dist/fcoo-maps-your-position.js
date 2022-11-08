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
        nsMap = ns.map = ns.map || {};

    var header_text = {da:'Din placering', en:'Your position'};

    //State for Your Position
    var yp_init  = 'INIT',
        yp_allow = 'ALLOW',
        yp_error = 'ERROR';

    function showGeolocationWarning(){
        window.notyInfo({
            da: 'Din placering kan ikke vises. Det kan skyldes at,<br><ul>' +
                    '<li>siden ikke har tilladelse til at vise placering</li>' +
                    '<li>din mobil/tablet/computer ikke kan bestemme placering</li>' +
                    '<li>siden ikke tilgås via <em>https</em></li>' +
                '</ul>',

            en: 'Your location can\'t be displayed. Possible reasons:<br><ul>' +
                    '<li>The page don\'t allow showing of location</li>' +
                    '<li>Your device can\'t determine the location</li>' +
                    '<li>The page isn\'t accessed via <em>https</em></li>' +
                '</ul>'
        }, {
            header   : header_text,
            layout   : 'center',
            textAlign: 'left',
            closeWith: ['click', 'button'],
            queue    : 'showGeolocationWarning'
        });

    }

    //TEST_MODE = Only under development
    var TEST_MODE = false;


    /***********************************************************
    MapLayer_YourPosition_options
    ***********************************************************/
    var MapLayer_YourPosition_options = {
            text     : header_text,

            legendOptions: {
                showContent: false,
                showIcons  : false,
                onWarning  : showGeolocationWarning,
            },

            layerOptions: {
                constructor    : L.BsMarkerCircle,
                size           : 'sm',
                markerClassName: 'show-for-geolocation',
                innerIconClass : 'fas fa-sort-up show-for-geolocation-direction',
                scaleInner     : 200,

                colorName      : 'your-position',

                inclCenterButton: true,

                popupContent        : ['latLng',             'altitude',          'velocity'],
                popupWidth          : '10em',

                popupExtendedContent: ['latLng', 'accuracy', 'altitude_accuracy', 'velocity_extended'],
                extendedPopupWidth  : 180,

                popupMinimizedContent: true,

                legendContent       : ['latLng', 'accuracy', 'altitude_accuracy', 'velocity_extended'],

                contextmenu: true,

                latLng          : L.latLng(55, 12),
                accuracy        : null,
                speed           : null,
                direction       : null,
                altitude        : null,
                altitudeAccuracy: null,
            }
        };

    /***********************************************************
    MapLayer_YourPosition
    MapLayer showing marker at the position of the device
    MapLayer_YourPosition is an extention of MapLayer_Marker
    ***********************************************************/
    function MapLayer_YourPosition(options) {
        var _this = this;
        options.layerOptions.buttonList = [{
            //Follow-buttons
            type     : 'standardcheckboxbutton',
            text     : {da: 'Følg', en: 'Follow'},
            class    : 'min-width your-position-follow-btn',
            selected : this._getFollowSelected.bind(this),
            onChange : this._followButton_onChange,
            context  : _this
        }];

        this.state = yp_init;

        options.onAdd    = this.onAdd.bind(this);
        options.onRemove = this.onRemove.bind(this);

        options.layerOptions.popupOptions = {
            onOpen       : _this._popup_onOpen,
            onOpenContext: _this
        };

        nsMap.MapLayer_Marker.call(this, options);
    }

    nsMap.MapLayer_YourPosition = MapLayer_YourPosition;
    MapLayer_YourPosition.prototype = Object.create(nsMap.MapLayer_Marker.prototype);

    MapLayer_YourPosition.prototype = $.extend({}, nsMap.MapLayer_Marker.prototype, {
        /*****************************************************
        onAdd - Add this as geolocation-handler
        *****************************************************/
        onAdd: function(map/*, layer*/){
            if (this.glh_id){
                if (this.state == yp_allow)
                    //Update with newest data
                    this._updateCoords( this.dataset.data, map.fcooMapIndex );
                else
                    this._updateState();
            }
            else {
                //Hide marker while waiting for accept or denial
                this._updateState();

                //Add the map-layer as handler for default geolocation-provider
                $.workingOn();
                this.workingOn = true;
                window.geolocation.provider.add( this );
            }
        },

        /*****************************************************
        onRemove - Force follow = false
        *****************************************************/
        onRemove: function(map/*, layer*/){
            var mapIndex = nsMap.getMap(map).fcooMapIndex,
                mapInfo  = this.info[mapIndex];

            mapInfo.follow = false;
            this.saveSetting(map, mapInfo);
        },

        /*****************************************************
        setCoords
        Called by the associated GeolocationProvider when the coordinates changeds
        *****************************************************/
        setCoords: function( coords ){
            this.state = yp_allow;

            this._updateCoords(coords);
            this.firstCoordsReady = true;
        },

        /*****************************************************
        onGeolocationError
        Called by the associated GeolocationProvider when an error occur
        *****************************************************/
        onGeolocationError: function( error, coords ){
            this.state = yp_error;
            this._updateCoords(coords);
            this.closePopup();
        },

        /*****************************************************
        _getFollowSelected
        *****************************************************/
        _getFollowSelected(){
            if (L.currentPopup_map){
                var mapIndex = nsMap.getMap(L.currentPopup_map).fcooMapIndex;
                return this.info[mapIndex].follow;
            }
            return false;
        },

        /*****************************************************
        _updateState
        *****************************************************/
        _updateState(){
            var allowed = this.state == yp_allow;

            window.modernizrToggle( 'geolocation', allowed );
            this.callAllLegends(allowed ? 'setStateNormal' : 'setStateHidden');

            this.callAllLegends(this.state == yp_error ? 'showIcon' : 'hideIcon', ['warning']);

            //Update legend
            if (this.state == yp_error)
                this.hideLegendContent( false );
            else
                if (allowed)
                    this.showLegendContent();
        },

        /*****************************************************
        _updateCoords
        *****************************************************/
        _updateCoords(coords, onlyIndexOrMapId){
            var allowed = (this.state == yp_allow) && !!coords.latLng;

            if (!coords.speed || (coords.speed < .1)){  //<= MANGLER .1 skal checkes/besluttes ift. min-hastighed
                coords.speed   = TEST_MODE ? 12.34 : null;
                coords.heading = TEST_MODE ? Math.random()*360   : null;
            }
            coords.direction = coords.heading;


            // In test-mode: Imitating moving computer...
            if (allowed && TEST_MODE && !this.TEST_MODE_MOVING){
                    var __this = this,
                    _latLng = L.latLng(coords.latLng);
                    _latLng.lng = _latLng.lng + .2;

                    this.TEST_MODE_MOVING = true;
                    setTimeout( function(){
                        __this.TEST_MODE_MOVING = false;
                        __this._updateCoords( {latLng: _latLng});
                    }, 2000);
                }
            //End of test-mode

            if (allowed){
                this.updateMarker( coords, onlyIndexOrMapId );
                this.setLatLng( coords.latLng, onlyIndexOrMapId );
            }

            //Modernizr-classes
            this._updateState();
            window.modernizrToggle( 'geolocation-direction', allowed && (coords.direction !== null));

            if (this.workingOn){
                this.workingOn = false;
                $.workingOff();
            }

            if (!allowed && !this.geolocationWarningShown){
                showGeolocationWarning();
                this.geolocationWarningShown = true;
            }

            //Update all maps with follow (if any)
            var _this = this,
                firstCoordsReady = this.firstCoordsReady;
            this.firstCoordsReady = false;

            if (allowed)
                $.each( this._getAllInfoChild(), function(index, mapInfo){
                    if (mapInfo.follow)
                        _this.setCenter(mapInfo.map);
                });

            this.firstCoordsReady = this.firstCoordsReady || firstCoordsReady;
        },


        /*****************************************************
        applySetting, saveSetting - Apply/Save setting for follow on map
        *****************************************************/
        applySetting: function(setting, map, mapInfo/*, mapIndex*/){
            this.setFollow(mapInfo, setting.follow);
        },

        saveSetting: function(map, mapInfo/*, mapIndex*/){
            return mapInfo ? {follow: mapInfo.follow} : {};
        },


        /*****************************************************
        follow
        *****************************************************/
        //_popup_onOpen: Update all follow-checkbox-buttons
        _popup_onOpen: function(popup){
            this._followButton_set( this.info[popup._map.fcooMapIndex] );
        },

        //_followButton_set - Update follow-button in legend and popup
        _followButton_set: function( mapInfo ){
            if (mapInfo && mapInfo.map)
                mapInfo.map.$container.find('.your-position-follow-btn').each(function(){
                    $(this)._cbxSet( mapInfo.follow , true);
                });
        },


        _followButton_onChange: function(id, selected, $button, map){
            this.setFollow(this.info[map.fcooMapIndex], selected);
            this._saveSetting();
        },

        //setFollow - Set follow on/off and update elements
        setFollow: function( mapInfo, on = false){
            if (!mapInfo || (mapInfo.follow === on))
                return;

            var map = mapInfo.map;

            mapInfo.follow = on;

            //Update follow-button in legend and popup
            this._followButton_set( mapInfo );

            //Update color and puls of marker
            this.updateMarker({
                colorName : on ? 'your-position-follow' : 'your-position',
                thinBorder: !on,
                puls      : on
            }, map.fcooMapIndex);

            if (on){
                this.setCenter(map);

                map.on('movestart', this._check_if_follow_need_to_stop, this);
                map.on('viewreset', this._check_if_follow_need_to_stop, this);
            }
            else {
                map.off('movestart', this._check_if_follow_need_to_stop, this);
                map.off('viewreset', this._check_if_follow_need_to_stop, this);
            }

            this._saveSetting();

        },

        _check_if_follow_need_to_stop: function(event){
            var map = event.target;

            if ((this.state == yp_allow) && this.firstCoordsReady && map && !map.getCenter().equals(this.dataset.data.latLng))
                this.setFollow( this.info[ map.fcooMapIndex ], false );
        }
    });


    /***********************************************************
    Add MapLayer_YourPosition to createMapLayer
    ***********************************************************/
    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};

    var id = "YOUR_POSITION";
    nsMap.createMapLayer[id] = function(options, addMenu){
        var mapLayer = nsMap._addMapLayer(id, nsMap.MapLayer_YourPosition, MapLayer_YourPosition_options );
        addMenu( mapLayer.menuItemOptions() );
    };

}(jQuery, L, this, document));



