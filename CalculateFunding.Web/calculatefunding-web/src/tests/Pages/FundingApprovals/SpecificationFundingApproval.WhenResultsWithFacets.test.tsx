import React from 'react';
import {act, render, screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when results with facets", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasNoActiveJobsRunning();
            test.hasFullSpecPermissions();
            test.hasSpecification();
            test.hasFundingConfigurationWithApproveAll();
            test.hasProvidersWithErrors([]);
            test.hasSearchResults([test.provider1]);
            test.renderPage();
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('renders filters', async () => {
            expect(screen.getByRole("radio", {name: "Provider name"})).toBeInTheDocument();
            expect(screen.getByRole("radio", {name: "UKPRN"})).toBeInTheDocument();
            expect(screen.getByRole("radio", {name: "UPIN"})).toBeInTheDocument();
            expect(screen.getByRole("radio", {name: "URN"})).toBeInTheDocument();
            expect(screen.getByRole("checkbox", {name: "With errors"})).toBeInTheDocument();
            expect(screen.getByRole("checkbox", {name: "Without errors"})).toBeInTheDocument();
            expect(screen.getByRole("checkbox", {name: "East London"})).toBeInTheDocument();
        });
    });
});

