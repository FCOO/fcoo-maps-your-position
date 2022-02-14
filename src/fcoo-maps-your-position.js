/****************************************************************************
    fcoo-maps-your-position.js,

    (c) 2021, FCOO

    https://github.com/FCOO/fcoo-maps-your-position
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";
        var header_text = {da:'Din placering', en:'Your position'};
        function showGeolocationWarning(){
            window.notyInfo({
                da: 'Din placering kan ikke vises. Det kan skyldes, at<br><ul>' +
                        '<li>Første grund kdjldfj lsd jlsd  lsdkfj sldfkj sdlfk j</li>' +
                        '<li>ANden grund dsfglj lsdj lsdj l sdflk lldskfjg ksd flgk sdlfk </li>' +
                    '</ul>',

                en: 'Your location can\'t be displayed. Possible reasons:<br><ul>' +
                        '<li>First reason</li>' +
                        '<li>Second reason</li>' +
                    '</ul>'
            }, {
                header   : header_text,
                layout   : 'center',
                textAlign: 'left',
                closeWith: ['click', 'button'],
                queue    : 'showGeolocationWarning'
            });

        }

    //Create namespaces
    var ns = window.fcoo = window.fcoo || {},
        nsMap = ns.map = ns.map || {},

        MapLayer_YourPosition_options = {
            text     : header_text,

            legendOptions: {
                showContent: false,
                showIcons  : false,
                onWarning: showGeolocationWarning,
            },

            layerOptions: {
                size          : 'sm',
                markerClassName: 'show-for-geolocation',
                innerIconClass: 'fas fa-sort-up show-for-geolocation-direction',
                scaleInner    : 200,

                colorName: 'standard',//<== MANGLER skal defineres i fcoo-maps-color

                latLng: L.latLng(55, 12),

                popupContent        : ['latLng', 'velocity'],
                extendedPopupWidth  : 180,
                popupExtendedContent: ['latLng', 'accuracy', 'altitude', 'altitudeAccuracy', 'speed', 'velocity'],
                legendContent       : ['latLng', 'accuracy', 'altitude', 'altitudeAccuracy', 'speed', 'velocity'],
            }



        };

    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};

    /***********************************************************
    MapLayer_YourPosition
    MapLayer showing marker at the position of the device
    MapLayer_YourPosition is an extention of MapLayer_Marker
    ***********************************************************/
    function MapLayer_YourPosition(options) {

        nsMap.MapLayer_Marker.call(this, options);
    }
    nsMap.MapLayer_YourPosition = MapLayer_YourPosition;

    MapLayer_YourPosition.prototype = Object.create(nsMap.MapLayer_Marker.prototype);

    MapLayer_YourPosition.prototype = $.extend({}, nsMap.MapLayer_Marker.prototype, {

        /*****************************************************
        _onAdd - Extend to add this as geolocation-handler
        *****************************************************/
        _onAdd: function (_onAdd) {
            return function (/*map, marker*/) {
                //Add the map-layer as handler for default geolocation-provider
                if (!this.glh_id){

                    //Hide marker whle waiting for accept or denial
                    window.modernizrToggle( 'geolocation', false );

                    $.workingOn();
                    this.workingOn = true;
                    window.geolocation.provider.add( this );
                }

                return _onAdd.apply(this, arguments);
            };
        } (nsMap.MapLayer_Marker.prototype._onAdd),



        /*****************************************************
        getPopupContent(id, value, extended)
        Returns the bsModal-content options for options-id = id
        This methods must be set for different versions of MapMarker
        *****************************************************/
        getPopupContent: function(id, value, extended){
            if (typeof this.geolocationAllowed != 'boolean')
                return [];

            if (id == 'info')
                return this.geolocationAllowed ? [] : {
                    type: 'textbox',
                    text: {
                        da: 'Din placering kan ikke vises.<br>Det kan skyldes, at<br><ul>' +
                                '<li>Første grund kdjldfj lsd jlsd  lsdkfj sldfkj sdlfk j</li>' +
                                '<li>ANden grund dsfglj lsdj lsdj l sdflk lldskfjg ksd flgk sdlfk </li>' +
                            '</ul>',

                        en: 'Your location can\'t be displayed.<br>Possible reasons:<br><ul>' +
                                '<li>First reason</li>' +
                                '<li>Second reason</li>' +
                            '</ul>'
                    }
                };
            else
                return this.geolocationAllowed ? this.getStandardPopupContent(id, value, extended) : [];

        },

        /*****************************************************
        setCoords
        Called by the associated GeolocationProvider when the coordinates changeds
        *****************************************************/
        setCoords: function( coords ){
            this._updateOnGeolocation(coords);
        },

        /*****************************************************
        onGeolocationError
        Called by the associated GeolocationProvider when an error occur
        *****************************************************/
        onGeolocationError: function( error, coords ){
            //console.log('onGeolocationError', error, coords );
            this._updateOnGeolocation(coords);
        },

        /*****************************************************
        _updateOnGeolocation
        *****************************************************/
        _updateOnGeolocation(coords){
            this.geolocationAllowed = !!coords.latLng;

            this.updateMarker( coords );

            if (this.geolocationAllowed){
                this.setLatLng( coords.latLng );
                this.setDirection( coords.heading );
            }

            //Modernizr-classes
            window.modernizrToggle( 'geolocation', this.geolocationAllowed );
            window.modernizrToggle( 'geolocation-direction', this.geolocationAllowed && (coords.heading !== null));
            this.callAllLegends(this.geolocationAllowed ? 'setStateNormal' : 'setStateHidden');
            this.callAllLegends(this.geolocationAllowed ? 'hideIcon' : 'showIcon', ['warning']);

            if (this.geolocationAllowed)
                this.showLegendContent( true );
            else
                this.hideLegendContent( false );

            if (this.workingOn){
                this.workingOn = false;
                $.workingOff();
            }

            if (!this.geolocationAllowed && !this.geolocationWarningShown){
                showGeolocationWarning();
                this.geolocationWarningShown = true;
            }
        }

    });


    /***********************************************************
    Add MapLayer_YourPosition to createMapLayer
    ***********************************************************/
    var id = "YOUR_POSITION";
    nsMap.createMapLayer[id] = function(options, addMenu){
        var mapLayer = nsMap._addMapLayer(id, nsMap.MapLayer_YourPosition, MapLayer_YourPosition_options );
        addMenu( mapLayer.menuItemOptions() );
    };

}(jQuery, L, this, document));



