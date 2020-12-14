import React from 'react';
import {screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";

const testData = CreateSpecificationTestData();

describe("<CreateSpecification /> with duplicated specification name", () => {
    beforeEach(() => {
        testData.mockPolicyService();
        testData.mockSpecificationServiceWithDuplicateNameResponse();
        testData.mockProviderService();
        testData.mockProviderVersionService();

        testData.renderCreateSpecificationPage();
    });

    afterEach(() => jest.clearAllMocks());

    it("displays error response", async () => {
        await testData.setupSpecificationNameEntered();
        await testData.setupFundingStreamSelected();
        await testData.setupFundingPeriodSelected();
        await testData.setupCoreProviderSelected();
        await testData.setupTemplateVersionIdSelected();
        await testData.setupMoreDetailEntered();

        await testData.setupSaveButtonAct();

        expect(await screen.queryByText(/unique name error/)).toBeInTheDocument();
    });
});
