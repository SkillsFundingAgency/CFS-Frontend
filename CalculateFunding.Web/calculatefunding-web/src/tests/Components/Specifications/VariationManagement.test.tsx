import React from "react";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as specificationService from "../../../services/specificationService";
import {MemoryRouter, Route, Switch} from "react-router";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {QueryClient, QueryClientProvider} from "react-query";

const specificationId = "SPEC123";

const renderVariationManagement = () => {
    const {VariationManagement} = require('../../../components/specifications/VariationManagement');
    return render(
        <MemoryRouter initialEntries={[`/VariationManagement/${specificationId}`]}>
            <QueryClientProvider client={new QueryClient()}>
            <Switch>
                <Route path={`/VariationManagement/${specificationId}`}>
                    <VariationManagement
                        specificationId={specificationId}
                        addError={jest.fn()}
                        clearErrorMessages={jest.fn()}
                    />
                </Route>
            </Switch>
            </QueryClientProvider>
        </MemoryRouter>);
}


const mockServices = () => {
    jest.mock("../../../services/specificationService", () => {
        const mockService = jest.requireActual("../../../services/specificationService");
        return {
            ...mockService,
            getProfileVariationPointersService: jest.fn(() => Promise.resolve({
                data: [{
                    fundingLineName: "FL One",
                    fundingLineId: "FL1",
                    profileVariationPointer: {
                        fundingStreamId: "FS1",
                        fundingLineId: "FL2",
                        periodType: "Calendar",
                        typeValue: "Monthly",
                        year: 2002,
                        occurrence: 1
                    }},
                    {
                        fundingLineName: "FL Two",
                        fundingLineId: "FL2",
                        profileVariationPointer: {
                            fundingStreamId: "FS1",
                            fundingLineId: "FL2",
                            periodType: "Calendar",
                            typeValue: "Monthly",
                            year: 2002,
                            occurrence: 1
                        }
                }],
                status: 200
            }))
        }
    });
}

    describe("<VariationManagement /> ", () => {
        beforeAll(() => {
            mockServices();
        });
        afterEach(() => {
             jest.clearAllMocks();
        });

    it("calls getProfileVariationPointersService from the specificationService", async () => {
        const {getProfileVariationPointersService} = require('../../../services/specificationService')
            await renderVariationManagement();
         await waitFor(() => expect(getProfileVariationPointersService).toBeCalledTimes(1));
    });
});

const getProfileVariationPointersServiceSpy = jest.fn(() => Promise.resolve({
    data: [
        {
            fundingLineId: "fundingLineId",
            profileVariationPointer: {
                fundingStreamId: "fundingStreamId",
                fundingLineId: "fundingLineId",
                occurrence: 2,
                periodType: "CalendarMonth",
                typeValue: "March",
                year: 2021,
            }
        }
    ],
    status: 200,
    statusText: "",
    headers: {},
    config: {}
}));
