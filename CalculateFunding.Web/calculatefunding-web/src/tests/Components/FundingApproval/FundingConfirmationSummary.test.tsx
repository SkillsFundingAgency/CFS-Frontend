import React from 'react';
import {render, screen, waitForElementToBeRemoved,} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from "react-redux";
import {match, MemoryRouter} from "react-router";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {FundingConfirmationSummary} from "../../../components/Funding/FundingConfirmationSummary";
import { FundingActionType, PublishedProviderFundingCount } from '../../../types/PublishedProvider/PublishedProviderFundingCount';
import { SpecificationSummary } from '../../../types/SpecificationSummary';
import { ApprovalMode } from '../../../types/ApprovalMode';
import { ConfirmFundingRouteProps } from '../../../pages/FundingApprovals/ConfirmFunding';
import { FundingPeriod, FundingStream } from '../../../types/viewFundingTypes';

const callBackSpy = jest.fn();

const renderComponent = async (specificationSummary: SpecificationSummary, approvalMode: ApprovalMode, fundingSummary: PublishedProviderFundingCount, actionType: FundingActionType) => {
    return render(<MemoryRouter>
        <QueryClientProviderTestWrapper>
            <Provider store={store}>
                <FundingConfirmationSummary routingParams ={config.mockConfirmApprovalRoute}
                                            approvalMode = {approvalMode}
                                            specification = {specificationSummary}
                                            fundingSummary = {fundingSummary}
                                            canReleaseFunding = {true}
                                            canApproveFunding = {true}
                                            addError={callBackSpy}
                                            isWaitingForJob = {false}/>
            </Provider>
        </QueryClientProviderTestWrapper>
    </MemoryRouter>);
};

const store: Store<IStoreState> = createStore(rootReducer);
store.dispatch = jest.fn();

const config = setupTestConfig();

function setupTestConfig() {
    const fundingStream: FundingStream = {
        id: "WIZ-123",
        name: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const testSpec: SpecificationSummary = {
        coreProviderVersionUpdates: undefined,
        name: "Wizard Training",
        approvalStatus: "",
        description: "",
        fundingPeriod: fundingPeriod,
        fundingStreams: [fundingStream],
        id: "ABC123",
        isSelectedForFunding: true,
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const mockConfirmApprovalRoute: ConfirmFundingRouteProps = {
        specificationId: testSpec.id,
        fundingStreamId: fundingStream.id,
        fundingPeriodId: fundingPeriod.id,
        mode: FundingActionType.Approve
    };
    const mockPublishedProviderFundingZeroCount: PublishedProviderFundingCount = {
        count: 0,
        fundingStreamsFundings :undefined,
        localAuthorities :undefined,
        localAuthoritiesCount :0,
        providerTypes :undefined,
        providerTypesCount :0,
        indicativeProviderCount :0,
        totalFunding :0
    };
    const mockPublishedProviderFundingProviderCountWithIndicative: PublishedProviderFundingCount = {
        count: 2,
        fundingStreamsFundings :undefined,
        localAuthorities :undefined,
        localAuthoritiesCount :0,
        providerTypes :undefined,
        providerTypesCount :0,
        indicativeProviderCount :1,
        totalFunding :0
    };

    return{
        fundingStream,
        fundingPeriod,
        testSpec,
        mockConfirmApprovalRoute,
        mockPublishedProviderFundingZeroCount,
        mockPublishedProviderFundingProviderCountWithIndicative
    }
}

describe('<FundingConfirmationSummary />', () => {
    describe('<FundingConfirmationSummary /> with the Release Type and no published providers selected', () => {

        test('link not rendered', async () => {
            await renderComponent(config.testSpec, 
                ApprovalMode.Batches,
                config.mockPublishedProviderFundingZeroCount,
                FundingActionType.Release);
            expect(screen.queryByText(/Generating export of providers/)).not.toBeInTheDocument();
        });
    });

    describe('<FundingConfirmationSummary /> with the Release Type and 2 published providers selected with 1 indicative', () => {

        test('link not rendered', async () => {
            await renderComponent(config.testSpec, 
                ApprovalMode.Batches,
                config.mockPublishedProviderFundingProviderCountWithIndicative,
                FundingActionType.Release);
            expect(screen.queryByText(/Of which 1 is indicative/)).toBeInTheDocument();
        });
    });
});