(function () {
    'use strict';

    angular
        .module('app')
        .controller('SearchboxController', SearchboxController);

    SearchboxController.$inject = ['$scope', '$rootScope', '$http', '$httpParamSerializer', '$templateCache', '$log', 'searchSettings', 'events'];

    function SearchboxController($scope, $rootScope, $http, $httpParamSerializer, $templateCache, $log, searchSettings, events) {
        $scope.title = 'SearchboxController';

        // Controller specific scope functions
        $scope.searching = false;
        $scope.query = undefined;
        $scope.selectedResult = undefined; // Actual result selected by user

        // Auto-complete Settings
        $scope.url = searchSettings.SERVICE_URL;
        $scope.filter = searchSettings.FILTER_CLASSES;
        $scope.limit = searchSettings.MAX_RESULTS;
        $scope.geotagfilter = searchSettings.FILTER_GEOTAGS;
        $scope.proxyurl = searchSettings.PROXY_PAGE_URL;
        $scope.searchClasses = searchSettings.SEARCH_CLASSES;

        activate();

        /* Executes the call to the search service to get suggestions for the type ahead 
        -------------------------------------------------------------------------------- */
        $scope.search = function (val) {
            //$log.debug($scope.title, 'Search: Start', val);

            $scope.searching = true;

            /*
            var url = $scope.url + '?' + $httpParamSerializer({
                searchclass: $scope.filter,
                searchlimit: $scope.limit,
                searchterm: val,
                searchgeotag:  $scope.geotagfilter,
                f: 'json',
                callback: 'JSON_CALLBACK'
            });

            return $http.get($scope.proxyurl + '?' + url).then(function (res) {
                var results = [];
                angular.forEach(res.data, function (item) {
                    results.push(item);
                });
                $scope.searching = false;
                return results;
            }, function (error) {
                alert(error);
                $scope.searching = false;
            });

            */

            return $http.jsonp($scope.url,
                {
                    method: 'POST',
                    params: {
                        searchclass: $scope.filter,
                        searchlimit: $scope.limit,
                        searchterm: val,
                        searchgeotag: $scope.geotagfilter,
                        f: 'pjson',
                        callback: 'JSON_CALLBACK'
                    },
                    responseType: 'json'
                }).then(function (res) {
                var results = [];
                angular.forEach(res.data.searchResults, function (item) {
                    results.push(item);
                });
                $scope.searching = false;
                return results;
            }, function (error) {
                alert(error);
                $scope.searching = false;
            });
        };

        $scope.selectFeature = function (val) {
            if (arguments.length) {
                //_selected = value;
            } else {
                //return _selected;
            }
        };

        function activate() {

            /* Called when user selects an option from the type ahead.  If option selected has a "class" value 
            that matches one in the registered search class list, emits an event with that value.  Else 
            emits event that other components can listen for e.g. map to change to the xy location from the value attributes. 
            -----------------------------------------------------------------------------------------------*/

            $scope.$watch('query', function (newValue, oldValue) {
                // Catch selection of actual search result
                if (newValue !== oldValue && newValue !== null && typeof newValue === 'object') {
                    $log.debug($scope.title, 'query value changed', newValue, oldValue);

                    // Update the selected result
                    $scope.selectedResult = newValue;

                    // Check if type of selected value is on that requires a search action
                    if ($scope.searchClasses.indexOf(newValue.value.searchclass) > -1) {
                        $log.debug($scope.title, events.REQUEST_SEARCH, newValue.value.searchclass);

                        // Emit request for search that can be picked up by listeners
                        $rootScope.$emit(events.REQUEST_SEARCH, {
                            searchClass: newValue.value.searchclass,
                            key: newValue.value.searchkey
                        });
                    }
                    else {
                        // Update the map centre coordinates if query value has numerical x and y values
                        if (newValue.value.x != '' && newValue.value.y != '') {
                            $log.debug($scope.title, events.CHANGE_LOCATION, newValue.value.x, newValue.value.y);

                            // Create location object - NOTE latitude and longitude are transposed in service response (hence switch values in object creation)
                            var location = {
                                x: newValue.value.x,
                                y: newValue.value.y,
                                srid: newValue.value.outSR,
                                latitude: newValue.value.longitude,
                                longitude: newValue.value.latitude,
                                location: newValue.label,
                                locationType: newValue.value.keydescription,
                                locationClass: newValue.value.searchclass
                            };

                            $rootScope.$emit(events.CHANGE_LOCATION, location);
                        } else {
                            $log.error($scope.title, 'Invalid Result XY', newValue.label);
                        }
                    }
                }
            });

        }
    }

})();
