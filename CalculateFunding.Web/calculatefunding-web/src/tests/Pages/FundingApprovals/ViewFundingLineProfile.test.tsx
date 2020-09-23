import React from "react";
import * as redux from "react-redux";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewFundingLineProfileProps} from "../../../pages/FundingApprovals/ViewFundingLineProfile";
import {getAllByTestId, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

describe("<ViewFundingLineProfile />", () => {
    beforeAll(() => {
        jest.mock("../../../services/publishedProviderFundingLineService", () => mockPublishedProviderFundingLineService());
    });

    describe("when user has canEditProfilePattern permission", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canEditProfilePattern: true
            }]);
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("does not show a permissions message", async () => {
            const {container} = renderPage();
            await waitFor(() => {
                expect(container.querySelector("#permission-alert-message")).not.toBeInTheDocument();
            });
        });

        it("shows the correct funding line profile values", async () => {
            const {getByTestId, getAllByTestId} = renderPage();
            await waitFor(() => {
                expect(getByTestId('funding-line-name')).toHaveTextContent("name")
                expect(getByTestId("provider-name")).toHaveTextContent("provider");
                expect(getByTestId("ukprn")).toHaveTextContent("UKPRN: 12345");
                expect(getByTestId("last-updated-by")).toHaveTextContent("Last updated by test user on 10 September 1907 0:00 am");
                expect(getByTestId("total-allocation")).toHaveTextContent("£100.00");
                expect(getByTestId("amount-already-paid")).toHaveTextContent("£50.00");
                expect(getByTestId("remaining-amount")).toHaveTextContent("£50.00");
                expect(getByTestId("balance-carried-forward")).toHaveTextContent("£50.00");
                expect(getAllByTestId("profile-total")).toHaveLength(2);
                expect(getAllByTestId("profile-total")).toMatchSnapshot();
            });
        });
    });

    describe("when user does not have canEditProfilePattern permission", () => {
        beforeAll(() => {
            useSelectorSpy.mockReturnValue([{
                fundingStreamId: "fundingStreamId",
                canEditProfilePattern: false
            }]);
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("does not show a permissions message", async () => {
            const {container} = renderPage();
            await waitFor(() => {
                expect(container.querySelector("#permission-alert-message")).not.toBeInTheDocument();
            });
        });
    })
});

const renderPage = () => {
    const {ViewFundingLineProfile} = require("../../../pages/FundingApprovals/ViewFundingLineProfile");
    return render(
        <MemoryRouter>
            <ViewFundingLineProfile match={matchMock} location={location} history={history} />
        </MemoryRouter>
    );
}

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ViewFundingLineProfileProps> = {
    params: {
        specificationId: "specId",
        providerId: "providerId",
        providerVersionId: "providerVersionId",
        fundingLineId: "fundingLineId",
        fundingPeriodId: "fundingPeriodId",
        fundingStreamId: "fundingStreamId"
    },
    path: "",
    isExact: true,
    url: ""
};

function mockPublishedProviderFundingLineService() {
    const originalService = jest.requireActual("../../../services/publishedProviderFundingLineService");
    return {
        ...originalService,
        getFundingLinePublishedProviderDetails: jest.fn(() => Promise.resolve({
            data: {
                fundingLineCode: "123",
                fundingLineName: "name",
                ukprn: "12345",
                totalAllocation: 100,
                amountAlreadyPaid: 50,
                remainingAmount: 50,
                carryOverAmount: 50,
                providerName: "provider",
                profilePatternKey: "key",
                profilePatternName: "pattern",
                profilePatternDescription: "description",
                lastUpdatedUser: {
                    id: "1",
                    name: "test user"
                },
                lastUpdatedDate: new Date(2, 2, 2020),
                profileTotalAmount: 150,
                profileTotals: [{
                    year: 2020,
                    typeValue: "April",
                    occurrence: 1,
                    value: 50,
                    periodType: "CalendarMonth",
                    isPaid: true,
                    installmentNumber: 1,
                    profileRemainingPercentage: 24.99,
                    actualDate: new Date(1, 1, 2020)
                },
                {
                    year: 2020,
                    typeValue: "April",
                    occurrence: 2,
                    value: 50,
                    periodType: "CalendarMonth",
                    isPaid: false,
                    installmentNumber: 2,
                    profileRemainingPercentage: 24.99,
                    actualDate: new Date(2, 1, 2020)
                }]
            }
        }))
    }
}
