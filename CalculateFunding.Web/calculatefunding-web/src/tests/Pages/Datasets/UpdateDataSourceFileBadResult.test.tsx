import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import React from "react";
import {UpdateDataSourceFileTestData} from "./UpdateDataSourceFileTestData";

const testData = UpdateDataSourceFileTestData();

describe("<UpdateDataSourceFile /> with validation exception", () => {
    beforeEach(async () => {
        testData.mockDatasetServiceWithBadResult();
        testData.mockProviderService();
        await testData.renderPage();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("invalid form submission checks ", () => {
        it("Failed message is displayed given a bad result with validation error is returned ", async () => {
            await testData.givenFormIsCompleted();

            await testData.submitForm();

            await waitFor(() => {
                expect(screen.getByText(`Some Validation Error`)).toBeInTheDocument();
            });
        })
    });
});
