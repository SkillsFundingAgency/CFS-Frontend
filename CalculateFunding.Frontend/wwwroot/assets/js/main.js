
$(document).ready(function () {
    //accordions with open/close all button
    var heading = $('.esfa-collapse .panel-heading').not('.item-detail'),
        panelCollapse = $('#esfa-list .panel-collapse'),
        expandLink = $('.accordion-toggle'),
        headingSiblings = $('.esfa-summary .data-link').add($('.panel-title').not('.stream-title').not('.scenario-title').not('.provider-title')),
        headingText = $('panel-title'),
        summary = $('.summary');
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
    headingSiblings.siblings().click(function (e) {
        e.stopPropagation();
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
        //not all open, swap the button to expander
        hide: function () {
            var isAllOpen = !panelCollapse.is(':hidden');
            if (!isAllOpen) {
                expandLink.text('Open all')
                    .data('isAllOpen', false);
                $(this).prev(heading).removeClass('active');
            }
        }

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

    $('#sidebar input:checkbox:checked').each(function () {
        $(this).prop('checked', false);
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
        editorSession.setMode({
            path: 'ace/mode/vbscript',
            v: Date.now() //small tweak here to update the mode constantly
        });
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
        var input = $('#calculation-engine #calculation');
        var valedit = editor.getValue();
        input.val(valedit);
        editor.getSession().on("change", function () {
            input.val(editor.getSession().getValue());;
        });
    });
    //Summary collapse
    summary.click(function () {
        $(this).siblings('.details').toggle();
        $(this).toggleClass('collapsed');
    });
    //Search functionality
    $('[data-search]').on('keyup', function () {
        var searchVal = $(this).val();
        var filterItems = $('[data-filter-item]');

        if (searchVal != '') {
            filterItems.addClass('hidden');
            $('[data-filter-item][data-filter-name*="' + searchVal.toLowerCase() + '"]').removeClass('hidden');
        } else {
            filterItems.removeClass('hidden');
        }
    });
    //Remove title margin if no siblings
    var $panelTitle = $('.panel-title');
    if ($panelTitle) {
        if ($panelTitle.siblings().length === 0) {
            $panelTitle.attr('style', 'margin-bottom: 0 !important')
        }
    }
});

$(document).on('click', '.step-btn', function (e) {
    var $this = $(this);
    var step = $this.text();
    var stepLabel = '<label>' + step + '</label><span class="remove-step glyphicon glyphicon-remove-circle pull-right"></span>';
    var $clone = $('.gherkin-step:last').clone();
    $clone.find('.step-label').html(stepLabel);
    $clone.addClass('generated');
    $('.gherkin-scenario').append($clone);
});
$(document).on('click', '.remove-step', function () {
    $(this).closest('.row').remove();
});
$(document).on('click', '.reset-btn', function () {
    var $this = $(this);
    if ($this.hasClass('remove')) {
        $('.raw-display').html('');
        $('.formatted-display').html('')
        $this.removeClass('remove').text('Reset');
        $('.generated').remove();
    } else {
        $this.addClass('remove').text('Are you sure?');
        setTimeout(function () {
            $this.removeClass('remove').text('Reset');
        }, 2000)
    }
});

$("#btn-select-year").hide();
$("#select-spec-year").change(function () {
    $("#btn-select-year").click();
});
//function initSortable() {
//    $('.steps').sortable({
//        placeholder: "ui-state-highlight",
//        items: '> .row:not(.non-sortable)',
//        helper: 'clone',
//        connectWith: '.steps',
//        activeClass: "ui-state-hover",
//        hoverClass: "ui-state-active",
//        update: function () {
//            compile();
//        }
//    }).disableSelection();
//}

$(".withjs-show").removeClass("withjs-show");
$(".withjs-hide").addClass("withjs-hide-hidden");

$(".inline-collapse-heading").on("click", function (e) {
    var headerElement = $(this);
    var containerElement = headerElement.parent();
    var bodyElement = containerElement.children(".inline-collapse-contents");

    if (headerElement.hasClass("active")) {

        headerElement.removeClass("active");
        bodyElement.addClass("withjs-hide-hidden");
    }
    else {
        headerElement.addClass("active");
        bodyElement.removeClass("withjs-hide-hidden");

    }

    return e.preventDefault();

});