import React from "react";
import {MemoryRouter} from "react-router";
import {DownloadableReports} from "../../../components/Reports/DownloadableReports";
import {act, fireEvent, render} from "@testing-library/react";
import {Route, Switch} from "react-router-dom";
import {waitFor} from "@testing-library/dom";
import {QueryClient, QueryClientProvider} from "react-query";

function renderDownloadableReports() {
    const {DownloadableReports} = require('../../../components/Reports/DownloadableReports');
    return render(<MemoryRouter initialEntries={[`/DownloadableReports/ABC123`]}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
            <Route path="/DownloadableReports/:specificationId" component={DownloadableReports}/>
        </Switch>
        </QueryClientProvider>
    </MemoryRouter>)
}

function mockSpecificationService() {
    const specificationService = jest.requireActual('../../../services/specificationService');
    return {
        ...specificationService,
        getDownloadableReportsService: jest.fn(() => Promise.resolve({
            data: [{
                specificationReportIdentifier: "123",
                name: "Report 1",
                category: "Category1",
                lastModified: "2020-12-31",
                format: "Draft",
                size: "123",
            },
                {
                    specificationReportIdentifier: "567",
                    name: "Report 2",
                    category: "Category2",
                    lastModified: "2020-12-31",
                    format: "Draft",
                    size: "456",
                }]
        }))
    }
}

function mockCalculationService() {
    const calculationService = jest.requireActual('../../../services/calculationService');
    return {
        ...calculationService,
        runGenerateCalculationCsvResultsJob: jest.fn(() => Promise.resolve({
            data: true
        }))
    }
}

describe("Provider Funding Overview ", () => {
    beforeEach(() => {
        jest.mock('../../../services/specificationService', () => mockSpecificationService());
        jest.mock('../../../services/calculationService', () => mockCalculationService());
    })

    afterEach(jest.clearAllMocks);

    it("calls the getDownloadableReportsService once", async () => {
        const {getDownloadableReportsService} = require('../../../services/specificationService');
        renderDownloadableReports();
        await waitFor(() => expect(getDownloadableReportsService).toHaveBeenCalledTimes(1));
    })

    it("shows the header with text from the service call", async () => {
        const {container} = renderDownloadableReports();
        await waitFor(() => expect(container.querySelector("h2.govuk-heading-l")?.textContent).toContain("Downloadable reports"));
    });

    it('should call the refresh function successfully', async () => {
        const {runGenerateCalculationCsvResultsJob} = require('../../../services/calculationService');
        const {getByTestId} = renderDownloadableReports();

        act(() => {
            fireEvent.click(getByTestId("refresh-button"));
        });
        await waitFor(() => expect(runGenerateCalculationCsvResultsJob).toHaveBeenCalledTimes(1));
    });

});