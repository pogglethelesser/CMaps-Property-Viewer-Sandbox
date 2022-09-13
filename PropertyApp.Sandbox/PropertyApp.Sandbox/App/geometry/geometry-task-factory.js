(function () {
    'use strict';

    angular
        .module('app')
        .factory('geometryService', geometryService);

    geometryService.$inject = ['esriLoader', '$q'];

    function geometryService(esriLoader, $q) {
        var service = {
            prepareService: prepareService,
            bufferFeatures: bufferFeatures
        };

        // Create a deferred which will assist with providing a layer instance to the other directives 
        var setupDeferred = $q.defer();

        // load the layer and task query options
        var setupRequires = function () {
            esriLoader.require(
                [
                    'esri/tasks/GeometryService',
                    'esri/tasks/support/BufferParameters',
                    "esri/geometry/Point",
                    "esri/geometry/Polyline",
                    "esri/geometry/Polygon",
                    "esri/geometry/Extent"
                ],
                function (GeometryService, BufferParameters, Point, Polyline, Polygon, Extent) {
                    /// Prepare a new geometry task
                    service._prepareGeometryTask = function () {
                        // Need to replace this with settings the defeault geometry service in the config section

                        service.geometryService =  new GeometryService({ url: "https://gis.ecan.govt.nz/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
                    };

                    /// Prepare a new bufferRequest
                    service._prepareBuffer = function (shapes, distances, unionResults, unit, bufferSpatialReference, outSpatialReference, geodesic) {
                        var bufferParams = {};

                        if (shapes !== undefined && distances != undefined) {
                            if (angular.isArray(shapes)) {
                                bufferParams.geometries = shapes;
                            } else {
                                bufferParams.geometries = [shapes];
                            }

                            // Prepare the distances array - if single value passed through use that as array otherwise apply array
                            if (typeof distances === 'number') {
                                bufferParams.distances = [distances];
                            } else {
                                bufferParams.distances = distances;
                            }

                            // Set the union results default to false
                            bufferParams.unionResults = unionResults === true;

                            // Set the distance unit - default to metres (american english == meters)
                            if (unit !== undefined) {
                                bufferParams.units = units;
                            } else {
                                bufferParams.units = "meters";
                            }

                            if (bufferSpatialReference !== undefined) {
                                bufferParams.bufferSpatialReference = bufferSpatialReference;

                                if (bufferSpatialReference === 4326 && geodesic !== undefined) {
                                    bufferParams.geodesic = geodesic === true;
                                }
                            }

                            if (outSpatialReference !== undefined) {
                                bufferParams.outSpatialReference = outSpatialReference;
                            }
                        }

                        return new BufferParameters(bufferParams);
                    };

                    service._prepareGeometryTask();

                    setupDeferred.resolve(true);
                });
        };

        setupRequires();

        return service;

        //////////////////

        /// Make sure the service is set up.
        function prepareService() {
            // return promise
            return setupDeferred.promise;
        };

        /// Perform a buffer task
        function bufferFeatures(shapes, distances, unionResults, unit, bufferSpatialReference, outSpatialReference, geodesic, callback) {
            return service.prepareService().then(
                function () {

                    if (typeof shape === 'string') {
                        shape = angular.fromJson(shape);
                    }

                    var buffer = service._prepareBuffer(shapes, distances, unionResults, unit, bufferSpatialReference, outSpatialReference, geodesic);

                    if (callback !== undefined) {
                        return service.geometryService.buffer(buffer).then(callback);
                    } else {
                        return service.geometryService.buffer(buffer).then(
                            function (results) {
                                return results;
                            },
                            function (error) {
                                return error;
                            }
                        );
                    }
                },
                function (error) {
                    alert(error);
                }
            );
        };
    }
})();