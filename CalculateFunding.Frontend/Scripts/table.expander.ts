namespace calculateFunding.table {
    export function toggleExpandContainer(e: HTMLElement): void {
        let $target = $(e);

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
    }

    export function toggleAllContainers(e: HTMLElement): void {
        let action = e.getAttribute("data-action");

        let $element = $(e);


        if (action === "expand") {
            $(".expander-trigger-cell").addClass("expander-trigger-cell-open");

            $(".expander-container").show();
            $(".cf-table-columnar-header").each((index: number, element: HTMLElement) => {

                let headerElement = $(element);
                let totalItems: number = headerElement.data("totalitems");
                if (totalItems > 0) {

                    headerElement.data("openitems", totalItems);

                    headerElement.attr("rowspan", totalItems * 2);

                }
            });

            e.firstChild.nodeValue = "Collapse all";
            e.setAttribute("data-action", "collapse");
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

            e.firstChild.nodeValue = "Expand all";
            e.setAttribute("data-action", "expand");
        }
    }
}

$(".expander-trigger-cell").on("click", (e: JQuery.Event<HTMLElement, null>) => {
    calculateFunding.table.toggleExpandContainer(e.currentTarget);
});

$("#expandCollapseAll").on("click", (e: JQuery.Event<HTMLAnchorElement, null>) => {
    calculateFunding.table.toggleAllContainers(e.target);

    e.preventDefault();
});