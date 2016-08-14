(function () {
    'use strict';

    angular
        .module('app')
        .factory('portalQueryService', portalQueryService);

    portalQueryService.$inject = ['$http','portalSettings'];

    function portalQueryService($http, portalSettings) {
        var service = {
            getGroupDescription: getGroupDescription,
            getGroupContents: getGroupContents,
            getPortalItemDescription: getPortalItemDescription,
            getPortalItemData: getPortalItemData
        };

        return service;

        //////////////////

        /// Return a description object for the given group_id
        function getGroupDescription(group_id) {
            if (arguments.length > 0) {
                // Prepare the url call
                var url = portalSettings.BASE_PORTAL_URL + '/community/groups/' + group_id + '?callback=JSON_CALLBACK&f=json';

                // Call the groups method for the portal
                return $http.jsonp(url).then(
                    function (res) {
                        return res.data;
                    },
                    function (error) {
                        alert(error);
                    }
                );
            } else {
                return null;
            }
        };

        /// Return a content object for the given group
        function getGroupContents(group_id) {
            if (arguments.length > 0) {
                // Prepare the url call
                var url = portalSettings.BASE_PORTAL_URL + '/search?callback=JSON_CALLBACK&f=json&q=group:%22' + group_id + '%22%20AND%20type:%22Web%20Map%22&num=100';

                // Call the query method for the portal
                return $http.jsonp(url).then(
                    function (res) {
                        return res.data;
                    },
                    function (error) {
                        alert(error);
                    }
                );
            } else {
                return null;
            }
        };

        /// Return a portal item description object for the given item_id
        function getPortalItemDescription(item_id) {
            if (arguments.length > 0) {
                // Prepare the url call
                var url = portalSettings.BASE_PORTAL_URL + '/content/items/' + item_id + '/?callback=JSON_CALLBACK&f=json';

                // Call the query method for the portal
                return $http.jsonp(url).then(
                    function (res) {
                        return res.data;
                    },
                    function (error) {
                        alert(error);
                    }
                );
            } else {
                return null;
            }
        };

        /// Return a portal item data object for the given item_id
        function getPortalItemData(item_id) {
            if (arguments.length > 0) {
                // Prepare the url call
                var url = portalSettings.BASE_PORTAL_URL + '/content/items/' + item_id + '/data/?callback=JSON_CALLBACK&f=json';

                // Call the query method for the portal
                return $http.jsonp(url).then(
                    function (res) {
                        return res.data;
                    },
                    function (error) {
                        alert(error);
                    }
                );
            } else {
                return null;
            }
        };
    }
})();