import React from 'react';
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import * as redux from "react-redux";
import {waitFor, screen, render, getAllByTestId} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {CreateTemplate} from '../../../pages/Templates/CreateTemplate';

const fetchMock = new MockAdapter(axios);
const useSelectorSpy = jest.spyOn(redux, 'useSelector');

describe("Create Template page when I have no create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(noPermissionsState);
        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, [{
            "fundingStream": {
                "id": "DSG",
                "name": "Dedicated Schools Grant"
            },
            "fundingPeriods": [{
                "id": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61",
                "name": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61 test period"
            }]
        }]);
    });

    afterEach(() => {
        fetchMock.reset();
    })

    it("renders a permission status warning", async () => {
        const {getByTestId} = render(<MemoryRouter><CreateTemplate /></MemoryRouter>)
        await waitFor(() => {
            expect(getByTestId("permission-alert-message")).toBeInTheDocument();
        });
    });
});

describe("Create Template page when I have create permissions ", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);

        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, [{
            "fundingStream": {
                "id": "DSG",
                "name": "Dedicated Schools Grant"
            },
            "fundingPeriods": [{
                "id": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61",
                "name": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61 test period"
            }],
        },
        {
            "fundingStream": {
                "id": "AGAG",
                "name": "Academies General Annual Grant"
            },
            "fundingPeriods": [{
                "id": "FY-202122",
                "name": "Financial Year 2021-22"
            }],
        }
        ]);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("does not render a permission status warning", async () => {
        render(<MemoryRouter><CreateTemplate /></MemoryRouter>)
        await waitFor(() => {
            expect(screen.queryByText("You do not have permissions to perform the following actions")).not.toBeInTheDocument();
        });
    });

    it("does render funding streams drop down list with correct options", async () => {
        const {getByTestId, getAllByTestId, container} = render(<MemoryRouter><CreateTemplate /></MemoryRouter>)
        await waitFor(() => {
            expect(getByTestId("fundingPeriodId")).toBeInTheDocument();
            expect(getByTestId("fundingStreamId")).toBeInTheDocument();
            expect(screen.queryByText("There is a problem")).not.toBeInTheDocument();
            expect(container.querySelector('option')).toBeInTheDocument();
            expect(screen.getByDisplayValue("Academies General Annual Grant")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Financial Year 2021-22")).toBeInTheDocument();
            const fundingStreamOptions = getAllByTestId("fundingStreamOption");
            expect(fundingStreamOptions[0].textContent).toBe('Academies General Annual Grant');
            expect(fundingStreamOptions[1].textContent).toBe('Dedicated Schools Grant');
        });
    });
});

describe("Create Template page when no funding streams exist", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, []);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("does render funding streams drop down list", async () => {
        const {getByTestId, container} = render(<MemoryRouter><CreateTemplate /></MemoryRouter>)
        await waitFor(() => {
            expect(getByTestId("fundingStreamId")).toBeInTheDocument();
            expect(screen.queryByTestId("fundingPeriodId")).not.toBeInTheDocument();
            expect(screen.queryByText("There is a problem")).toBeInTheDocument();
            expect(container.querySelector('option')).not.toBeInTheDocument();
        });
    });
});

describe("Create Template page when a funding stream exists but I don't have permissions for it", () => {
    beforeEach(() => {
        useSelectorSpy.mockClear();
        useSelectorSpy.mockReturnValue(permissionsState);
        fetchMock.onGet("/api/templates/build/available-stream-periods").reply(200, [{
            "fundingStream": {
                "id": "PSG",
                "name": "PE & Sports Grant"
            },
            "fundingPeriods": [{
                "id": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61",
                "name": "FY-55aaae78-022d-4c3a-b9b7-4e5ccd741b61 test period"
            }]
        }]);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("does render funding streams drop down list but with no options", async () => {
        const {getByTestId, getByText, container} = render(<MemoryRouter><CreateTemplate /></MemoryRouter>)
        await waitFor(() => {
            expect(getByText("There is a problem")).toBeInTheDocument();
            expect(getByTestId("fundingStreamId")).toBeInTheDocument();
            expect(screen.queryByTestId("fundingPeriodId")).not.toBeInTheDocument();
            expect(container.querySelector('option')).not.toBeInTheDocument();
        });
    });
});

export const noPermissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
    canApproveAnyCalculations: false,
    canApproveAllCalculations: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false,
    canApproveCalculations: false,
}];

export const permissionsState: FundingStreamPermissions[] = [{
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canApproveTemplates: true,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
    canApproveAnyCalculations: false,
    canApproveAllCalculations: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false,
    canApproveCalculations: false,
}, {
    fundingStreamId: "AGAG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canApproveTemplates: true,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false,
    canApproveAnyCalculations: false,
    canApproveAllCalculations: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false,
    canApproveCalculations: false,
}];