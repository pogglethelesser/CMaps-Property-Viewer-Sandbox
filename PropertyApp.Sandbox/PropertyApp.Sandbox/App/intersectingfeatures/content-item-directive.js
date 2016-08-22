(function() {
    'use strict';

    angular
        .module('app')
        .directive('contentItem', contentItem);

    contentItem.$inject = ['$compile'];
    
    function contentItem($compile) {
        // Usage:
        //     <content-item></content-item>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'E',
            scope: {
                content: '=',
                template: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {

            element.html(getTemplate(scope.template));

            $compile(element.contents())(scope);
        }

        function getTemplate(templateDetails) {
            var template = '';

            if (templateDetails !== undefined) {
                template = templateDetails;
            }

            return template;
        };
    }

})();