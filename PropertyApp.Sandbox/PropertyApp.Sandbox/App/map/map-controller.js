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
            esriLoader.require(['esri/Map','esri/geometry/Point'], function (Map, Point) {
                vm.map = new Map({
                    basemap: 'streets'
                });

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
                                break;

                            default:
                                if (vm.mapView.scale > 25000)
                                    vm.mapView.scale = 25000;
                                break;
                        }
                    }
                });
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
