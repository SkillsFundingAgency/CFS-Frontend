$("#policy-jump").on("change", (e: JQuery.Event<HTMLSelectElement, null>) => {
    if (e) {
        if (e.target) {
            if (e.target.value) {
                let anchorName = "policy-" + e.target.value;
                let element = document.querySelector("a[name='" + anchorName + "']");
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: "start", inline: "start" });
                }
            }
        }
    }
});

$(".expander-trigger-cell").on("click", (e: JQuery.Event<HTMLElement, null>) => {
    let $target = $(e.currentTarget);

    if ($target) {
        let parentElement = $($target.parent());
        let expanderContainer = parentElement.next(".expander-container");

        let multiRowHeaderElementId: string = $target.data("multi-row-header");

        let alterMultipleRowHeader: boolean = false;
        let multiRowHeaderElement;
        let currentRowSpan = 0;
        let totalItems = 0;
        let openItems = 0;

        if (multiRowHeaderElementId) {
            multiRowHeaderElement = $("#" + multiRowHeaderElementId);
            if (multiRowHeaderElement) {
                totalItems = multiRowHeaderElement.data("totalitems");
                openItems = multiRowHeaderElement.data("openitems");

                currentRowSpan = totalItems + openItems;
                if (currentRowSpan > 0) {
                    alterMultipleRowHeader = true;
                }
            }
        }

        if ($target.hasClass("expander-trigger-cell-open")) {

            $target.removeClass("expander-trigger-cell-open");
            expanderContainer.hide();

            if (alterMultipleRowHeader) {
                openItems = openItems - 1;
                let newRowspan = openItems + totalItems;
                multiRowHeaderElement.attr("rowspan", newRowspan);
                multiRowHeaderElement.data("openitems", openItems)
            }
        }
        else {

            $target.addClass("expander-trigger-cell-open");
            expanderContainer.show();

            if (alterMultipleRowHeader) {
                openItems = openItems + 1;
                let newRowspan = openItems + totalItems;
                multiRowHeaderElement.attr("rowspan", newRowspan);
                multiRowHeaderElement.data("openitems", openItems)
            }
        }
    }

});

$("#expandCollapseAll").on("click", (e: JQuery.Event<HTMLAnchorElement, null>) => {
    let $element = $(e.target);

    let action = e.target.getAttribute("data-action");

    if (action === "expand") {
        $(".expander-trigger-cell").addClass("expander-trigger-cell-open");

        $(".expander-container").show();
        $(".cf-table-columnar-header").each((index: number, element: HTMLElement) => {
            $element = $(element);
            let totalItems: number = $element.data("totalitems");
            if (totalItems > 0) {

                $element.data("openitems", totalItems);

                $element.attr("rowspan", totalItems * 2);

            }
        });

        e.target.firstChild.nodeValue = "Collapse all";
        e.target.setAttribute("data-action", "collapse");
    }
    else if (action === "collapse") {


        $(".expander-trigger-cell").removeClass("expander-trigger-cell-open");

        $(".expander-container").hide();
        $(".cf-table-columnar-header").each((index: number, element: HTMLElement) => {
            $element = $(element);
            let totalItems: number = $element.data("totalitems");
            if (totalItems > 0) {

                $element.data("openitems", 0);

                $element.attr("rowspan", totalItems);

            }
        });


        e.target.firstChild.nodeValue = "Expand all";
        e.target.setAttribute("data-action", "expand");
    }

    e.preventDefault();
});