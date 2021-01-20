import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import {CoreProviderSummary, ProviderSource} from "../../../types/CoreProviderSummary";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {PublishedFundingTemplate} from "../../../types/TemplateBuilderDefinitions";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

export function CreateSpecificationTestData() {

    const renderCreateSpecificationPage = async () => {
        const {CreateSpecification} = require('../../../pages/Specifications/CreateSpecification');
        const component =  render(<MemoryRouter initialEntries={['/Specifications/CreateSpecification']}>
            <QueryClientProviderTestWrapper>
            <Switch>
                <Route path="/Specifications/CreateSpecification" component={CreateSpecification}/>
            </Switch>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>);

        await waitFor(() => {
            expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
        });
        return component;
    };

    const mockFundingStream: FundingStream = {
        id: "stream-547",
        name: "Test Stream 547"
    };
    const mockFundingPeriod: FundingPeriod = {
        id: "period-433",
        name: "Test Period 433"
    };
    const mockTemplate: PublishedFundingTemplate = {
        authorId: "43", 
        authorName: "asdf asdf", 
        publishDate: new Date(), 
        publishNote: "blah blah publish note", 
        schemaVersion: "1.4", 
        templateVersion: "9.9"
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
                            id: mockFundingStream.id,
                            name: mockFundingStream.name
                        }]
                })),
                getPublishedTemplatesByStreamAndPeriod: jest.fn(() => Promise.resolve({
                    data: [mockTemplate]
                })),
                getFundingConfiguration: jest.fn(() => Promise.resolve({
                    data:
                        {
                            fundingStreamId: mockFundingStream.id,
                            fundingPeriodId: mockFundingPeriod.id,
                            approvalMode: undefined,
                            providerSource: mockProviderSource,
                            defaultTemplateVersion: mockTemplate.templateVersion
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
                    data: [mockFundingPeriod]
                })),
                createSpecificationService: jest.fn(() => Promise.resolve({
                    data:
                        {
                            name: "",
                            id: "35486792350689",
                            approvalStatus: "",
                            isSelectedForFunding: true,
                            description: "",
                            providerVersionId: "",
                            fundingStreams: [mockFundingStream],
                            fundingPeriod: mockFundingPeriod,
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
                    data: [mockFundingPeriod]
                })),
                createSpecificationService: jest.fn(() => Promise.reject({
                    status: 400,
                    response: {data: {Name: 'unique name error'}}
                }))
            }
        });
    }
    
const mockProvider: CoreProviderSummary = {
    providerVersionId: "provider-version-5439",
    versionType: "",
    name: "Provider 5439",
    description: "",
    version: 4,
    targetDate: new Date(),
    fundingStream: mockFundingStream.id,
    created: new Date()
};
    
    const mockProviderVersionService = () => {
        jest.mock("../../../services/providerVersionService", () => {
            const service = jest.requireActual("../../../services/providerVersionService");

            return {
                ...service,
                getProviderByFundingStreamIdService: jest.fn(() => Promise.resolve({
                    data: [mockProvider]
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
                            providerSnapshotId: 1437,
                            name: "Provider snapshot 1437",
                            description: "",
                            version: 20,
                            targetDate: new Date(),
                            created: new Date(),
                            fundingStreamCode: mockFundingStream.id,
                            fundingStreamName: mockFundingStream.name
                        }
                }))
            }
        });
    }

    return {
        renderCreateSpecificationPage,
        mockPolicyService,
        mockSpecificationService,
        mockSpecificationServiceWithDuplicateNameResponse,
        mockProviderVersionService,
        mockProviderService,
        fundingStream: mockFundingStream,
        fundingPeriod: mockFundingPeriod,
        template: mockTemplate,
        providerVersion: mockProvider
    }
}