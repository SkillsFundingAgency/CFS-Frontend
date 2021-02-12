import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import * as specificationService from "../../../services/specificationService";

const specificationId = "SPEC123";

const renderVariationManagement = () => {
    const {VariationManagement} = require('../../../components/specifications/VariationManagement');
    return render(
        <MemoryRouter initialEntries={[`/VariationManagement/${specificationId}`]}>
            <Switch>
                <Route path={`/VariationManagement/${specificationId}`}>
                    <VariationManagement
                        specificationId={specificationId}
                        addError={jest.fn()}
                        clearErrorMessages={jest.fn()}
                    />
                </Route>
            </Switch>
        </MemoryRouter>);
}

describe("<VariationManagement /> ", () => {
    it("calls getProfileVariationPointersService from the specificationService", async () => {
        await waitFor(() => {
            renderVariationManagement();
        });

        expect(getProfileVariationPointersServiceSpy).toBeCalledTimes(1);
    });
});

const getProfileVariationPointersServiceSpy = jest.spyOn(specificationService, 'getProfileVariationPointersService');
getProfileVariationPointersServiceSpy.mockResolvedValue({
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
});