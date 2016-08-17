(function () {
    'use strict';

    angular
        .module('app.core')
        .constant('events', {
            REQUEST_SEARCH: 'evt_request_search',
            CHANGE_LOCATION: 'evt_change_location',
        });
})();