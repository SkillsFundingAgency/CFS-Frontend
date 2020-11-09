import React from "react";
import {cleanup, render, waitFor, screen, fireEvent} from "@testing-library/react";
import {ReleaseTimetableSummary} from "../../../types/ReleaseTimetableSummary";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

const testDate = "2000-01-01T00:00:00+00:00";
const addErrorMock = jest.fn();
const clearErrorMessagesMock = jest.fn();

const renderReleaseTimetable = () => {
    const {ReleaseTimetable} = require("../../../pages/Specifications/ReleaseTimetable");
    return render(<ReleaseTimetable specificationId={"Spec123"}
        addErrorMessage={addErrorMock} clearErrorMessages={clearErrorMessagesMock} />);
};
function mockPublishService(earliestPaymentAvailableDate?: string, externalPublicationDate?: string) {
    const {getReleaseTimetableForSpecificationService} = require('../../../services/publishService');
    getReleaseTimetableForSpecificationService.mockImplementation(() => Promise.resolve({
        data: {
            statusCode: 200,
            content: {
                earliestPaymentAvailableDate: earliestPaymentAvailableDate,
                externalPublicationDate: externalPublicationDate
            }
        } as ReleaseTimetableSummary
    }))
}

jest.mock('../../../services/publishService', () => ({
    getReleaseTimetableForSpecificationService: jest.fn(),
    saveReleaseTimetableForSpecificationService: jest.fn()
}));

afterEach(async () => {
    jest.clearAllMocks();
    await cleanup();
});

describe('<ReleaseTimetable /> renders ', () => {
    beforeEach(() => {
        mockPublishService(testDate, testDate);
    });

    it('the header', async () => {
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Release timetable")).toBeInTheDocument();
        });
    });
    it('the release title', async () => {
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Release date of funding to Business Central?")).toBeInTheDocument();
        });
    });
    it('the navision title', async () => {
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Release date of statement to providers?")).toBeInTheDocument();
        });
    });
});

describe('<ReleaseTimetable /> validates ', () => {
    it('when release dates are missing', async () => {
        mockPublishService();
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
        });
        fireEvent.click(screen.getByText("Confirm changes"));
        await waitFor(() =>
            expect(addErrorMock).toBeCalledWith("Please a enter release date and time for funding and statement", undefined, "release-timetable")
        );
    });
    it('when earliest payment date missing', async () => {
        mockPublishService(undefined, testDate);
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
        });
        fireEvent.click(screen.getByText("Confirm changes"));
        await waitFor(() =>
            expect(addErrorMock).toBeCalledWith("Please a enter release date and time for funding and statement", undefined, "release-timetable")
        );
    });
    it('when external publication date missing', async () => {
        mockPublishService(testDate, undefined);
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
        });
        fireEvent.click(screen.getByText("Confirm changes"));
        await waitFor(() =>
            expect(addErrorMock).toBeCalledWith("Please a enter release date and time for funding and statement", undefined, "release-timetable")
        );
    });
});

describe('<ReleaseTimetable /> calls ', () => {
    beforeEach(() => {
        mockPublishService(testDate, testDate);
    });

    it("the publishService", async () => {
        const {getReleaseTimetableForSpecificationService} = require('../../../services/publishService');
        renderReleaseTimetable();
        expect(screen.getByText("Release timetable")).toBeInTheDocument();
        await waitFor(() => expect(getReleaseTimetableForSpecificationService).toBeCalled());
    });
    it("clearErrorMessage after successful save", async () => {
        const {saveReleaseTimetableForSpecificationService} = require('../../../services/publishService');
        saveReleaseTimetableForSpecificationService.mockImplementation(() => Promise.resolve({
            data: {
                earliestPaymentAvailableDate: testDate,
                externalPublicationDate: testDate
            }
        }));
        renderReleaseTimetable();
        await waitFor(() => {
            expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
        });
        fireEvent.click(screen.getByText("Confirm changes"));
        await waitFor(() =>
            expect(clearErrorMessagesMock).toBeCalledTimes(1)
        );
    })
});