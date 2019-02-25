ko.virtualElements.allowedBindings.approvePublishRow = true;
ko.bindingHandlers.approvePublishRow = {
    update: function (element : HTMLElement, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        let value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        let valueUnwrapped = ko.unwrap(value);

        let td = document.createElement("td");
        let td2 = document.createElement("td")
        let td3 = document.createElement("td")
        let td4 = document.createElement("td")

        td.classList.add("border-right-hidden");
        td2.classList.add("border-right-hidden");
        td3.classList.add("border-right-hidden");
        td4.classList.add("border-right-hidden");

        let status: calculateFunding.approvals.AllocationLineStatus = valueUnwrapped.status;
        switch (status) {
            case calculateFunding.approvals.AllocationLineStatus.New:
                td.classList.add("text-center");
                td.classList.add("status-new");
                td.textContent = "New";
                break;
            case calculateFunding.approvals.AllocationLineStatus.Approved:
                td2.classList.add("text-center");
                td2.classList.add("status-approved");
                td2.textContent = "Approved";
                break;
            case calculateFunding.approvals.AllocationLineStatus.Updated:
                td3.classList.add("text-center");
                td3.classList.add("status-updated");
                td3.textContent = "Updated";
                break;
            case calculateFunding.approvals.AllocationLineStatus.Published:
                td4.classList.add("text-center");
                td4.classList.add("status-published");
                td4.textContent = "Published";
                break;
            default:
        }

        ko.virtualElements.prepend(element, td4);
        ko.virtualElements.prepend(element, td3);
        ko.virtualElements.prepend(element, td2);
        ko.virtualElements.prepend(element, td);
    }
};