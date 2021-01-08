import {renderHook} from "@testing-library/react-hooks";
import {act} from "react-test-renderer";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {FundingStreamWithSpecificationSelectedForFunding} from "../../types/SpecificationSelectedForFunding";
import {useOptionsForSpecificationsSelectedForFunding} from "../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import {QueryClient, QueryClientProvider} from "react-query";
import React from "react";
import {render} from "@testing-library/react";
import {QueryClientProviderTestWrapper} from "./QueryClientProviderTestWrapper";

const mockData: FundingStreamWithSpecificationSelectedForFunding[] = [
    {
        id: "WIZZ",
        name: "Wizard Funding Stream",
        periods: [
            {id: "FY20-21", name: "Period 2020-2021", specifications: [{id: "ABC123", name: "Wizard Training"}]}
        ]
    },
    {
        id: "DRK",
        name: "Dark Arts Stream",
        periods: [
            {id: "FY21-22", name: "Period 2021-2022", specifications: [{id: "ABC123", name: "Dark Arts"}]}
        ]
    }
];

describe("useOptionsForSpecificationsSelectedForFunding loads data correctly", () => {
    const mock = new MockAdapter(axios);

    beforeAll(() => {
        mock.onGet(`/api/specs/funding-selections`).reply(200, mockData);
    });
    afterAll(() => {
        mock.reset();
        jest.clearAllMocks()
    });

    it("returns data correctly", async () => {
        const {result, waitForValueToChange} = renderHook(() => useOptionsForSpecificationsSelectedForFunding({}),
            {wrapper: QueryClientProviderTestWrapper});
        await act(async () => {
            await waitForValueToChange(() => result.current.isLoadingOptions);
        });
        expect(result.current.fundingStreams).toEqual(mockData);
        expect(result.current.isLoadingOptions).toBe(false);
        expect(result.current.isErrorCheckingForOptions).toBe(false);
        expect(result.current.errorCheckingForOptions).toBe("");
    });
});
