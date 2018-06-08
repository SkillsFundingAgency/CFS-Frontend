namespace calculateFunding.table.sequential {
    export function toggleExpandContainer(e: HTMLElement): void {
        let $target = $(e);

        if ($target) {
            let parentElement = $($target.parent());

            let containerElement = parentElement.parent();
            let containerChildren = containerElement.children();

            let foundTrigger: boolean = false;
            for (let i = 0; i < containerChildren.length; i++) {
                let currentElement = containerChildren[i];

                if (foundTrigger) {
                    if (currentElement.classList.contains("expander-container")) {
                        if ($target.hasClass("expander-trigger-cell-open")) {
                            $(currentElement).hide();
                        }
                        else {
                            $(currentElement).show();
                        }
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (currentElement == e.parentElement) {
                        foundTrigger = true;
                        if ($target.hasClass("expander-trigger-cell-open")) {
                            currentElement.classList.remove("expander-trigger-row-open");
                        }
                        else {
                            currentElement.classList.add("expander-trigger-row-open");
                        }
                    }
                }
            }


            if ($target.hasClass("expander-trigger-cell-open")) {
                $target.removeClass("expander-trigger-cell-open");
            }
            else {
                $target.addClass("expander-trigger-cell-open");
            }
        }
    }


$(".expander-trigger-cell").on("click", (e: JQuery.Event<HTMLElement, null>) => {
    calculateFunding.table.sequential.toggleExpandContainer(e.currentTarget);
});