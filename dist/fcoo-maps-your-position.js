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
                da: 'Din placering kan ikke vises. Det kan skyldes at,<br><ul>' +
                        '<li>siden ikke har tilladelse til at vise placering</li>' +
                        '<li>din mobil/tablet/computer ikke kan bestemme placering</li>' +
                        '<li>siden ikke tilgås via <em>https</em></li>' +
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
        nsMap = ns.map = ns.map || {};


    /***********************************************************
    BsMarker_YourPosition
    Extending BsMarkerCircle with methods to set follow on/off
    ***********************************************************/
    var BsMarker_YourPosition = L.BsMarkerCircle.extend({

        niels: function(){

        }

    });


    /***********************************************************
    MapLayer_YourPosition_options
    ***********************************************************/
    var MapLayer_YourPosition_options = {
            text     : header_text,

            __legendOptions: {
                showContent: false,
                showIcons  : false,
                onWarning: showGeolocationWarning,
            },

            layerOptions: {
                constructor : BsMarker_YourPosition,
                size           : 'sm',
                markerClassName: 'show-for-geolocation',
                innerIconClass : 'fas fa-sort-up show-for-geolocation-direction',
                scaleInner     : 200,

                colorName: 'standard',//<== MANGLER skal defineres i fcoo-maps-color

                buttonList: [{
                    //Follow-buttons
                    type    : 'standardcheckboxbutton',
                    text    : {da: 'Følg', en: 'Follow'},
                    selected: false,
//HER                    onChange: function(id, selected, _this){
//HER//HER                        console.log('Følg', arguments);
//HER                    }
                }],
                inclCenterButton: true,

                popupContent        : ['latLng',             'altitude',          'velocity'],
                popupExtendedContent: ['latLng', 'accuracy', 'altitude_accuracy', 'velocity_extended'],
                extendedPopupWidth  : 180,
                legendContent       : ['latLng', 'accuracy', 'altitude_accuracy', 'velocity_extended'],




                latLng: L.latLng(55, 12),

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

/*
        var s = ns.appSetting.add({
            id          : options.id,
            callApply   : true,
            applyFunc   : function(){
                //$.proxy(this.applySetting, this)
            },
            defaultValue: {niels:'holt'}
        });

*/
        var _this = this;
        options.layerOptions.buttonList = [{
            //Follow-buttons
            type: 'standardcheckboxbutton',

class: 'NIELS',
            text: {da: 'Følg', en:  'Follow'},
            selected: false,
            onChange: this._setFollowFromCheckbocButton,
            context : _this
        }];


        nsMap.MapLayer_Marker.call(this, options);
    }

    nsMap.MapLayer_YourPosition = MapLayer_YourPosition;
    MapLayer_YourPosition.prototype = Object.create(nsMap.MapLayer_Marker.prototype);

    MapLayer_YourPosition.prototype = $.extend({}, nsMap.MapLayer_Marker.prototype, {

        _setFollowFromCheckbocButton: function(id, selected, $button, map){
            this.setFollow(map.fcooMapIndex, selected);
        },
/*
        setFollow: function( mapIndex, on){
//HER            console.log('setFollow', mapIndex, on, this.info);

            this._saveSetting();
        },
*/

        /*****************************************************
        applySetting - Apply setting for follow on map
        *****************************************************/
/*
        applySetting: function(setting, map, mapInfo, mapIndex){

//HER            console.log('applySetting', mapIndex, setting, mapInfo);

        },

        saveSetting: function(map, mapInfo, mapIndex){

//HER            console.log('saveSetting', map, mapInfo, mapIndex);

            return {
                odd: !!(mapIndex % 2),
                NR: mapIndex
            };
        },

*/

        /*****************************************************
        addTo - Extend to add this as geolocation-handler
        *****************************************************/
        addTo: function (addTo) {
            return function () {

                //Add the map-layer as handler for default geolocation-provider
                if (!this.glh_id){

                    //Hide marker whle waiting for accept or denial
                    window.modernizrToggle( 'geolocation', false );

                    $.workingOn();
                    this.workingOn = true;
                    window.geolocation.provider.add( this );
                }

                return addTo.apply(this, arguments);
            };
        } (nsMap.MapLayer_Marker.prototype.addTo),


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
//HER            console.log('onGeolocationError', error, coords );
            this._updateOnGeolocation(coords);
        },

        /*****************************************************
        _updateOnGeolocation
        *****************************************************/
        _updateOnGeolocation(coords){
            this.geolocationAllowed = !!coords.latLng;

            this.updateMarker( coords );
            this.setDataset( coords );

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
        },


        /*****************************************************
        follow
        *****************************************************/
        follow: function(){

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



