(function () {
    'use strict';

    angular
        .module('app')
        .factory('Dataset', Dataset);

    Dataset.$inject = ['layerQueryService'];

    function Dataset(layerQueryService) {
        var service = {
            id: undefined,
            url: undefined,
            title: undefined,
            displayTemplate: undefined,
            outFields: [],
            currentResult: undefined,
            createDataset: createDataset,
            getData: getData,
            clearData: clearData
        };

        return service;

        ////////////////////////////////

        function createDataset(id,url,title,displayTemplate,outFields) {
            var ds = new Dataset(layerQueryService);

            // Determine what type of feature has been supplied
            if (typeof id === 'string') {
                // settings supplied individually
                ds.id = id;
                ds.url = url;
                ds.title = title;
                ds.displayTemplate = displayTemplate;
                ds.outFields = outFields;
            } else {
                // Assume supplied as operational layer from a webmap
                ds.id = id.id;
                ds.url = id.url;
                ds.title = id.title;

                if (id.popupInfo !== undefined) {
                    // Override title with popup info  --- TODO

                    // Prepare the display template
                    if (id.popupInfo.description !== null) {
                        // Load as html - format for angular
                        ds.displayTemplate = id.popupInfo.description.replace(/{/ig, "{{content.").replace(/}/ig, "}}");
                    } else {
                        // Build a table based on the current visible attributes
                        var displayTemplate = "<table><tbody>";

                        angular.forEach(id.popupInfo.fieldInfos, function (value, key) {
                            if (value.visible) {
                                displayTemplate += "<tr><td>" + value.label + "</td><td>{{content." + value.fieldName;

                                // Check if number - add number filter if found
                                if (value.format !== undefined && value.format.places !== undefined) {
                                    displayTemplate += " | number: " + value.format.places;
                                }

                                displayTemplate += "}}</td></tr>";
                            }
                        }, displayTemplate);

                        displayTemplate += "</tbody></table>";

                        ds.displayTemplate = displayTemplate;
                    }

                    // Populate the outFields
                    angular.forEach(id.popupInfo.fieldInfos, function (value, key) {
                        if (value.visible) {
                            this.push(value);
                        }
                    }, ds.outFields);
                }
            }

            return ds;
        };

        function getData(shape, shapetype) {
            service.currentResult = null;

            if (shape !== undefined) {

                // Preprare outfields list for the query
                var outfields = [];
                angular.forEach(this.outFields, function (value, key) {
                    this.push(value.fieldName);
                }, outfields);

                return layerQueryService.queryFeatures(this.url, null, shape, shapetype, outfields, true).then(
                    function (res) {
                        service.currentResult = res;
                        return service.currentResult;
                    },
                    function (error) {
                        alert(error);
                    });
            }
            else
                return null;
        };

        function clearData() {
            service.currentResult = null;
        };
    }
})();