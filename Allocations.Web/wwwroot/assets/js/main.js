$(document).ready(function () {
    var heading = $('.esfa-collapse .panel-heading').not('.item-detail'),
        panelCollapse = $('#esfa-list .panel-collapse'),
        expandLink = $('.accordion-toggle'),
        headingSiblings = $('.item-detail').add($('.panel-title')),
        headingText = $('panel-title'),
        summaryText = $('summary > p');

    //add the accordion functionality
    heading.click(function (e) {
        var panel = $(this).next('.panel-collapse'),
            isOpen = panel.is(':visible'),
            active = $(this).addClass('active'),
            inactive = $(this).removeClass('active');
        console.log($(e.target));
        //open or close as necessary
        panel[isOpen ? 'hide' : 'show']()
            //trigger the correct custom event
            .trigger(isOpen ? 'hide' : 'show')
        if (isOpen) {
            panel.prev(heading).removeClass('active');

        }
        else {
            panel.prev(heading).addClass('active');
        }
        //stop this to cause a page scroll
        return false;
    });
    headingSiblings.click(function (e) {
        e.stopImmediatePropagation();
    });
    summaryText.click(function (e) {
        e.stopImmediatePropagation();
    });

    // hook up the expand/collapse all
    expandLink.click(function () {
        var isAllOpen = $(this).data('isAllOpen');

        panelCollapse[isAllOpen ? 'hide' : 'show']()
            .trigger(isAllOpen ? 'hide' : 'show');
    });

    // on panels open/close, check if all open
    panelCollapse.on({
        //on panel p[em, check if all open
        show: function () {
            var isAllOpen = !panelCollapse.is(':hidden');
            if (isAllOpen) {
                expandLink.text('Close all')
                    .data('isAllOpen', true);
                heading.addClass('active');
            }
        },
        // on panel close, check if all open
        // if not all open, swap the button to expander
        hide: function () {
            var isAllOpen = !panelCollapse.is(':hidden');
            if (!isAllOpen) {
                expandLink.text('Open all')
                    .data('isAllOpen', false);
                $(this).prev(heading).removeClass('active');
            }
        }
    })
    var $filterCheckboxes = $('#esfa-filter input[type="checkbox"]');

    $filterCheckboxes.on('change', function () {

        var selectedFilters = {};

        $filterCheckboxes.filter(':checked').each(function () {

            if (!selectedFilters.hasOwnProperty(this.name)) {
                selectedFilters[this.name] = [];
            }

            selectedFilters[this.name].push(this.value);
            console.log(selectedFilters);
        });

        // create a collection containing all of the filterable elements
        var $filteredResults = $('.filtr-item');

        // loop over the selected filter name -> (array) values pairs
        $.each(selectedFilters, function (name, filterValues) {

            // filter each .flower element
            $filteredResults = $filteredResults.filter(function () {

                var matched = false,
                    currentFilterValues = $(this).data('category').split(' ');

                // loop over each category value in the current item's data-category
                $.each(currentFilterValues, function (_, currentFilterValue) {

                    // if the current category exists in the selected filters array
                    // set matched to true, and stop looping. as we're ORing in each
                    // set of filters, we only need to match once

                    if ($.inArray(currentFilterValue, filterValues) !== -1) {
                        matched = true;
                        return false;
                    }
                });

                // if matched is true the current element is returned
                return matched;

            });
        });

        $('.filtr-item').hide().filter($filteredResults).show();

    });


});