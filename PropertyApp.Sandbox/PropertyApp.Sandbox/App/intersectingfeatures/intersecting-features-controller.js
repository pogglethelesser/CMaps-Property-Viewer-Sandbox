(function () {
    'use strict';

    angular
        .module('app')
        .controller('IntersectingFeaturesController', IntersectingFeaturesController);

    IntersectingFeaturesController.$inject = ['$scope', '$rootScope', 'layerQueryService', 'portalQueryService', 'landSearchSettings', 'Dataset', 'events'];

    function IntersectingFeaturesController($scope, $rootScope, layerQueryService, portalQueryService, landSearchSettings, Dataset, events) {
        $scope.title = 'IntersectingFeaturesController';

        $scope.urban_onproperty_map = undefined;

        $scope.loaded = false;
        $scope.searching = false;
        $scope.populated = false;

        // Listener for core property shape change event
        $rootScope.$on(events.CORE_RECORD_CHANGE, function (evt, data) {
            queryLayers(data);
        });

        activate();

        function activate() {
            // Get the webmap defintions for the intersecting land queries 
            getWebMaps();
        };

        // Load the web maps from the system to get the definitons of the layers to query
        function getWebMaps() {
            // Get the urban map
            var map = portalQueryService.getPortalItemData(landSearchSettings.URBAN_ONPROPERTY_DETAILS_MAP).then(
                function (data) {
                    $scope.urban_onproperty_map = [];

                    angular.forEach(data.operationalLayers, function (value, key) {
                        this.push(Dataset.createDataset(value));
                    }, $scope.urban_onproperty_map);

                    updateLoadState();
                },
                function (error) {
                    alert(error);
                }
            );
        };

        // Update the load state
        function updateLoadState() {
            $scope.loaded = $scope.urban_onproperty_map != undefined;
        };

        // Query the loaded features and update the result sets
        function queryLayers(record) {
            // Make sure settings have loaded
            if ($scope.loaded == false)
                return;

            if (record !== undefined) {
                // Clear the result set
                angular.forEach($scope.urban_onproperty_map, function (value, key) {
                    value.getData(record.geometry).then(
                        function (res) {
                            // Do something here
                        },
                        function (error) {

                        }
                    );
                });
            } else {
                // Clear the result set
                angular.forEach($scope.urban_onproperty_map, function (value, key) {
                    value.clearData();
                });
            }
        }

    }
})();
