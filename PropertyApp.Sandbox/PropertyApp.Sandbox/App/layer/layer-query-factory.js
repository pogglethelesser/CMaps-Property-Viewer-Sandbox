(function () {
    'use strict';

    angular
        .module('app')
        .factory('layerQueryService', layerQueryService);

    layerQueryService.$inject = ['esriLoader', '$q'];

    function layerQueryService(esriLoader, $q) {
        var service = {
            queryFeatures: queryFeatures,
            prepareService: prepareService
        };

        // Create a deferred which will assist with providing a layer instance to the other directives 
        var setupDeferred = $q.defer();

        // load the layer and task query options
        var setupRequires = function () {
            esriLoader.require(
                [
                    'esri/tasks/QueryTask',
                    'esri/tasks/support/Query',
                    "esri/geometry/Point",
                    "esri/geometry/Polyline",
                    "esri/geometry/Polygon",
                    "esri/geometry/Extent"
                ],

                function (QueryTask, Query, Point, Polyline, Polygon, Extent) {

                /// Prepare a new query task
                service._prepareQueryTask = function (url) {
                    return new QueryTask({ url: url });
                };

                /// Prepare a new query
                service._prepareQuery = function (where, shape, shapetype, outFields, returnGeometry, distance) {
                    var queryParams = {};

                    if (where !== null) {
                        queryParams.where = where;
                    }

                    if (shape !== null && shapetype !== null) {

                        var geometry = null;
                        switch (shapetype) {
                            case "esriGeometryPoint":
                                geometry = new Point(shape);
                                break;

                            case "esriGeometryPolyline":
                                geometry = new Polyline(shape);
                                break;

                            default:
                            case "esriGeometryPolygon":
                                geometry = new Polygon(shape);
                                break;
                        }

                        queryParams.geometry = geometry;
                        queryParams.geometryType = shapetype;

                        // Apply buffer distance if applicable 
                        if (distance !== undefined && angular.isNumber(distance) && distance !== 0) {
                            queryParams.distance = distance;
                        }
                    }

                    if (outFields !== undefined) {
                        if (Object.prototype.toString.call(outFields) === '[object Array]') {
                            queryParams.outFields = outFields;
                        } else {
                            if (outFields == '*') {
                                queryParams.outFields = ['*'];
                            } else {
                                // Assume its a string and split into array
                                queryParams.outFields = outFields.split(',');
                            }
                        }
                    } else {
                        queryParams.outFields = ['*'];
                    }

                    if (returnGeometry !== undefined) {
                        queryParams.returnGeometry = returnGeometry == true;
                    } else {
                        queryParams.returnGeometry = true;
                    }

                    return new Query(queryParams);
                };


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

        /// Perfrom a query task
        function queryFeatures(url, where, shape, shapetype, outFields, returnGeometry, callback, distance) {
            return service.prepareService().then(
                function () {

                    if (typeof shape === 'string') {
                        shape = angular.fromJson(shape);
                    }

                    var queryTask = service._prepareQueryTask(url);
                    var query = service._prepareQuery(where, shape, shapetype, outFields, returnGeometry, distance);

                    if (callback !== undefined) {
                        return queryTask.execute(query).then(callback);
                    } else {
                        return queryTask.execute(query).then(
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