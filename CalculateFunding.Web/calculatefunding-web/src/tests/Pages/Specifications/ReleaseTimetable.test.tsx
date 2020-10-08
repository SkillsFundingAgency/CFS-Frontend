import {ReleaseTimetable} from "../../../pages/Specifications/ReleaseTimetable";
import React from "react";
import '@testing-library/jest-dom/extend-expect';
import {cleanup, render, waitFor, screen, act} from "@testing-library/react";
import {ReleaseTimetableSummary} from "../../../types/ReleaseTimetableSummary";
import {MemoryRouter} from "react-router";

const publishServicePath = '../../../services/publishService';
const renderReleaseTimetable = () => {
    const {ReleaseTimetable} = require("../../../pages/Specifications/ReleaseTimetable");
    return render(<ReleaseTimetable specificationId={"Spec123"}/>);
};
function mockPublishService() {
    const publishServiceActual = jest.requireActual(publishServicePath);
    return {
        ...publishServiceActual,
        getReleaseTimetableForSpecificationService: jest.fn(() => Promise.resolve({
            data: {
                statusCode: 200,
                content: {
                    earliestPaymentAvailableDate: "2000-01-01",
                    externalPublicationDate: "2000-01-01"
                }
            } as ReleaseTimetableSummary
        }))
    }
}
beforeEach(() => {
    jest.mock(publishServicePath, () => mockPublishService());
});
afterEach(async () => {
    jest.clearAllMocks();
    await cleanup();
});
describe('<ReleaseTimetable /> renders ', () => {
    it('the header', () => {
        renderReleaseTimetable();
        expect(screen.getByText("Release timetable")).toBeInTheDocument();
    });
    it('the release title', () => {
        renderReleaseTimetable();
        expect(screen.getByText("Release date of funding to Business Central?")).toBeInTheDocument();
    });
    it('the navision title', () => {
        renderReleaseTimetable();
        expect(screen.getByText("Release date of statement to providers?")).toBeInTheDocument();
    });
});

describe('<ReleaseTimetable /> calls', () => {
    it("it calls the publishService", async () => {
        const {getReleaseTimetableForSpecificationService} = require(publishServicePath);
        renderReleaseTimetable();
        expect(screen.getByText("Release timetable")).toBeInTheDocument();
        await waitFor(() => expect(getReleaseTimetableForSpecificationService).toBeCalled())
    });
});