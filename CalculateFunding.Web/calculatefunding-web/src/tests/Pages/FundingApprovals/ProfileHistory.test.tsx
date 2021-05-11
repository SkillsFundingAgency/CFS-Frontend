import {createLocation, createMemoryHistory} from "history";
import React from "react";
import * as ReactQuery from "react-query";
import {match, MemoryRouter} from "react-router";
import {ProfileHistoryProps} from "../../../pages/FundingApprovals/ProfileHistory";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {FundingLineChangeViewModel} from "../../../types/PublishedProvider/FundingLineProfile";

const useQuerySpy = jest.spyOn(ReactQuery, 'useQuery');
jest.mock("../../../components/AdminNav");

describe("<ProfileHistory />", () => {
    afterAll(() => {
        useQuerySpy.mockClear();
    });

    it("renders loading status when loading", async () => {
        setUpMockApiResponse({data: fundingLineChangeViewModel, isLoading: true, isError: false});
        const {getByTestId} = renderPage();
        expect(getByTestId("loader")).toBeInTheDocument();
    });

    it("does not render loading status when not loading", async () => {
        setUpMockApiResponse({data: fundingLineChangeViewModel, isLoading: false, isError: false});
        const {queryByTestId} = renderPage();
        expect(queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("renders error message if error occurs during loading", async () => {
        setUpMockApiResponse({data: fundingLineChangeViewModel, isLoading: false, isError: true, error: {message: "An error occurred"}});
        const {getByText} = renderPage();
        expect(getByText("There is a problem")).toBeInTheDocument();
        expect(getByText("Profiling history could not be loaded. An error occurred.")).toBeInTheDocument();
    });

    it("does not render error when no errors occurs during loading", async () => {
        setUpMockApiResponse({data: fundingLineChangeViewModel, isLoading: false, isError: false});
        const {queryByText} = renderPage();
        expect(queryByText("There is a problem")).not.toBeInTheDocument();
    });

    it("renders correct number of accordion panels", async () => {
        setUpMockApiResponse({data: fundingLineChangeViewModel, isLoading: false, isError: false});
        const {getAllByRole} = renderPage();
        expect(getAllByRole("region").length).toBe(2);
    });
});

const renderPage = () => {
    const {ProfileHistory} = require("../../../pages/FundingApprovals/ProfileHistory");
    return render(
        <MemoryRouter>
            <ProfileHistory match={matchMock} location={location} history={history} />
        </MemoryRouter>
    );
}

function setUpMockApiResponse(useQueryProfileHistoryResponse: any) {
    // @ts-ignore
    useQuerySpy.mockReturnValueOnce(useQueryProfileHistoryResponse);
}

const fundingLineChangeViewModel: FundingLineChangeViewModel = {
    providerName: "providerName",
    specificationName: "specificationName",
    fundingPeriodName: "fundingPeriodName",
    fundingLineChanges: [{
        fundingLineTotal: 1000,
        previousFundingLineTotal: 1000,
        fundingStreamName: "fundingStreamName",
        fundingLineName: "fundingLineName",
        carryOverAmount: 500,
        lastUpdatedUser: {id: "1", name: "testuser"},
        lastUpdatedDate: new Date(2020, 1, 11),
        profileTotals: [{
            year: 2020,
            typeValue: "April",
            occurrence: 1,
            value: 500,
            periodType: "CalendarMonth",
            isPaid: true,
            installmentNumber: 1,
            distributionPeriodId: "period",
            actualDate: new Date(1, 1, 2020)
        },
        {
            year: 2020,
            typeValue: "May",
            occurrence: 1,
            value: 500,
            periodType: "CalendarMonth",
            isPaid: false,
            installmentNumber: 2,
            profileRemainingPercentage: 100,
            distributionPeriodId: "period",
            actualDate: new Date(2, 1, 2020)
        }]
    },
    {
        fundingLineTotal: 1000,
        previousFundingLineTotal: 1000,
        fundingStreamName: "fundingStreamName",
        fundingLineName: "fundingLineName",
        carryOverAmount: 500,
        lastUpdatedUser: {id: "1", name: "testuser"},
        lastUpdatedDate: new Date(2020, 1, 11),
        profileTotals: [{
            year: 2020,
            typeValue: "April",
            occurrence: 1,
            value: 500,
            periodType: "CalendarMonth",
            isPaid: true,
            installmentNumber: 1,
            distributionPeriodId: "period",
            actualDate: new Date(1, 1, 2020)
        },
        {
            year: 2020,
            typeValue: "May",
            occurrence: 1,
            value: 500,
            periodType: "CalendarMonth",
            isPaid: false,
            installmentNumber: 2,
            profileRemainingPercentage: 100,
            distributionPeriodId: "period",
            actualDate: new Date(2, 1, 2020)
        }]
    }]
}

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ProfileHistoryProps> = {
    params: {
        specificationId: "specId",
        providerId: "providerId",
        providerVersionId: "providerVersionId",
        fundingLineCode: "fundingLineCode",
        fundingStreamId: "fundingStreamId",
        fundingPeriodId: "fundingPeriodId"
    },
    path: "",
    isExact: true,
    url: ""
};
