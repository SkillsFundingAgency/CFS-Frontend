$("#specificationId").on("change", function (e: JQuery.Event<HTMLSelectElement, null>) {
    e.target.form.submit();
});