import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

const renderVariationManagement = () => {
    const {VariationManagement} = require('../../../components/Specifications/VariationManagement');
    return render(<MemoryRouter initialEntries={['/VariationManagement/SPEC123']}>
        <Switch>
            <Route path="/VariationManagement/:specificationId" component={VariationManagement}/>
        </Switch>
    </MemoryRouter>)
}

beforeAll(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getProfileVariationPointersService: jest.fn(() => Promise.resolve({
                data: [{
                    fundingStreamId: "TEST",
                    fundingLineId: "TEST",
                    periodType: "TEST",
                    typeValue: "TEST",
                    year: 2020,
                    occurrence: 1,
                }]
            }))
        }
    }
    jest.mock('../../../services/specificationService', () => mockSpecificationService());
})

afterEach(cleanup);

describe("<VariationManagement /> ", () => {
    it("calls getProfileVariationPointersService from the specificationService", async () => {
        const {getProfileVariationPointersService} = require('../../../services/specificationService');
        renderVariationManagement();
        await waitFor(() => expect(getProfileVariationPointersService).toBeCalled())
    });
});