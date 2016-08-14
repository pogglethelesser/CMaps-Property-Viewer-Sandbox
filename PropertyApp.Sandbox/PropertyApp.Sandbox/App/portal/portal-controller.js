(function () {
    'use strict';

    angular
        .module('app')
        .controller('PortalController', PortalController);

    PortalController.$inject = ['$scope', 'portalQueryService'];

    function PortalController($scope, portalQueryService) {
        $scope.title = 'PortalController';

        $scope.defaultGroup = '4be963328fc948528c3293c3e0bf4996';

        $scope.groupDescription = undefined;
        $scope.groupContents = undefined;
        $scope.selectedMap = undefined;

        activate();

        function activate() {
            // Call the portal to get the group description
            portalQueryService.getGroupDescription($scope.defaultGroup).then(function (group) {
                $scope.groupDescription = group;
            }, function (error) {
                $scope.groupDescription = 'Error getting group description';
            });

            // Call the portal to get the group content
            portalQueryService.getGroupContents($scope.defaultGroup).then(function (groupContents) {
                $scope.groupContents = groupContents;

                // Get the first map item in the list and set as selected item
                if (groupContents !== null && groupContents.results.length > 0) {
                    var firstMap = groupContents.results[0];

                    // Get the map definition object 
                    portalQueryService.getPortalItemData(firstMap.id).then(function (item) {
                        $scope.selectedMap = item;
                    }, function (error) {
                        $scope.selectedMap = 'Error getting map data';
                    });
                } else {
                    $scope.selectedMap = 'No Map Details Available';
                }
            }, function (error) {
                $scope.groupContents = 'Error getting group description';
                $scope.selectedMap = 'No Map Details Available';
            });
        }
    }
})();
