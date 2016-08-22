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
                'esri/symbols/SimpleFillSymbol',
                'esri/symbols/SimpleLineSymbol',
                'esri/symbols/support/jsonUtils'
            ],

            function (Map, Point, Graphic, GraphicsLayer, Symbol, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, symbolJsonUtils) {
                // Create the map - use a basic map at this stage (could be swapped out at some point to use a webmap from ArcGIS.com)
                vm.map = new Map({
                    basemap: 'streets'
                });

                // Create the location point marker symbol
                vm.locationMarkerSymbol = new PictureMarkerSymbol({
                    url: "/content/images/locationPin.png",
                    width: "33px",
                    height: "54px",
                    yoffset: "27px"
                });

                vm.propertyBoundarySymbol = new SimpleFillSymbol({
                    color: [255, 0, 0, 0],
                    style: "none",
                    outline: {  // autocasts as esri/symbols/SimpleLineSymbol
                        color: [255, 0, 0, 1],
                        width: 2,
                        style: "solid"
                    }
                });

                // Add graphics layers
                vm.propertyGraphicsLayer = new GraphicsLayer();     // Layer for displaying the boundary of the core property
                vm.propertyGraphicsLayer.masScale = 15000;          // Set a max display scale so it is not visibale an unrealistic scale - the location pin should show roughly where it is.
                vm.map.add(vm.propertyGraphicsLayer);

                vm.locationGraphicsLayer = new GraphicsLayer(); // Layer for displaying the location pin
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

                // Listener for core property shape change event
                $rootScope.$on(events.CORE_RECORD_CHANGE, function (evt, data) {
                    vm.updateCoreProperty(data);
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

                // The property record chas changed - 
                vm.updateCoreProperty = function (record) {
                    // Clear the existing graphic
                    vm.propertyGraphicsLayer.removeAll();
                    if (record !== undefined) {
                        record.symbol = vm.propertyBoundarySymbol;

                        // add the new graphic the property boundary symbol
                        vm.propertyGraphicsLayer.add(record);

                        // Zoom the map to the extent of the property - use a buffer of about 2 to make sure there is doesn't zoom to the boundary - zoom levels on map override
                        vm.mapView.extent = record.geometry.extent.clone().expand(2);
                    }
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
