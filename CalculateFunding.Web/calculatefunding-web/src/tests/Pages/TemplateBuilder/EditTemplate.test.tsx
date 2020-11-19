import React from "react";
import * as redux from "react-redux";
import {MemoryRouter} from "react-router";
import {waitFor, fireEvent, render, act} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {TemplateResponse} from "../../../types/TemplateBuilderDefinitions";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import {ConfirmationModal} from "../../../components/ConfirmationModal";
import * as hooks from "../../../hooks/TemplateBuilder/useTemplateUndo";

jest.useFakeTimers();

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

jest.spyOn(hooks, 'useTemplateUndo').mockImplementation(
    () => ({
        initialiseState: jest.fn(),
        updatePresentState: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
        clearPresentState: jest.fn(),
        clearUndoState: jest.fn(),
        clearRedoState: jest.fn(),
        undoCount: jest.fn(),
        redoCount: jest.fn()
    }));

const noPermissionsState: FundingStreamPermissions[] = [{
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
    canCreateProfilePattern: false
}];

const permissionsState: FundingStreamPermissions[] = [{
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
    canCreateProfilePattern: false
}];

const mockTemplate: TemplateResponse = {
    templateId: "12352346",
    name: "template name",
    description: "lorem ipsum",
    fundingStreamId: "DSG",
    fundingStreamName: "DSG",
    fundingPeriodId: "2021",
    fundingPeriodName: "2021",
    majorVersion: 0,
    minorVersion: 2,
    version: 2,
    isCurrentVersion: true,
    status: "Draft",
    schemaVersion: "1.1",
    templateJson: "{}",
    authorId: "",
    authorName: "",
    lastModificationDate: new Date(),
    comments: ""
};

const renderEditTemplatePage = () => {
    const {EditTemplate} = require('../../../pages/Templates/EditTemplate');
    return render(
        <MemoryRouter
            getUserConfirmation={(message, callback) => {
                ConfirmationModal(message, callback)
            }}>
            <EditTemplate/>
        </MemoryRouter>);
};

beforeAll(() => {
    function mockFunctions(mockData: TemplateResponse) {
        const originalService = jest.requireActual('../../../services/templateBuilderDatasourceService');
        return {
            ...originalService,
            getTemplateById: jest.fn(() => Promise.resolve({
                data: mockData
            }))
        }
    }

    jest.mock('../../../services/templateBuilderDatasourceService', () => mockFunctions(mockTemplate));
});

describe("EditTemplate Page tests", () => {
    
    describe("Template Builder when I have no permissions ", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue(noPermissionsState);
        });

        it("fetches template data getTemplateById", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderEditTemplatePage();
            await waitFor(() => expect(getTemplateById).toBeCalled());
        });

        it("renders a permission status warning", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('permission-alert-message')).toBeInTheDocument();
            });
        });

        it("does not render a publish button", async () => {
            const {queryByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(queryByTestId('publish-button')).toBeNull();
            });
        });

        it("does not render Add Funding Line button", async () => {
            const {queryByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(queryByTestId('add-funding-line')).toBeNull();
            });
        });
    });

    describe("Template Builder when I request current version and have edit permissions ", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue(permissionsState);
        });

        it("fetches template data getTemplateById", async () => {
            const {getTemplateById} = require('../../../services/templateBuilderDatasourceService');
            renderEditTemplatePage();

            await waitFor(() => expect(getTemplateById).toBeCalled());
        });

        it("does render a save button", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('save-button')).toBeInTheDocument();
            });
        });

        it("does not render a permission status warning", async () => {
            const {container} = renderEditTemplatePage();
            await waitFor(() => {
                expect(container.querySelector("#permission-alert-message")).not.toBeInTheDocument();
            });
        });

        it("funding line displays add buttons", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('add-funding-line')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(getByTestId('add-funding-line'));
            });

            await waitFor(() => {
                expect(getByTestId("n0-add-line")).toBeInTheDocument();
                expect(getByTestId("n0-add-calc")).toBeInTheDocument();
            });
        });

        it("adds new funding line to page when button clicked", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('add-funding-line')).toBeInTheDocument();
            });

            act(() => {
                fireEvent.click(getByTestId('add-funding-line'));
            });

            await waitFor(() => {
                expect(getByTestId('node-n0')).toBeInTheDocument();
            });
        });

        it("displays edit funding line sidebar when clicking on funding line", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('add-funding-line')).toBeInTheDocument();
            });
            act(() => {
                fireEvent.click(getByTestId('add-funding-line'));
            });
            await waitFor(() => {
                expect(getByTestId('node-n0')).toBeInTheDocument();
            });

            // click on funding line
            act(() => {
                fireEvent.click(getByTestId("node-n0"));
            });

            await waitFor(() => {
                expect(getByTestId('sidebar-fundingline')).toBeInTheDocument();
            });
        });

        it("displays confirmation when deleting a funding line", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('add-funding-line')).toBeInTheDocument();
            });
            act(() => {
                fireEvent.click(getByTestId('add-funding-line'));
            });
            await waitFor(() => {
                expect(getByTestId('node-n0')).toBeInTheDocument();
            });
            act(() => {
                fireEvent.click(getByTestId("node-n0"));
            });
            await waitFor(() => {
                expect(getByTestId('node-n0-delete')).toBeInTheDocument();
            });

            // delete the node
            act(() => {
                fireEvent.click(getByTestId("node-n0-delete"));
            });

            await waitFor(() => {
                expect(getByTestId("node-n0-confirm-delete")).toBeInTheDocument();
            });
        });

        it("displays blocking modal when user navigates away from unsaved changes", async () => {
            const {getByTestId, getByText} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId('add-funding-line')).toBeInTheDocument();
            });
            act(() => {
                fireEvent.click(getByTestId('add-funding-line'));
            });
            await waitFor(() => {
                expect(getByTestId('node-n0')).toBeInTheDocument();
            });

            // try to navigate away without saving
            act(() => {
                fireEvent.click(getByTestId('template-versions-link'));
            });

            await waitFor(() => {
                expect(getByTestId("modal-confirmation-placeholder")).toBeInTheDocument();
                expect(getByText(/Are you sure you want to leave without saving your changes?/)).toBeInTheDocument();
            });
        });

        it("renders a publish button", async () => {
            const {EditTemplate} = require('../../../pages/Templates/EditTemplate');
            const {getByTestId} = render(<MemoryRouter><EditTemplate/></MemoryRouter>);
            await waitFor(() => {
                expect(getByTestId("publish-button")).toBeInTheDocument();
            });
        });

        it("renders an export button", async () => {
            const {getByTestId} = renderEditTemplatePage();
            await waitFor(() => {
                expect(getByTestId("export-button")).toBeInTheDocument();
                expect(getByTestId("export-button"))
                    .toHaveAttribute('href', expect
                        .stringContaining("/api/templates/build/" +
                            mockTemplate.templateId +
                            "/export?version=" +
                            mockTemplate.version));
            });
        });
    });
});