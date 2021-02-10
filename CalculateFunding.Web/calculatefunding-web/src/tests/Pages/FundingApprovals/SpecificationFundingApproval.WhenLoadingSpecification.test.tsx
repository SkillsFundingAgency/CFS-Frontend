import React from 'react';
import {screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as redux from "react-redux";
import {FundingApprovalTestData} from "./FundingApprovalTestData";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const test = FundingApprovalTestData();

describe("<SpecificationFundingApproval />", () => {
    afterEach(() => jest.clearAllMocks());

    describe("when page initially renders before loading specification", () => {
        it('renders Specification loading', async () => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasNoActiveJobsRunning();
            test.renderPage();
            expect(await screen.getByText("Loading specification...")).toBeInTheDocument();
        });
    });

    describe("when loading specification, no active jobs", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue(test.fundingSearchSelectionState);
            test.hasNoActiveJobsRunning();
            test.hasSpecification();
            test.renderPage();
        });

        it('renders Specification details', async () => {
            expect(screen.getByTestId("specName")).toBeInTheDocument();
            expect(screen.getByTestId("specName")).toHaveTextContent(test.testSpec.name);
            expect(screen.getByTestId("fundingDetails")).toBeInTheDocument();
            expect(screen.getByTestId("fundingDetails")).toHaveTextContent(`${test.testSpec.fundingStreams[0].name} for ${test.testSpec.fundingPeriod.name}`);
        });
    });
});

