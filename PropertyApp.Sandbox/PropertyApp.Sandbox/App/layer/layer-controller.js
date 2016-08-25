(function () {
    'use strict';

    angular
        .module('app')
        .controller('LayerController', LayerController);

    LayerController.$inject = ['$scope', 'layerQueryService', 'geometryService'];

    function LayerController($scope, layerQueryService, geometryService) {
        $scope.title = 'LayerController';

        $scope.url = 'http://gis.ecan.govt.nz/arcgis/rest/services/Public/Region_Base/MapServer/6';
        $scope.outFields = '*';
        $scope.where = 'PAR_ID = 3350561';
        $scope.results = undefined;
        $scope.shape = '';
        $scope.shapetype = 'esriGeometryPoint';
        $scope.distance = 0;
        $scope.bufferShape = undefined;

        $scope.queryFeatures = function () {
            var valid = ($scope.where !== '' || $scope.shape !== '') && $scope.url !== '';

            if (valid) {
                $scope.results = undefined;
                $scope.bufferShape = undefined;

                layerQueryService.queryFeatures($scope.url, $scope.where !== '' ? $scope.where : null, $scope.shape !== '' ? $scope.shape : null, $scope.shapetype, $scope.outFields, true, null, $scope.distance).then(
                    function (res) {
                        $scope.results = res;

                        // Generate a buffer object if a distance is set
                        if (angular.isNumber($scope.distance) && $scope.distance !== 0) {
                            geometryService.bufferFeatures(res.features[0].geometry, [$scope.distance], true).then(
                                function (bufferRes) {
                                    $scope.bufferShape = bufferRes;
                                },
                                function (error) {

                                }
                            );

                        }
                    },
                    function (error) {
                        alert(error);
                    }
                );
            } else {
                alert("Please enter a 'where' expression!");
            }
        };




        $scope.viewLayerDefinition = function () {
            if ($scope.url !== '') {
                window.open($scope.url, '_blank');
            }
        }
    }
})();
