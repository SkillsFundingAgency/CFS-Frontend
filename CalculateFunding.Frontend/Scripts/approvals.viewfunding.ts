$("#specificationId").on("change", function (e: JQuery.Event<HTMLSelectElement, null>) {
    e.target.form.submit();
});

declare var testScenarioQueryUrl: string;

$(".expander-trigger-cell").on("click", function (e: JQuery.Event<HTMLSelectElement, null>) {
    if (typeof testScenarioQueryUrl !== "undefined" && testScenarioQueryUrl) {
        let $element = $(e.currentTarget);

        let statusKey :string= "testscenario-status";

        let status: string = $element.data(statusKey);
        if (!status) {
            let providerId: string = $element.data("providerid");
            if (providerId) {
                console.log(providerId);
                let query = $.ajax({
                    url: testScenarioQueryUrl + "/" + providerId,
                    method: 'GET',
                    type: 'json'
                });

                let $parentElement = $element.parent();
                let nextRow = $parentElement.next();
                $element.data(statusKey, "loading");

                query.done((result) => {
                    let resultTyped: IResultCountResponse = result;

                    let coverageContainer = nextRow.find(".qa-coverage-container");

                    coverageContainer.find(".data-qa-coverage").text(resultTyped.testCoverage + "%");
                    coverageContainer.find(".data-qa-passed").text(resultTyped.passed);
                    coverageContainer.find(".data-qa-totaltests").text(resultTyped.failed + resultTyped.ignored + resultTyped.passed);

                    $element.data(statusKey, "loaded");

                    nextRow.find(".qa-coverage-loading").hide();

                    coverageContainer.show();

                });

                query.fail(() => {
                    $element.data(statusKey, "failed");
                    nextRow.find(".qa-coverage-loading-failed").show();
                    nextRow.find(".qa-coverage-loading").hide();
                });
            }
        }
    }
});

interface IResultCountResponse {
    passed: number;
    failed: number;
    ignored: number;
    testCoverage: number;
}