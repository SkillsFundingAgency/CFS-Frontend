import {MemoryRouter, Route, Switch} from "react-router";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import React from "react";
import {
    downloadValidateDatasetValidationErrorSasUrl,
    getDatasetHistoryService,
    updateDatasetService, uploadDatasetVersionService, validateDatasetService
} from "../../../services/datasetService";
import * as monitor from "../../../hooks/Jobs/useJobMonitor";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";
import userEvent from "@testing-library/user-event";

describe("<UpdateDataSourceFile />", () => {
    beforeEach(async () => {
        mockDatasetService();
        await renderUpdateDataSourceFile();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("service call checks ", () => {
        it("calls the correct services on initial page load", async () => {
            const {getDatasetHistoryService, downloadValidateDatasetValidationErrorSasUrl} = require('../../../services/datasetService');
            await waitFor(() => expect(getDatasetHistoryService).toBeCalledTimes(1));
            await waitFor(() => expect(downloadValidateDatasetValidationErrorSasUrl).not.toBeCalled());
        })
    });

    describe("renders elements on initial page load ", () => {
        it("has the correct summary text", async () => {
            expect(screen.getByText("dataset-name (version 1)")).toBeInTheDocument();
        })

        it("has the correct last updated author name", async () => {
            const author = screen.getByTestId("update-datasource-author") as HTMLElement;
            expect(author.textContent).toContain("Joe Bloggs 1 January 2000");
        })
    });

    describe("form submission checks ", () => {
        it("it does not displays errors on load", async () => {
            expect(screen.queryByTestId(`error-summary`)).not.toBeInTheDocument();
        });

        it("file error is displayed given no file has been selected ", async () => {
            await submitForm();
            expect(await screen.getByText("Upload a xls or xlsx file")).toBeInTheDocument();
        })

        it("file error is displayed given an invalid file has been selected ", async () => {
            const input = screen.getByLabelText(/Select data source file/);
            const file = new File(['anInvalidFile'], 'anInvalidFile.png')
            userEvent.upload(input, file);

            await submitForm();

            expect(await screen.getByText("Upload a xls or xlsx file")).toBeInTheDocument();
        })

        it("file error is not displayed given a file has been selected ", async () => {
            const input = screen.getByLabelText(/Select data source file/);
            const file = new File(['aValidFile'], 'aValidFile.xls')
            userEvent.upload(input, file);

            await submitForm();

            expect(screen.queryByText("Upload a xls or xlsx file")).not.toBeInTheDocument();
        })

        it("change note error is not displayed given change note is not empty ", async () => {
            const changenote = await screen.findByTestId(`update-datasource-changenote`) as HTMLInputElement;
            userEvent.type(changenote, "123");

            await submitForm();

            expect(screen.queryByText("Enter change note")).not.toBeInTheDocument();
        })

        it("update dataset is called given a valid form ", async () => {
            await givenFormIsCompleted();

            await submitForm();

            await waitFor(() => {
                const {updateDatasetService} = require('../../../services/datasetService');
                expect(updateDatasetService).toBeCalledTimes(1);
            });
        })

        it("correct services are called given a valid form ", async () => {
            const {uploadDatasetVersionService, updateDatasetService,
                validateDatasetService} = require('../../../services/datasetService');
            await givenFormIsCompleted();

            await submitForm();

            await waitFor(() => expect(uploadDatasetVersionService).toBeCalledTimes(1));
            await waitFor(() => expect(updateDatasetService).toBeCalledTimes(1));
            await waitFor(() => expect(validateDatasetService).toBeCalledTimes(1));
        })

        it("validation report url is retrieved given file fail validation ", async () => {
            const {downloadValidateDatasetValidationErrorSasUrl} = require('../../../services/datasetService');
            await givenFormIsCompleted();

            await submitForm();
            await sendANewJobNotification();

            await waitFor(() => expect(downloadValidateDatasetValidationErrorSasUrl).toBeCalledTimes(1));
        })

        it("validation report url is displayed given a validation error file url is retrieved ", async () => {
            await givenFormIsCompleted();

            await submitForm();
            await sendANewJobNotification();

            await waitFor(() => {
                const errorReportLink = screen.queryByText(`error report`) as HTMLAnchorElement;
                expect(screen.queryByText(`Validation failed`)).toBeInTheDocument();
                expect(errorReportLink.href).toContain('aTestValidationReportUrl')
            });
        })
    });
});

const givenFormIsCompleted = async() =>
{
    const createNewVersionButton = await screen.findByTestId(`update-datasource-new`);
    userEvent.click(createNewVersionButton);
    const input = screen.getByLabelText(/Select data source file/);
    const file = new File(['aValidFile'], 'aValidFile.xls')
    userEvent.upload(input, file);
}

const sendANewJobNotification = async() =>
{
    jobMonitorSpy.mockReturnValue({
        newJob: {
            jobId: "aValidJobId",
            statusDescription: "",
            jobDescription: "",
            runningStatus: RunningStatus.Completed,
            failures: [],
            isSuccessful: false,
            isFailed: false,
            isActive: false,
            isComplete: true,
            completionStatus: CompletionStatus.Succeeded,
            outcome: "ValidationFailed"
        }
    });
}

const submitForm = async() =>
{
    const saveButton = await screen.findByTestId(`update-datasource-save`);
    userEvent.click(saveButton);
}

const jobMonitorSpy = jest.spyOn(monitor, 'useJobMonitor');
jobMonitorSpy.mockImplementation(() => {
    return {
        newJob: undefined
    }
});

const mockDatasetService = () => {
    jest.mock("../../../services/datasetService", () => {
        const service = jest.requireActual("../../../services/datasetService");
        return {
            ...service,
            getDatasetHistoryService: jest.fn(() => Promise.resolve({
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
            })),
            updateDatasetService: jest.fn(() => Promise.resolve({
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
            })),
            uploadDatasetVersionService: jest.fn(() => Promise.resolve({
                status: 200
            })),
            validateDatasetService: jest.fn(() => Promise.resolve({
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
            })),
            downloadValidateDatasetValidationErrorSasUrl: jest.fn(() => Promise.resolve({
                status: 200,
                data: "aTestValidationReportUrl"
            })),
            getCurrentDatasetVersionByDatasetId: jest.fn(() => Promise.resolve({
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
            })),
        }
    });
}

const renderUpdateDataSourceFile = async () => {
    const {UpdateDataSourceFile} = require('../../../pages/Datasets/UpdateDataSourceFile')
    const component =  render(<MemoryRouter initialEntries={['/Datasets/UpdateDataSourceFile/DSG/DATASET123']}>
        <Switch>
            <Route path="/Datasets/UpdateDataSourceFile/:fundingStreamId/:datasetId" component={UpdateDataSourceFile}/>
        </Switch>
    </MemoryRouter>)

    await waitFor(() => {
        expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
    });
    return component;
}

