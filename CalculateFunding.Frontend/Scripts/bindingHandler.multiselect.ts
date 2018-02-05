if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.multiselect2) {
    ko.bindingHandlers.multiselect2 = {
        after: ['options', 'value', 'selectedOptions', 'enable'],

        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var $element = $(element);
            var config = ko.toJS(valueAccessor());

            $element.multiselect(config);

            if (allBindings.has('options')) {
                var options = allBindings.get('options');
                if (ko.isObservable(options)) {
                    ko.computed({
                        read: function () {
                            options();
                            setTimeout(function () {
                                var ms = $element.data('multiselect');
                                if (ms)
                                    ms.updateOriginalOptions();//Not sure how beneficial this is.
                                $element.multiselect('rebuild');
                            }, 1);
                        },
                        disposeWhenNodeIsRemoved: element
                    });
                }
            }

            //value and selectedOptions are two-way, so these will be triggered even by our own actions.
            //It needs some way to tell if they are triggered because of us or because of outside change.
            //It doesn't loop but it's a waste of processing.
            if (allBindings.has('value')) {
                var value = allBindings.get('value');
                if (ko.isObservable(value)) {
                    ko.computed({
                        read: function () {
                            value();
                            setTimeout(function () {
                                $element.multiselect('refresh');
                            }, 1);
                        },
                        disposeWhenNodeIsRemoved: element
                    }).extend({ rateLimit: 100, notifyWhenChangesStop: true });
                }
            }

            // Enable and disable the control
            if (allBindings.has('enable')) {
                var enable = allBindings.get('enable');
                if (ko.isObservable(enable)) {
                    ko.computed({
                        read: function () {
                            let enabled = ko.unwrap(enable());
                            setTimeout(function () {
                                if (enabled) {
                                    $element.multiselect('enable');
                                } else {
                                    $element.multiselect('disable');
                                }
                            }, 1);
                        },
                        disposeWhenNodeIsRemoved: element
                    }).extend({ rateLimit: 100, notifyWhenChangesStop: true });
                }
            }

            //Switched from arrayChange subscription to general subscription using 'refresh'.
            //Not sure performance is any better using 'select' and 'deselect'.
            if (allBindings.has('selectedOptions')) {
                var selectedOptions = allBindings.get('selectedOptions');
                if (ko.isObservable(selectedOptions)) {
                    ko.computed({
                        read: function () {
                            selectedOptions();
                            //$element.siblings(".btn-group.open").dropdown("close");

                            setTimeout(function () {
                                $element.multiselect('refresh');
                            }, 1);
                        },
                        disposeWhenNodeIsRemoved: element
                    }).extend({ rateLimit: 100, notifyWhenChangesStop: true });
                }
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.multiselect('destroy');
            });
        },

        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var $element = $(element);
            var config = ko.toJS(valueAccessor());

            $element.multiselect('setOptions', config);
            $element.multiselect('rebuild');
        }
    };
}
