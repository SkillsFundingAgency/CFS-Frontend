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