(function () {
    'use strict';

    angular
        .module('app')
        .controller('MapController', MapController);

    MapController.$inject = ['esriLoader', '$scope', '$rootScope', 'events'];

    function MapController(esriLoader, $scope, $rootScope, events) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'MapController';

        activate();

        function activate() {
            esriLoader.require(
            [
                'esri/Map',
                'esri/geometry/Point',
                'esri/Graphic',
                'esri/layers/GraphicsLayer',
                'esri/symbols/Symbol',
                'esri/symbols/PictureMarkerSymbol',
                'esri/symbols/support/jsonUtils'
            ],

            function (Map, Point, Graphic, GraphicsLayer, Symbol, PictureMarkerSymbol, symbolJsonUtils) {
                // Create the map - use a basic map at this stage (could be swapped out at some point to use a webmap from ArcGIS.com)
                vm.map = new Map({
                    basemap: 'streets'
                });

                // Create the location point marker symbol
                vm.locationMarkerSymbol = PictureMarkerSymbol({
                    url: "/content/images/locationPin.png",
                    width: "33px",
                    height: "54px",
                    yoffset: "27px"
                });

                // Add graphics layer
                vm.locationGraphicsLayer = new GraphicsLayer();
                vm.map.add(vm.locationGraphicsLayer);

                // Listener for location change event
                $rootScope.$on(events.CHANGE_LOCATION, function (evt, data) {
                    if (data !== undefined) {
                        var pt = new Point({
                            x: data.longitude,
                            y: data.latitude,
                            spatialReference: 4326
                        });
                        vm.mapView.center = pt;

                        // Update the map sclae based on the type of location passed in - not if user is currently zoomed in beyond the threshold that scale is maintained
                        switch (data.locationClass) {
                            case 'PAR':
                            case 'VAL':
                                if (vm.mapView.scale > 10000)
                                    vm.mapView.scale = 10000;

                                // Update the location marker
                                vm.updateLocationPoint(pt, data.location);
                                break;

                            default:
                                // Clear any existing location markers
                                vm.locationGraphicsLayer.removeAll();
                                if (vm.mapView.scale > 25000)
                                    vm.mapView.scale = 25000;
                                break;
                        }
                    }
                });

                // Add location graphic update function
                vm.updateLocationPoint = function (pt, locationname) {
                    // Clear the existing graphic
                    vm.locationGraphicsLayer.removeAll();

                    // add a new graphic using the pt as a location and the location marker symbol
                    var graphic = new Graphic(
                        { geometry: pt, symbol: vm.locationMarkerSymbol, attributes: { address: locationname } }
                        );

                    vm.locationGraphicsLayer.add(graphic);
                };
            });

            vm.onViewCreated = function (view) {
                vm.mapView = view;
                // Setup a JSAPI 4.x property watch outside of Angular and update bound Angular controller properties.
                vm.mapView.watch('center,scale,zoom,rotation', function () {
                    $scope.$applyAsync('vm.mapView');
                });
            };
        }
    }
})();
