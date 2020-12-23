import React from "react";
import {MemoryRouter} from "react-router";
import {ViewSpecificationResults} from "../../../pages/Specifications/ViewSpecificationResults";
import {render} from "@testing-library/react";
import {Route, Switch} from "react-router-dom";
import {waitFor} from "@testing-library/dom";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {testSpec} from "../../Hooks/useSpecificationSummary.test";


function renderViewSpecificationResults() {
    const {ViewSpecificationResults} = require('../../../pages/Specifications/ViewSpecificationResults');
    return render(<MemoryRouter initialEntries={[`/Specifications/ViewSpecificationResults/ABC123`]}>
        <Switch>
            <Route path="" component={ViewSpecificationResults}/>
        </Switch>
    </MemoryRouter>)
}

const mockSpecification = () => jest.spyOn(specHook, 'useSpecificationSummary')
    .mockImplementation(() => ({
        specification: testSpec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true
    }));


describe("<ViewSpecificationResults />  ", () => {
    beforeEach(() => {
        mockSpecification();
    })

    afterEach(jest.clearAllMocks);

    it("renders the page with the correct breadcrumbs", async () => {
        const {container} = renderViewSpecificationResults();

        await waitFor(() => expect(container.querySelectorAll(".govuk-breadcrumbs__list-item").length).toBe(4));
    });

    it("shows the header with text from the service call", async () => {
        const {container} = renderViewSpecificationResults();
        await waitFor(() => expect(container.querySelector("h1")?.textContent).toContain("Wizard Training"));
    });

    it("shows the sub-heading with text from the service call", async () => {
        const {container} = renderViewSpecificationResults();
        await waitFor(() => expect(container.querySelector("h2.govuk-caption-xl")?.textContent).toContain("2019-20"));
    });

    it("shows the tabs with the correct text", async () => {
        const {getByTestId} = renderViewSpecificationResults();
        await waitFor(() => expect(getByTestId("tab-fundingline-structure").textContent).toContain("Funding line structure"));
        await waitFor(() => expect(getByTestId("tab-additional-calculations").textContent).toContain("Additional Calculations"));
        await waitFor(() => expect(getByTestId("tab-downloadable-reports").textContent).toContain("Downloadable Reports"));
    });
});