import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {act, render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {ProviderSource} from "../../../types/CoreProviderSummary";
import userEvent from "@testing-library/user-event";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

export function CreateSpecificationTestData() {
    const renderCreateSpecificationPage = async () => {
        const {CreateSpecification} = require('../../../pages/Specifications/CreateSpecification');
        return render(<MemoryRouter initialEntries={['/Specifications/CreateSpecification']}>
            <Switch>
                <Route path="/Specifications/CreateSpecification" component={CreateSpecification}/>
            </Switch>
        </MemoryRouter>);
    };

    const mockPolicyService = () => {
        const mockProviderSource = ProviderSource.CFS;
        jest.mock("../../../services/policyService", () => {
            const service = jest.requireActual("../../../services/policyService");

            return {
                ...service,
                getFundingStreamsService: jest.fn(() => Promise.resolve({
                    data:
                        [{
                            id: "test funding stream id",
                            name: "test funding stream name"
                        }]
                })),
                getPublishedTemplatesByStreamAndPeriod: jest.fn(() => Promise.resolve({
                    data:
                        [{
                            templateVersion: "test template version id",
                            publishNote: "",
                            authorId: "",
                            authorName: "",
                            publishDate: new Date(),
                            schemaVersion: ""
                        }]
                })),
                getFundingConfiguration: jest.fn(() => Promise.resolve({
                    data:
                        {
                            fundingStreamId: "",
                            fundingPeriodId: "",
                            approvalMode: undefined,
                            providerSource: mockProviderSource,
                            defaultTemplateVersion: ""
                        }
                }))
            }
        });
    }

    const mockSpecificationService = () => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual("../../../services/specificationService");
            return {
                ...service,
                getFundingPeriodsByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data:
                        [{
                            id: "test funding period id",
                            name: "test funding period name"
                        }]
                })),
                createSpecificationService: jest.fn(() => Promise.resolve({
                    data:
                        {
                            name: "",
                            id: "",
                            approvalStatus: "",
                            isSelectedForFunding: true,
                            description: "",
                            providerVersionId: "",
                            fundingStreams: [],
                            fundingPeriod: {
                                id: "test funding period id",
                                name: "test funding period name"
                            },
                            templateIds: {},
                            dataDefinitionRelationshipIds: []
                        }
                }))
            }
        });
    }

    const mockSpecificationServiceWithDuplicateNameResponse = () => {
        jest.mock("../../../services/specificationService", () => {
            const service = jest.requireActual("../../../services/specificationService");
            return {
                ...service,
                getFundingPeriodsByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data:
                        [{
                            id: "test funding period id",
                            name: "test funding period name"
                        }]
                })),
                createSpecificationService: jest.fn(() => Promise.reject({
                    status: 400,
                    response: {data: {Name: 'unique name error'}}
                }))
            }
        });
    }

    const mockProviderVersionService = () => {
        jest.mock("../../../services/providerVersionService", () => {
            const service = jest.requireActual("../../../services/providerVersionService");

            return {
                ...service,
                getProviderByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data:
                        [{
                            providerVersionId: "test core provider id",
                            versionType: "",
                            name: "",
                            description: "",
                            version: 0,
                            targetDate: new Date(),
                            fundingStream: "",
                            created: new Date()
                        }]
                }))
            }
        });
    }

    const mockProviderService = () => {
        jest.mock("../../../services/providerService", () => {
            const service = jest.requireActual("../../../services/providerService");

            return {
                ...service,
                getProviderSnapshotsForFundingStreamService: jest.fn(() => Promise.resolve({
                    data:
                        {
                            providerSnapshotId: 0,
                            name: "",
                            description: "",
                            version: 0,
                            targetDate: new Date(),
                            created: new Date(),
                            fundingStreamCode: "",
                            fundingStreamName: ""
                        }
                }))
            }
        });
    }

    const setupSpecificationNameEntered = async () => {
        const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
        await act(() => userEvent.type(specificationField, "test specification name"));
    }

    const setupFundingStreamSelected = async () => {
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        act(() => userEvent.selectOptions(fundingStreamSelect, "test funding stream id"));
    }

    const setupFundingPeriodSelected = async () => {
        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        act(() => userEvent.selectOptions(fundingPeriodSelect, "test funding period id"));
    }

    const setupCoreProviderSelected = async () => {
        const coreProviderSelect = await screen.findByTestId(`core-provider-dropdown`);
        act(() => userEvent.selectOptions(coreProviderSelect, "test core provider id"));
    }

    const setupTemplateVersionIdSelected = async () => {
        const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
        act(() => userEvent.selectOptions(templateVersionSelect, "test template version id"));
    }

    const setupMoreDetailEntered = async () => {
        const moreDetailField = await screen.findByTestId(`more-detail-textarea`);
        await act(() => userEvent.type(moreDetailField, "test value"));
    }

    const setupSaveButtonAct = async () => {
        const buildButton = screen.getByRole("button", {name: /Save and continue/});
        act(() => userEvent.click(buildButton));
    }

    return {
        renderCreateSpecificationPage,
        mockPolicyService,
        mockSpecificationService,
        mockSpecificationServiceWithDuplicateNameResponse,
        mockProviderVersionService,
        mockProviderService,
        setupSpecificationNameEntered,
        setupFundingStreamSelected,
        setupFundingPeriodSelected,
        setupCoreProviderSelected,
        setupTemplateVersionIdSelected,
        setupMoreDetailEntered,
        setupSaveButtonAct
    }
}