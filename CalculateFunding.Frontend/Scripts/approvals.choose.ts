$("#fundingPeriod").on("change", function (e: JQuery.Event<HTMLSelectElement, null>) {
    e.target.form.submit();
});

$("#fundingStream").on("change", function (e: JQuery.Event<HTMLSelectElement, null>) {
    e.target.form.submit();
});