$(document).ready(function () {
    //accordions with open/close all button
    var heading = $('.esfa-collapse .panel-heading').not('.item-detail'),
        panelCollapse = $('#esfa-list .panel-collapse'),
        expandLink = $('.accordion-toggle'),
        headingSiblings = $('.esfa-summary .data-link').add($('.panel-title:not(.stream-title)')),
        headingText = $('panel-title'),
        summaryText = $('summary > p');
    //add the accordion functionality
    heading.click(function (e) {
        var panel = $(this).next('.panel-collapse'),
            isOpen = panel.is(':visible'),
            active = $(this).addClass('active'),
            inactive = $(this).removeClass('active');
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
    //Inner collapse
    $(".summary").on("click", function () {
        $(this).next('.details').toggle();
        $(this).toggleClass('collapsed');
    });
    //Sidebar filters
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

//Embed Ace Editor
var editor,
    editorSession,
    JavaScriptMode;
ace.require("ace/ext/language_tools");
$('.editor').each(function () {
    var JavaScriptMode = ace.require("ace/mode/vbscript").Mode;
    editor = ace.edit(this);    
    editorSession = editor.getSession();
    editorSession.setMode('ace/mode/vbscript');    
    editorSession.setUseWrapMode(true);
    editor.resize()
    editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false
        });
    editor.session.setMode(new JavaScriptMode());    
    this.style.fontSize = '16px';    
    $(this).hasClass('read-only') ? editor.setReadOnly(true) : editor.setReadOnly(false);        
    
});