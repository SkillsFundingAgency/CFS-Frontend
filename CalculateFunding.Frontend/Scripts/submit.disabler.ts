$(":submit").on("click", function (event: JQuery.Event<HTMLSelectElement, null>) {
    $(this).prop('disabled', true);
    event.target.form.submit();
});