(function () {
    'use strict';

    angular
        .module('app.core')
        .constant('searchSettings', {
            SERVICE_URL: 'https://canterburymaps.govt.nz/viewerwebservices/Search.ashx',
            MAX_RESULTS: 10,
            FILTER_CLASSES: 'VAL,PAR,NAM,RDI',
            FILTER_GEOTAGS: '',
            SEARCH_CLASSES: [],
            PROXY_PAGE_URL: 'proxy.ashx'
        });
})();

// 'VAL', 'PAR'
