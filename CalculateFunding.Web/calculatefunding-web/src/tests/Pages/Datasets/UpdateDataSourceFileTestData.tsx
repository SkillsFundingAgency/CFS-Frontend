import {MemoryRouter, Route, Switch} from "react-router";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import React from "react";
import * as monitor from "../../../hooks/Jobs/useJobMonitor";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import userEvent from "@testing-library/user-event";
import {UpdateNewDatasetVersionResponseViewModel} from "../../../types/Datasets/UpdateDatasetRequestViewModel";

export function UpdateDataSourceFileTestData() {

    const givenFormIsCompleted = async () => {
        const createNewVersionButton = await screen.findByTestId(`update-datasource-new`);
        userEvent.click(createNewVersionButton);
        const input = screen.getByLabelText(/Select data source file/);
        const file = new File(['aValidFile'], 'aValidFile.xls')
        userEvent.upload(input, file);
    }

    const hasJobSuccessful = async () => {
        jobMonitorSpy.mockReturnValue({
            newJob: {
                jobId: "aValidJobId",
                statusDescription: "",
                jobDescription: "",
                runningStatus: RunningStatus.Completed,
                failures: [],
                isSuccessful: true,
                isFailed: false,
                isActive: false,
                isComplete: true,
                completionStatus: CompletionStatus.Succeeded,
                outcome: "Success"
            }
        });
    }

    const hasJobFailure = async () => {
        jobMonitorSpy.mockReturnValue({
            newJob: {
                jobId: "aValidJobId",
                statusDescription: "",
                jobDescription: "",
                runningStatus: RunningStatus.Completed,
                failures: [],
                isSuccessful: false,
                isFailed: true,
                isActive: false,
                isComplete: true,
                completionStatus: CompletionStatus.Failed,
                outcome: "Some errors"
            }
        });
    }

    const hasJobValidationFailure = async () => {
        jobMonitorSpy.mockReturnValue({
            newJob: {
                jobId: "aValidJobId",
                statusDescription: "",
                jobDescription: "",
                runningStatus: RunningStatus.Completed,
                failures: [],
                isSuccessful: false,
                isFailed: true,
                isActive: false,
                isComplete: true,
                completionStatus: CompletionStatus.Failed,
                outcome: "ValidationFailed"
            }
        });
    }

    const submitForm = async () => {
        const saveButton = await screen.findByTestId(`update-datasource-save`);
        userEvent.click(saveButton);
    }

    const jobMonitorSpy = jest.spyOn(monitor, 'useJobMonitor');
    jobMonitorSpy.mockImplementation(() => {
        return {
            newJob: undefined
        }
    });

    const mockValidateDatasetService = jest.fn(() => Promise.resolve({
        status: 200,
        data: {
            operationId: "aValidId",
            currentOperation: "",
            errorMessage: "",
            lastUpdated: new Date(),
            lastUpdatedFormatted: "",
            datasetId: "",
            validationFailures: {"": [""]},
            validateDatasetJobId: "aValidJobId",
        }
    }));
    const mockValidateDatasetServiceWithBadResult = jest.fn(() => Promise.reject({
        status: 400,
        response: {
            data: {"": ["Some Validation Error"]}
        }
    }));
    const mockGetDatasetHistoryService = jest.fn(() => Promise.resolve({
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
    }));
    const mockUpdateDatasetService = jest.fn(() => Promise.resolve({
        status: 200,
        data:
            {
                "blobUrl": "https://strgt1dvcfsv2.blob.core.windows.net/datasets/b6135804-128a-4863-8f47-e6b9143ef0ca/v2/Book1.xlsx?sv=2019-07-07&sr=b&sig=WA68s76hz6DCCdku8amnF3LxsVXSHyg6q8Qzsjiq76I%3D&se=2020-11-21T11%3A46%3A04Z&sp=rw",
                "datasetId": "b6135804-128a-4863-8f47-e6b9143ef0ca",
                "author":
                    {
                        "id": "testid",
                        "name": "testuser"
                    },
                "version": 2,
                "definitionId": "1221999",
                "filename": "Book1.xlsx",
                "name": "E2E-2a27838d-d179-46f5-a9f2-40955d69041b",
                "description": "Dataset End To End",
                "fundingStreamId": "PSG",
                "mergeExisting": true
            }
    }));
    const mockUpdateNewDatasetVersionResponseViewModel: UpdateNewDatasetVersionResponseViewModel = {
        author: {name: "", id: ""},
        blobUrl: "",
        datasetId: "",
        definitionId: "",
        description: "",
        filename: "",
        fundingStreamId: "",
        mergeExisting: false,
        name: "",
        version: 0
    }
    const mockUploadDatasetVersionService = jest.fn(() => Promise.resolve({
        status: 200,
        data: {mockUpdateNewDatasetVersionResponseViewModel}
    }));
    const mockDownloadValidateDatasetValidationErrorSasUrl = jest.fn(() => Promise.resolve({
        status: 200,
        data: "aTestValidationReportUrl"
    }));
    const mockGetCurrentDatasetVersionByDatasetId = jest.fn(() => Promise.resolve({
        data: {
            "blobName": "a/very/long/blob/url/with-an-excelfile-at-the-end.xlsx",
            "version": 1,
            "lastUpdatedDate": "2000-01-01T01:00:00.00+00:00",
            "publishStatus": "Draft",
            "definition": {
                "id": "123",
                "name": "test definition"
            },
            "description": "test description",
            "author": {
                "id": "author-id",
                "name": "Author name"
            },
            "comment": "test-comment",
            "currentDataSourceRows": 999,
            "previousDataSourceRows": 0,
            "newRowCount": 0,
            "amendedRowCount": 0,
            "fundingStream":
                {
                    "id": "ABC",
                    "name": "Test Funding Strea,"
                },
            "id": "abc-123",
            "name": "test name"
        }
    }));

    const mockDatasetService = () => {
        jest.mock("../../../services/datasetService", () => {
            const service = jest.requireActual("../../../services/datasetService");
            return {
                ...service,
                validateDatasetService: mockValidateDatasetService,
                getDatasetHistoryService: mockGetDatasetHistoryService,
                updateDatasetService: mockUpdateDatasetService,
                uploadDatasetVersionService: mockUploadDatasetVersionService,
                downloadValidateDatasetValidationErrorSasUrl: mockDownloadValidateDatasetValidationErrorSasUrl,
                getCurrentDatasetVersionByDatasetId: mockGetCurrentDatasetVersionByDatasetId
            }
        });
    }

    const mockDatasetServiceWithBadResult = () => {
        jest.mock("../../../services/datasetService", () => {
            const service = jest.requireActual("../../../services/datasetService");
            return {
                ...service,
                validateDatasetService: mockValidateDatasetServiceWithBadResult,
                getDatasetHistoryService: mockGetDatasetHistoryService,
                updateDatasetService: mockUpdateDatasetService,
                uploadDatasetVersionService: mockUploadDatasetVersionService,
                downloadValidateDatasetValidationErrorSasUrl: mockDownloadValidateDatasetValidationErrorSasUrl,
                getCurrentDatasetVersionByDatasetId: mockGetCurrentDatasetVersionByDatasetId
            }
        });
    }

    const mockProviderService = () => {
        jest.mock("../../../services/providerService", () => {
            const service = jest.requireActual("../../../services/providerService");
            return {
                ...service,
                getCurrentProviderVersionForFundingStream: jest.fn(() => Promise.resolve({
                    data: {
                        name: "",
                        providerVersionId: 1,
                        description: "",
                        targetDate: new Date("2020-07-27"),
                        version: 1
                    }
                }))
            }
        });
    }

    const renderPage = async () => {
        const {UpdateDataSourceFile} = require('../../../pages/Datasets/UpdateDataSourceFile')
        const page = render(<MemoryRouter initialEntries={['/Datasets/UpdateDataSourceFile/DSG/DATASET123']}>
            <Switch>
                <Route path="/Datasets/UpdateDataSourceFile/:fundingStreamId/:datasetId"
                       component={UpdateDataSourceFile}/>
            </Switch>
        </MemoryRouter>)

        await waitFor(() => {
            expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
        });

        return page;
    }

    return {
        givenFormIsCompleted,
        hasJobSuccessful,
        hasJobFailure,
        hasJobValidationFailure,
        submitForm,
        mockDatasetService,
        mockDatasetServiceWithBadResult,
        mockProviderService,
        renderPage
    }
}
