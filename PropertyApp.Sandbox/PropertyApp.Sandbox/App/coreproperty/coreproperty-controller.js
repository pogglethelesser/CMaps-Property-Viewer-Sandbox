(function () {
    'use strict';

    angular
        .module('app')
        .controller('CorePropertyController', CorePropertyController);

    CorePropertyController.$inject = ['$scope', '$rootScope', '$log', 'searchSettings', 'events', 'layerQueryService', 'esriLoader'];

    function CorePropertyController($scope, $rootScope, $log, searchSettings, events, layerQueryService, esriLoader) {
        $scope.title = 'CorePropertyController';

        // Controller specific scope functions
        $scope.searching = false;

        // Core Property Settings
        $scope.corePropertySettings = {
            url: 'http://gis.ecan.govt.nz/arcgis/rest/services/Public/Region_Base/MapServer/6',
            outFields: '*',
            where: ''
        };

        // Holder for the results
        $scope.results = undefined;

        // Query properties
        esriLoader.require(
                    [
                        'esri/geometry/Point',
                        'esri/Graphic',
                        'esri/layers/GraphicsLayer',
                        'esri/symbols/Symbol'
                    ],
            function (Point, Graphic, GraphicsLayer, Symbol) {

                // Listener for location change event
                $rootScope.$on(events.CHANGE_LOCATION, function (evt, data) {
                    if (data !== undefined) {
                        var pt = new Point({
                            x: data.longitude,
                            y: data.latitude,
                            spatialReference: 4326
                        });

                        // Update the map scale based on the type of location passed in - not if user is currently zoomed in beyond the threshold that scale is maintained
                        switch (data.locationClass) {
                            case 'PAR':
                            case 'VAL':
                                // Query the property layer for details
                                $scope.results = undefined;
                                $scope.searching = true;
                                layerQueryService.queryFeatures($scope.corePropertySettings.url, $scope.corePropertySettings.where !== '' ? $scope.corePropertySettings.where : null, pt, 'esriGeometryPoint', $scope.corePropertySettings.outFields, true).then(
                                    function (res) {
                                        $scope.results = res;

                                        // Raise the update event
                                        $rootScope.$emit(events.CORE_RECORD_CHANGE, res.features[0]);

                                        // finish searching
                                        $scope.searching = false;
                                    },
                                    function (error) {
                                        alert(error);
                                        $scope.searching = false;
                                    }
                                );

                                break;

                            default:
                                // Do nothing
                                break;
                        }
                    }
                });
            }
        );
    }

})();
