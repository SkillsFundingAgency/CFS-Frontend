import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, fireEvent, getByText, render, waitFor, screen} from "@testing-library/react";
import React from "react";
import {getCurrentDatasetVersionByDatasetId, getDatasetHistoryService, updateDatasetService} from "../../../services/datasetService";

function renderUpdateDataSourceFile() {
    const {UpdateDataSourceFile} = require('../../../pages/Datasets/UpdateDataSourceFile')
    return render(<MemoryRouter initialEntries={['/Datasets/UpdateDataSourceFile/DATASET123']}>
        <Switch>
            <Route path="/Datasets/UpdateDataSourceFile/:datasetId" component={UpdateDataSourceFile}/>
        </Switch>
    </MemoryRouter>)
}



describe("<UpdateDataSourceFile /> ", () => {
    beforeAll(() => {
        function mockDatasetService() {
            const datasetService = jest.requireActual('../../../services/datasetService');
            return {
                ...datasetService,
                getDatasetHistoryService: jest.fn(() => Promise.resolve(
                    {
                        data: {
                            "results": [
                                {
                                    "id": "dataset-version-id",
                                    "datasetId": "dataset-id",
                                    "name": "dataset-name",
                                    "description": "dataset-description",
                                    "changeNote": "change-note",
                                    "version": 1,
                                    "definitionName": "defintition-name",
                                    "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                                    "lastUpdatedByName": "Joe Bloggs",
                                    "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                                    "fundingStreamId": "FUNDING-STREAM-ID",
                                    "fundingStreamName": "Funding stream name"
                                }
                            ],
                            "pageSize": 1,
                            "totalResults": 1,
                            "totalErrorResults": 0,
                            "currentPage": 1,
                            "startItemNumber": 1,
                            "endItemNumber": 1,
                            "pagerState":
                                {
                                    "displayNumberOfPages": 4,
                                    "previousPage": null,
                                    "nextPage": null,
                                    "lastPage": 1,
                                    "pages": [1],
                                    "currentPage": 1
                                },
                            "facets": null
                        }
                    }
                )),
                updateDatasetService: jest.fn(() => Promise.resolve({
                    data: {
                        "blobUrl":"https://strgt1dvcfsv2.blob.core.windows.net/datasets/b6135804-128a-4863-8f47-e6b9143ef0ca/v2/Book1.xlsx?sv=2019-07-07&sr=b&sig=WA68s76hz6DCCdku8amnF3LxsVXSHyg6q8Qzsjiq76I%3D&se=2020-11-21T11%3A46%3A04Z&sp=rw",
                        "datasetId":"b6135804-128a-4863-8f47-e6b9143ef0ca",
                        "author":
                            {
                                "id":"testid",
                                "name":"testuser"
                            },
                        "version":2,
                        "definitionId":"1221999",
                        "filename":"Book1.xlsx",
                        "name":"E2E-2a27838d-d179-46f5-a9f2-40955d69041b",
                        "description":"Dataset End To End",
                        "fundingStreamId":"PSG"
                    }
                })),
                getCurrentDatasetVersionByDatasetId: jest.fn(() => Promise.resolve({
                    data: {
                        "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                        "version":1,
                        "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                        "publishStatus":"Draft",
                        "definition":{
                            "id":"123",
                            "name":"test definition"
                        },
                        "description":"test description",
                        "author":{"id":"author-id",
                            "name":"Author name"},
                        "comment":"test-comment",
                        "currentDataSourceRows":999,
                        "previousDataSourceRows":0,
                        "newRowCount":0,
                        "amendedRowCount":0,
                        "fundingStream":
                            {
                                "id":"ABC",
                                "name":"Test Funding Strea,"
                            },
                        "id":"abc-123",
                        "name":"test name"
                    }
                })),

            }
        }

        jest.mock('../../../services/datasetService', () => mockDatasetService());
    })

    afterEach(cleanup);

    it("calls the correct services", async () => {
        const {getDatasetHistoryService} = require('../../../services/datasetService');
        renderUpdateDataSourceFile();
        await waitFor(() => expect(getDatasetHistoryService).toBeCalledTimes(1));
    })

});

describe("<UpdateDataSourceFile /> ", () => {
    beforeAll(() => {
        function mockDatasetService() {
            const datasetService = jest.requireActual('../../../services/datasetService');
            return {
                ...datasetService,
                getDatasetHistoryService: jest.fn(() => Promise.resolve(
                    {
                        data: {
                            "results": [
                                {
                                    "id": "dataset-version-id",
                                    "datasetId": "dataset-id",
                                    "name": "dataset-name",
                                    "description": "dataset-description",
                                    "changeNote": "change-note",
                                    "version": 1,
                                    "definitionName": "defintition-name",
                                    "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                                    "lastUpdatedByName": "Joe Bloggs",
                                    "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                                    "fundingStreamId": "FUNDING-STREAM-ID",
                                    "fundingStreamName": "Funding stream name"
                                }
                            ],
                            "pageSize": 1,
                            "totalResults": 1,
                            "totalErrorResults": 0,
                            "currentPage": 1,
                            "startItemNumber": 1,
                            "endItemNumber": 1,
                            "pagerState":
                                {
                                    "displayNumberOfPages": 4,
                                    "previousPage": null,
                                    "nextPage": null,
                                    "lastPage": 1,
                                    "pages": [1],
                                    "currentPage": 1
                                },
                            "facets": null
                        }
                    }
                )),
                updateDatasetService: jest.fn(() => Promise.resolve({
                    data: {
                        "blobUrl":"https://strgt1dvcfsv2.blob.core.windows.net/datasets/b6135804-128a-4863-8f47-e6b9143ef0ca/v2/Book1.xlsx?sv=2019-07-07&sr=b&sig=WA68s76hz6DCCdku8amnF3LxsVXSHyg6q8Qzsjiq76I%3D&se=2020-11-21T11%3A46%3A04Z&sp=rw",
                        "datasetId":"b6135804-128a-4863-8f47-e6b9143ef0ca",
                        "author":
                            {
                                "id":"testid",
                                "name":"testuser"
                            },
                        "version":2,
                        "definitionId":"1221999",
                        "filename":"Book1.xlsx",
                        "name":"E2E-2a27838d-d179-46f5-a9f2-40955d69041b",
                        "description":"Dataset End To End",
                        "fundingStreamId":"PSG"
                    }
                })),
                getCurrentDatasetVersionByDatasetId: jest.fn(() => Promise.resolve({
                    data: {
                        "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                        "version":1,
                        "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                        "publishStatus":"Draft",
                        "definition":{
                            "id":"123",
                            "name":"test definition"
                        },
                        "description":"test description",
                        "author":{"id":"author-id",
                            "name":"Author name"},
                        "comment":"test-comment",
                        "currentDataSourceRows":999,
                        "previousDataSourceRows":0,
                        "newRowCount":0,
                        "amendedRowCount":0,
                        "fundingStream":
                            {
                                "id":"ABC",
                                "name":"Test Funding Strea,"
                            },
                        "id":"abc-123",
                        "name":"test name"
                    }
                })),

            }
        }

        jest.mock('../../../services/datasetService', () => mockDatasetService());
    })

    afterEach(cleanup);

    it("has the relevant breadcrumbs", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item').length).toBe(4));
    });

    it("has the Calculate funding breadcrumb", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[0].textContent).toBe("Calculate funding"));
    });

    it("has the Manage data breadcrumb", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[1].textContent).toBe("Manage data"));
    });

    it("has the Manage data source files breadcrumb", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[2].textContent).toBe("Manage data source files"));
    });

    it("has the Update data source file breadcrumb", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelectorAll('.govuk-breadcrumbs__list-item')[3].textContent).toBe("Update data source file"));
    });

    it("has the Update data source H1 title", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelector('h1.govuk-fieldset__heading')?.textContent).toBe("Update data source"));
    })

    it("has the save button", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelector('#submit-datasource-file')?.textContent).toBe("Save"));
    })

    it("has the cancel link", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelector('#cancel-datasource-link')?.textContent).toBe("Cancel"));
    })

    it("has the correct summary text", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelector('#summary-text')?.textContent).toBe("dataset-name (version 1)"));
    })

    it("has the correct last updated author name", async () => {
        const {container} = renderUpdateDataSourceFile();
        await waitFor(() => expect(container.querySelector('#last-updated-by-author')?.textContent).toBe("Joe Bloggs 1 January 2000 1:00 am"));
    })
})

describe("<UpdateDataSourceFile /> ", () => {
    beforeAll(() => {
        jest.clearAllMocks();

        function mockDatasetService() {
            const datasetService = jest.requireActual('../../../services/datasetService');
            return {
                ...datasetService,
                getDatasetHistoryService: jest.fn(() => Promise.resolve(
                    {
                        data: {
                            "results": [
                                {
                                    "id": "dataset-version-id",
                                    "datasetId": "dataset-id",
                                    "name": "dataset-name",
                                    "description": "dataset-description",
                                    "changeNote": "change-note",
                                    "version": 1,
                                    "definitionName": "defintition-name",
                                    "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                                    "lastUpdatedByName": "Joe Bloggs",
                                    "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                                    "fundingStreamId": "FUNDING-STREAM-ID",
                                    "fundingStreamName": "Funding stream name"
                                }
                            ],
                            "pageSize": 1,
                            "totalResults": 1,
                            "totalErrorResults": 0,
                            "currentPage": 1,
                            "startItemNumber": 1,
                            "endItemNumber": 1,
                            "pagerState":
                                {
                                    "displayNumberOfPages": 4,
                                    "previousPage": null,
                                    "nextPage": null,
                                    "lastPage": 1,
                                    "pages": [1],
                                    "currentPage": 1
                                },
                            "facets": null
                        }
                    }
                )),
                updateDatasetService: jest.fn(() => Promise.resolve({
                    data: {
                        "blobUrl":"https://strgt1dvcfsv2.blob.core.windows.net/datasets/b6135804-128a-4863-8f47-e6b9143ef0ca/v2/Book1.xlsx?sv=2019-07-07&sr=b&sig=WA68s76hz6DCCdku8amnF3LxsVXSHyg6q8Qzsjiq76I%3D&se=2020-11-21T11%3A46%3A04Z&sp=rw",
                        "datasetId":"b6135804-128a-4863-8f47-e6b9143ef0ca",
                        "author":
                            {
                                "id":"testid",
                                "name":"testuser"
                            },
                        "version":2,
                        "definitionId":"1221999",
                        "filename":"Book1.xlsx",
                        "name":"E2E-2a27838d-d179-46f5-a9f2-40955d69041b",
                        "description":"Dataset End To End",
                        "fundingStreamId":"PSG"
                    }
                })),
                getCurrentDatasetVersionByDatasetId: jest.fn(() => Promise.resolve({
                    data: {
                        "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
                        "version":1,
                        "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
                        "publishStatus":"Draft",
                        "definition":{
                            "id":"123",
                            "name":"test definition"
                        },
                        "description":"test description",
                        "author":{"id":"author-id",
                            "name":"Author name"},
                        "comment":"test-comment",
                        "currentDataSourceRows":999,
                        "previousDataSourceRows":0,
                        "newRowCount":0,
                        "amendedRowCount":0,
                        "fundingStream":
                            {
                                "id":"ABC",
                                "name":"Test Funding Strea,"
                            },
                        "id":"abc-123",
                        "name":"test name"
                    }
                })),

            }
        }

        jest.mock('../../../services/datasetService', () => mockDatasetService());
    })

    afterEach(cleanup);

    it("calls the getDatasetHistoryService on initial load", async ()=>{
        const {getDatasetHistoryService} = require('../../../services/datasetService');

        renderUpdateDataSourceFile();
        await waitFor(() => expect(getDatasetHistoryService).toBeCalledTimes(1));
    });
});