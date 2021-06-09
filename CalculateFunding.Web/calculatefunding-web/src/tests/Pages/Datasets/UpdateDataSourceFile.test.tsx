import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import React from "react";
import {
    downloadValidateDatasetValidationErrorSasUrl,
    getDatasetHistoryService,
    updateDatasetService, uploadDatasetVersionService, validateDatasetService
} from "../../../services/datasetService";
import userEvent from "@testing-library/user-event";
import {UpdateDataSourceFileTestData} from "./UpdateDataSourceFileTestData";

const testData = UpdateDataSourceFileTestData();

describe("<UpdateDataSourceFile />", () => {
    beforeEach(async () => {
        testData.mockDatasetService();
        testData.mockProviderService();
        await testData.renderPage();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("service call checks ", () => {
        it("calls the correct services on initial page load", async () => {
            const {getDatasetHistoryService, downloadValidateDatasetValidationErrorSasUrl} = require('../../../services/datasetService');
            const {getCurrentProviderVersionForFundingStream } = require('../../../services/providerService');
            await waitFor(() => expect(getDatasetHistoryService).toBeCalledTimes(1));
            await waitFor(() => expect(getCurrentProviderVersionForFundingStream).toBeCalledTimes(1));
            await waitFor(() => expect(downloadValidateDatasetValidationErrorSasUrl).not.toBeCalled());
        })
    });

    describe("renders elements on initial page load ", () => {
        it("has the correct summary text", async () => {
            expect(screen.getByText("Update dataset-name (version 1)")).toBeInTheDocument();
        })

        it("has the correct last updated author name", async () => {
            const author = screen.getByTestId("update-datasource-author") as HTMLElement;
            expect(author.textContent).toContain("Joe Bloggs 1 January 2000");
        })

        it("has the correct provider data version", async () => {
            const providerDate = screen.getByTestId("provider-target-date") as HTMLElement;
            expect(providerDate.textContent).toContain("27 July 2020");
        })
    });

    describe("form submission checks ", () => {
        it("it does not displays errors on load", async () => {
            expect(screen.queryByTestId(`error-summary`)).not.toBeInTheDocument();
        });

        it("it does not displays job notification banner on load", async () => {
            expect(screen.queryByTestId(`job-notification-banner`)).not.toBeInTheDocument();
        });

        it("file error is displayed given no file has been selected ", async () => {
            await testData.submitForm();
            expect(screen.getByText("Upload a xls or xlsx file")).toBeInTheDocument();
        })

        it("file error is displayed given an invalid file has been selected ", async () => {
            const input = screen.getByLabelText(/Select data source file/);
            const file = new File(['anInvalidFile'], 'anInvalidFile.png')
            userEvent.upload(input, file);

            await testData.submitForm();

            expect(screen.getByText("Upload a xls or xlsx file")).toBeInTheDocument();
        })

        it("file error is not displayed given a file has been selected ", async () => {
            const input = screen.getByLabelText(/Select data source file/);
            const file = new File(['aValidFile'], 'aValidFile.xls')
            userEvent.upload(input, file);

            await testData.submitForm();

            expect(screen.queryByText("Upload a xls or xlsx file")).not.toBeInTheDocument();
        })

        it("change note error is not displayed given change note is not empty ", async () => {
            const changenote = await screen.findByTestId(`update-datasource-changenote`) as HTMLInputElement;
            userEvent.type(changenote, "123");

            await testData.submitForm();

            expect(screen.queryByText("Enter change note")).not.toBeInTheDocument();
        })

        it("update dataset is called given a valid form ", async () => {
            await testData.givenFormIsCompleted();

            await testData.submitForm();

            await waitFor(() => {
                const {updateDatasetService} = require('../../../services/datasetService');
                expect(updateDatasetService).toBeCalledTimes(1);
            });
        })

        it("correct services are called given a valid form ", async () => {
            const {uploadDatasetVersionService, updateDatasetService,
                validateDatasetService} = require('../../../services/datasetService');
            await testData.givenFormIsCompleted();

            await testData.submitForm();

            await waitFor(() => expect(uploadDatasetVersionService).toBeCalledTimes(1));
            await waitFor(() => expect(updateDatasetService).toBeCalledTimes(1));
            await waitFor(() => expect(validateDatasetService).toBeCalledTimes(1));
        })

        it("validation report url is retrieved given file fail validation ", async () => {
            const {downloadValidateDatasetValidationErrorSasUrl} = require('../../../services/datasetService');
            await testData.givenFormIsCompleted();

            await testData.submitForm();
            testData.hasJobValidationFailure();

            await waitFor(() => expect(downloadValidateDatasetValidationErrorSasUrl).toBeCalledTimes(1));
        })

        it("validation report url is displayed given a validation error file url is retrieved ", async () => {
            await testData.givenFormIsCompleted();

            await testData.submitForm();
            testData.hasJobValidationFailure();

            await waitFor(() => {
                const errorReportLink = screen.queryByText(`error report`) as HTMLAnchorElement;
                expect(screen.queryByText(`Validation failed`)).toBeInTheDocument();
                expect(errorReportLink.href).toContain('aTestValidationReportUrl')
            });
        })

        it("validation error is displayed given job failed with validation error information ", async () => {
            await testData.givenFormIsCompleted();
            await testData.submitForm();
            testData.hasJobFailure();
            await waitFor(() => {
                expect(screen.queryByText("Some errors")).toBeInTheDocument();
            });
        })

        it("merge confirmation is not displayed on page render ", async () => {
            expect(screen.queryByText("Do you want to treat empty cells as values when updating providers?")).not.toBeInTheDocument();
        })

        it("selecting merge displays confirmation selection ", async () => {
            const merge = await screen.findByTestId(`update-datasource-merge`) as HTMLInputElement;

            userEvent.click(merge);

            expect(screen.queryByText("Do you want to treat empty cells as values when updating providers?")).toBeInTheDocument();
        })

        it("validation error is displayed given merge options are not selected ", async () => {
            const merge = await screen.findByTestId(`update-datasource-merge`) as HTMLInputElement;
            userEvent.click(merge);

            await testData.submitForm();

            const mergeConfirmation = await screen.findByTestId(`update-type-merge-confirmation`) as HTMLDivElement;
            expect(mergeConfirmation.className).toContain("govuk-form-group--error");
        })

    });
});
