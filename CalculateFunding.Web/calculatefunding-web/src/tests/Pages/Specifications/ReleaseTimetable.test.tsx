import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { ErrorContext } from "../../../context/ErrorContext";
import { ReleaseTimetableSummary } from "../../../types/ReleaseTimetableSummary";

const testDate = "2050-01-01T00:00:00+00:00";
const dateInPast = "2000-01-01T00:00:00+00:00";
const addErrorMock = jest.fn();
const clearErrorMessagesMock = jest.fn();

const renderReleaseTimetable = () => {
  const { ReleaseTimetable } = require("../../../pages/Specifications/ReleaseTimetable");
  return render(
    <ErrorContext.Provider
      value={{
        state: [],
        dispatch: jest.fn(),
        addErrorToContext: addErrorMock,
        clearErrorsFromContext: clearErrorMessagesMock,
        addValidationErrorToContext: jest.fn(),
      }}
    >
      <ReleaseTimetable specificationId={"Spec123"} />
    </ErrorContext.Provider>
  );
};

function mockPublishService(earliestPaymentAvailableDate?: string, externalPublicationDate?: string) {
  const { getReleaseTimetableForSpecificationService } = require("../../../services/publishService");
  getReleaseTimetableForSpecificationService.mockImplementation(() =>
    Promise.resolve({
      data: {
        statusCode: 200,
        content: {
          earliestPaymentAvailableDate: earliestPaymentAvailableDate,
          externalPublicationDate: externalPublicationDate,
        },
      } as ReleaseTimetableSummary,
    })
  );
}

jest.mock("../../../services/publishService", () => ({
  getReleaseTimetableForSpecificationService: jest.fn(),
  saveReleaseTimetableForSpecificationService: jest.fn(),
}));

afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("<ReleaseTimetable /> renders ", () => {
  beforeEach(() => {
    mockPublishService(testDate, testDate);
  });

  it("the header", async () => {
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Release timetable")).toBeInTheDocument();
    });
  });

  it("the navision title", async () => {
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Release date of statement to providers?")).toBeInTheDocument();
    });
  });
});

describe("<ReleaseTimetable /> validates ", () => {
  it("when release dates are missing", async () => {
    mockPublishService();
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toHaveBeenNthCalledWith(1, {
      error: "Please enter a release date and time for funding",
      fieldName: "release-timetable-funding",
    });
    expect(addErrorMock).toHaveBeenNthCalledWith(2, {
      error: "Please enter a release date and time for statement",
      fieldName: "release-timetable-statement",
    });
  });

  it("when earliest payment date missing", async () => {
    mockPublishService(undefined, testDate);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toBeCalledWith({
      error: "Please enter a release date and time for statement",
      fieldName: "release-timetable-statement",
    });
  });

  it("when external publication date missing", async () => {
    mockPublishService(testDate, undefined);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toBeCalledWith({
      error: "Please enter a release date and time for funding",
      fieldName: "release-timetable-funding",
    });
  });

  it("when earliest payment date is in past", async () => {
    mockPublishService(dateInPast, testDate);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toBeCalledWith({
      error: "Release date of statement cannot be in the past",
      fieldName: "release-timetable-statement",
    });
  });
  it("when publication date is in past", async () => {
    mockPublishService(testDate, dateInPast);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toBeCalledWith({
      error: "Release date of funding cannot be in the past",
      fieldName: "release-timetable-funding",
    });
  });
  it("when publication date is in past and earliest payment date is missing", async () => {
    mockPublishService(undefined, dateInPast);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toHaveBeenNthCalledWith(1, {
      error: "Please enter a release date and time for statement",
      fieldName: "release-timetable-statement",
    });
    expect(addErrorMock).toHaveBeenNthCalledWith(2, {
      error: "Release date of funding cannot be in the past",
      fieldName: "release-timetable-funding",
    });
  });
  it("when earliest payment date is in past and publication date is missing", async () => {
    mockPublishService(dateInPast, undefined);
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText("Confirm changes"));

    expect(addErrorMock).toHaveBeenNthCalledWith(1, {
      error: "Please enter a release date and time for funding",
      fieldName: "release-timetable-funding",
    });
    expect(addErrorMock).toHaveBeenNthCalledWith(2, {
      error: "Release date of statement cannot be in the past",
      fieldName: "release-timetable-statement",
    });
  });
});

describe("<ReleaseTimetable /> calls ", () => {
  beforeEach(() => {
    mockPublishService(testDate, testDate);
  });

  it("the publishService", async () => {
    const { getReleaseTimetableForSpecificationService } = require("../../../services/publishService");
    renderReleaseTimetable();
    expect(screen.getByText("Release timetable")).toBeInTheDocument();
    await waitFor(() => expect(getReleaseTimetableForSpecificationService).toBeCalled());
  });
  it("clearErrorMessage after successful save", async () => {
    const { saveReleaseTimetableForSpecificationService } = require("../../../services/publishService");
    saveReleaseTimetableForSpecificationService.mockImplementation(() =>
      Promise.resolve({
        data: {
          earliestPaymentAvailableDate: testDate,
          externalPublicationDate: testDate,
        },
      })
    );
    renderReleaseTimetable();
    await waitFor(() => {
      expect(screen.getByText("Confirm changes").closest("button")).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText("Confirm changes"));
    await waitFor(() =>
      expect(clearErrorMessagesMock).toHaveBeenLastCalledWith([
        "release-timetable-funding",
        "release-timetable-statement",
        "release-timetable",
      ])
    );
  });
});
