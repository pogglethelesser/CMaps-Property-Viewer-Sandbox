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

                        //vm.mapView.center.latitude = data.latitude;
                        //vm.mapView.center.longitude = data.longitude;
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
