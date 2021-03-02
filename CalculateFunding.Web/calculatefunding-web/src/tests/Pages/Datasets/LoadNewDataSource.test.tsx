import React from "react";
import * as redux from "react-redux";
import {render, waitFor, screen, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {MemoryRouter} from "react-router";
import {getFundingStreamsService} from "../../../services/policyService";
import {
    createDatasetService,
    getDatasetDefinitionsService,
    uploadDataSourceService, validateDatasetService
} from "../../../services/datasetService";
import userEvent from "@testing-library/user-event";
import * as monitor from "../../../hooks/Jobs/useJobMonitor";
import {RunningStatus} from "../../../types/RunningStatus";
import {CompletionStatus} from "../../../types/CompletionStatus";

describe("<LoadNewDataSource />", () => {
    beforeEach(async () => {
        mockPolicyService();
        mockDatasetService();
        mockProviderService();
        useSelectorSpy.mockReturnValue([
            {
                fundingStreamId: "1619",
                canUploadDataSourceFiles: false
            },
            {
                fundingStreamId: "GAG",
                canUploadDataSourceFiles: true
            }
        ]);
        await renderPage();
    });

    afterEach(() => {
        jest.clearAllMocks();
        useSelectorSpy.mockReset();
    });

    describe("service call checks ", () => {
        it("calls the correct services on initial page load", async () => {
            const {getDatasetDefinitionsService} = require('../../../services/datasetService');
            const {getFundingStreamsService} = require('../../../services/policyService');
            await waitFor(() => expect(getFundingStreamsService).toBeCalledTimes(1));
            await waitFor(() => expect(getDatasetDefinitionsService).toBeCalledTimes(1));
        })
    });

    describe("renders elements on initial page load ", () => {
        it('will have the correct breadcrumbs', async () => {
            expect(screen.getAllByTestId("breadcrumb").length).toBe(4);
        });

        it('will find the title Upload new data source', async () => {
            expect(screen.getByText("Upload new data source")).toBeInTheDocument();
        });

        it('will find the description Load a new data source file to create a dataset to use in calculations.', async () => {
            expect(screen.getByText("Load a new data source file to create a dataset to use in calculations.")).toBeInTheDocument();
        });
    });

    describe("form submission checks ", () => {
        it("displays core provider target date given a funding stream is selected", async () => {
            const {getCurrentProviderVersionForFundingStream } = require('../../../services/providerService');
            const fundingStreams = await screen.getAllByTestId("input-auto-complete")[0];
            fireEvent.change(fundingStreams, {target: {value: "GAG"}});

            fireEvent.click(screen.getByTestId("GAG"), {target: {innerText: 'GAG'}});
            await waitFor(() => {
                expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
            });

            expect(getCurrentProviderVersionForFundingStream).toBeCalledTimes(1);
            const providerDate = screen.getByTestId("provider-target-date") as HTMLElement;
            expect(providerDate.textContent).toContain("27 July 2020");
        });

        it("does not show a permissions message for funding stream where user has canUploadDataSourceFiles permission", async () => {
            const fundingStreams = await screen.getAllByTestId("input-auto-complete")[0];
            fireEvent.change(fundingStreams, {target: {value: "GAG"}});
            await waitFor(() => {
                expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
            });

            expect(screen.queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
            expect(screen.getByTestId("create-button")).not.toBeDisabled();
        });

        it("filters out funding stream where user does not have canUploadDataSourceFiles permission", async () => {
            fireEvent.change(screen.getAllByTestId("input-auto-complete")[0], {target: {value: "1619"}});
            expect(screen.queryByTestId("1619")).not.toBeInTheDocument();
        });

        it("does not submit form given form is not valid ", async () => {
            const {createDatasetService} = require('../../../services/datasetService');

            await submitForm();

            await waitFor(() => expect(createDatasetService).not.toBeCalled());
        });

        it("submits new dataset given form is valid ", async () => {
            const {createDatasetService, uploadDataSourceService,validateDatasetService} = require('../../../services/datasetService');
            await givenFormIsCompleted();

            await submitForm();

            await waitFor(() => {
                expect(createDatasetService).toBeCalledTimes(1);
                expect(uploadDataSourceService).toBeCalledTimes(1);
                expect(validateDatasetService).toBeCalledTimes(1)
            });
        });

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
                expect(screen.queryByText(`Validation failed`)).toBeInTheDocument();
                const errorReportLink = screen.getByText(`error report`) as HTMLAnchorElement;
                expect(errorReportLink.href).toContain('aTestValidationReportUrl')
            });
        })

        it("validation error is displayed given job failed with validation error information ", async () => {
            await givenFormIsCompleted();
            await submitForm();
            await sendANewJobNotificationWithErrorOutcome();
            await waitFor(() => {
                expect(screen.getByText("Some validation errors")).toBeInTheDocument();
            });
        })

    });
});

const givenFormIsCompleted = async() => {
    const fundingStreams = await screen.getAllByTestId("input-auto-complete")[0];
    fireEvent.change(fundingStreams, {target: {value: "GAG"}});
    fireEvent.click(screen.getByTestId("GAG"), {target: {innerText: 'GAG'}});
    await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const dataSheme = await screen.getAllByTestId("input-auto-complete")[1];
    fireEvent.change(dataSheme, {target: {value: "Early Years AP Census Year 1"}});
    fireEvent.click(await screen.getByTestId("Early Years AP Census Year 1"), {target: {innerText: 'Early Years AP Census Year 1'}});

    const dataSourceFileName = await screen.findByTestId(`new-datasource-filename`);
    userEvent.type(dataSourceFileName, "123");

    const dataSourceDescription = await screen.findByTestId(`new-datasource-description`);
    userEvent.type(dataSourceDescription, "123");

    const input = screen.getByLabelText(/Upload data source file/);
    const file = new File(['aValidFile'], 'aValidFile.xls')
    userEvent.upload(input, file);
}

const submitForm = async() => {
    const createButton = await screen.findByTestId(`create-button`);
    userEvent.click(createButton);
}

const sendANewJobNotification = async() => {
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
            completionStatus: CompletionStatus.Failed,
            outcome: "ValidationFailed"
        }
    });
}

const sendANewJobNotificationWithErrorOutcome = async() => {
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
            completionStatus: CompletionStatus.Failed,
            outcome: "Some validation errors"
        }
    });
}

const renderPage = async () => {
    const {LoadNewDataSource} = require("../../../pages/Datasets/LoadNewDataSource");
    const component = render(
        <MemoryRouter>
            <LoadNewDataSource />
        </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    return component;
}

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

const mockHistoryPush = jest.fn();

const mockPolicyService = () => {
    jest.mock("../../../services/policyService", () => {
        const service = jest.requireActual("../../../services/policyService");
        return {
            ...service,
            getFundingStreamsService: jest.fn(() => Promise.resolve({
                data: [
                    {
                        "shortName": "1619",
                        "id": "1619",
                        "name": "1619"
                    },
                    {
                        "shortName": "GAG",
                        "id": "GAG",
                        "name": "GAG"
                    }
                ]
            }))
        }
    });
}

const mockDatasetService = () => {
    jest.mock("../../../services/datasetService", () => {
        const service = jest.requireActual("../../../services/datasetService");
        return {
            ...service,
            getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                data: [
                    {
                        "description": "Early Years AP Census Data Year 1",
                        "fundingStreamId": "DSG",
                        "tableDefinitions": [
                            {
                                "id": "0001100",
                                "name": "Early Years AP Census Year 1",
                                "description": "Early Years AP Census Data Year 1",
                                "fieldDefinitions": [
                                    {
                                        "id": "0001103",
                                        "name": "UKPRN",
                                        "identifierFieldType": "UKPRN",
                                        "matchExpression": null,
                                        "description": "UKPRN",
                                        "type": "Integer",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001104",
                                        "name": "AP Universal Entitlement 2YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001105",
                                        "name": "AP Universal Entitlement 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001106",
                                        "name": "AP Universal Entitlement Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001107",
                                        "name": "AP Pupil Premium 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001108",
                                        "name": "AP Pupil Premium Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    }
                                ]
                            }
                        ],
                        "id": "0001099",
                        "name": "Early Years AP Census Year 1"
                    },
                    {
                        "description": "Early Years AP Census Data Year 2",
                        "fundingStreamId": "1619",
                        "tableDefinitions": [
                            {
                                "id": "0001150",
                                "name": "Early Years AP Census Year 2",
                                "description": "Early Years AP Census Data Year 2",
                                "fieldDefinitions": [
                                    {
                                        "id": "0001153",
                                        "name": "UKPRN",
                                        "identifierFieldType": "UKPRN",
                                        "matchExpression": null,
                                        "description": "UKPRN",
                                        "type": "Integer",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001154",
                                        "name": "AP Universal Entitlement 2YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001155",
                                        "name": "AP Universal Entitlement 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001156",
                                        "name": "AP Universal Entitlement Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001157",
                                        "name": "AP Pupil Premium 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001158",
                                        "name": "AP Pupil Premium Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    }
                                ]
                            }
                        ],
                        "id": "0001149",
                        "name": "Early Years AP Census Year 2"
                    }
                ]
            })),
            getDatasetDefinitionsService: jest.fn(() => Promise.resolve({
                data: [
                    {
                        "description": "Early Years AP Census Data Year 1",
                        "fundingStreamId": "DSG",
                        "tableDefinitions": [
                            {
                                "id": "0001100",
                                "name": "Early Years AP Census Year 1",
                                "description": "Early Years AP Census Data Year 1",
                                "fieldDefinitions": [
                                    {
                                        "id": "0001103",
                                        "name": "UKPRN",
                                        "identifierFieldType": "UKPRN",
                                        "matchExpression": null,
                                        "description": "UKPRN",
                                        "type": "Integer",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001104",
                                        "name": "AP Universal Entitlement 2YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001105",
                                        "name": "AP Universal Entitlement 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001106",
                                        "name": "AP Universal Entitlement Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001107",
                                        "name": "AP Pupil Premium 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001108",
                                        "name": "AP Pupil Premium Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    }
                                ]
                            }
                        ],
                        "id": "0001099",
                        "name": "Early Years AP Census Year 1"
                    },
                    {
                        "description": "Early Years AP Census Data Year 2",
                        "fundingStreamId": "1619",
                        "tableDefinitions": [
                            {
                                "id": "0001150",
                                "name": "Early Years AP Census Year 2",
                                "description": "Early Years AP Census Data Year 2",
                                "fieldDefinitions": [
                                    {
                                        "id": "0001153",
                                        "name": "UKPRN",
                                        "identifierFieldType": "UKPRN",
                                        "matchExpression": null,
                                        "description": "UKPRN",
                                        "type": "Integer",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001154",
                                        "name": "AP Universal Entitlement 2YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001155",
                                        "name": "AP Universal Entitlement 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001156",
                                        "name": "AP Universal Entitlement Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001157",
                                        "name": "AP Pupil Premium 3YO",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    },
                                    {
                                        "id": "0001158",
                                        "name": "AP Pupil Premium Rising 4",
                                        "identifierFieldType": null,
                                        "matchExpression": null,
                                        "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                        "type": "Decimal",
                                        "required": true,
                                        "min": null,
                                        "max": null,
                                        "mustMatch": null,
                                        "isAggregable": false
                                    }
                                ]
                            }
                        ],
                        "id": "0001149",
                        "name": "Early Years AP Census Year 2"
                    }
                ]
            })),
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
            createDatasetService: jest.fn(() => Promise.resolve({
                status: 200,
                data: {
                    blobUrl: "testBlobUrl",
                    datasetId: "123",
                    fundingStreamId: "DSG",
                    author:
                        {
                            id: "testid",
                            name: "testuser"
                        },
                    version: 1,
                    filename: "test"
                }
            })),
            uploadDataSourceService: jest.fn(() => Promise.resolve({
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

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const jobMonitorSpy = jest.spyOn(monitor, 'useJobMonitor');
jobMonitorSpy.mockImplementation(() => {
    return {
        newJob: undefined
    }
});