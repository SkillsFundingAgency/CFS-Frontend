import React from "react";
import * as redux from "react-redux";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {FundingConfiguration} from "../../../types/FundingConfiguration";
import {UpdateCoreProviderVersion} from "../../../types/Provider/UpdateCoreProviderVersion";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";
import * as specHook from "../../../hooks/useSpecificationSummary";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {DataschemaDetailsViewModel} from "../../../types/Datasets/DataschemaDetailsViewModel";
import {match, MemoryRouter} from "react-router";
import {CreateDatasetFromUploadRouteProps} from "../../../pages/Datasets/Create/CreateDatasetFromUpload";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {render} from "@testing-library/react";

export function createDatasetTestSetup() {
    const useSelectorSpy = jest.spyOn(redux, 'useSelector');
    useSelectorSpy.mockReturnValue([]);
    const fundingStream: FundingStream = {
        name: "FS123",
        id: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const mockCfsFundingConfiguration: FundingConfiguration = {
        updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
        approvalMode: ApprovalMode.All,
        providerSource: ProviderSource.CFS,
        defaultTemplateVersion: "1.1",
        fundingPeriodId: fundingPeriod.id,
        fundingStreamId: fundingStream.id,
        enableConverterDataMerge: false
    }
    const mockFdzFundingConfiguration: FundingConfiguration = {
        updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
        approvalMode: ApprovalMode.All,
        providerSource: ProviderSource.FDZ,
        defaultTemplateVersion: "1.1",
        fundingPeriodId: fundingPeriod.id,
        fundingStreamId: fundingStream.id,
        enableConverterDataMerge: false
    }
    const testSpec: SpecificationSummary = {
        coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
        name: "test spec name",
        id: "3567357",
        approvalStatus: "Cal",
        isSelectedForFunding: true,
        description: "sgdsg",
        providerVersionId: "sgds",
        fundingStreams: [fundingStream],
        fundingPeriod: fundingPeriod,
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const mockSpecificationHook = () => jest.spyOn(specHook, 'useSpecificationSummary')
        .mockImplementation(() => ({
            specification: testSpec,
            isLoadingSpecification: false,
            errorCheckingForSpecification: null,
            haveErrorCheckingForSpecification: false,
            isFetchingSpecification: false,
            isSpecificationFetched: true,
            clearSpecificationFromCache: () => Promise.resolve()
        }));

    const mockFundingConfigurationQueryResult = (config: FundingConfiguration): FundingConfigurationQueryResult => {
        return {
            fundingConfiguration: config,
            isLoadingFundingConfiguration: false,
            errorLoadingFundingConfiguration: "",
            isErrorLoadingFundingConfiguration: false
        };
    }
    const mockFundingConfigurationHook = (result: FundingConfigurationQueryResult) => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration')
        .mockImplementation(() => result);

    const mockStreamDataset1: DataschemaDetailsViewModel = {
        id: "1490999",
        converterEligible: false,
        name: "PE and Sport Grant",
        description: "PE and Sport Grant"
    };
    const mockStreamDataset2: DataschemaDetailsViewModel = {
        id: "1221999",
        converterEligible: false,
        name: "PE and Sport Grant e2e",
        description: "PE and Sport Grant e2e"
    };
    const mockDatasetApi = () => {
        const service = jest.requireActual("../../../services/datasetService");
        return {
            ...service,
            getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                data: [mockStreamDataset1, mockStreamDataset2],
                status: 200
            }))
        }
    };

    const mockPolicyApi = (config: FundingConfiguration) => {
        const service = jest.requireActual('../../../services/policyService');
        return {
            ...service,
            getFundingConfiguration: jest.fn(() => Promise.resolve({
                data: config,
                status: 200
            }))
        }
    };

    const mockHistory = {push: jest.fn()};

    function renderCreateDatasetPage() {
        const {CreateDatasetFromUpload} = require('../../../pages/Datasets/Create/CreateDatasetFromUpload');

        const mockRoute: match<CreateDatasetFromUploadRouteProps> = {
            params: {
                specificationId: testSpec.id,
            },
            url: "",
            path: "",
            isExact: true,
        };

        return render(<MemoryRouter initialEntries={['/Datasets/CreateDataset/' + testSpec.id]}>
        <QueryClientProviderTestWrapper>
            <CreateDatasetFromUpload location={location} match={mockRoute} history={mockHistory}/>
        </QueryClientProviderTestWrapper>
        </MemoryRouter>)
    }

    return {
        fundingStream,
        fundingPeriod,
        mockStreamDataset1,
        mockStreamDataset2,
        mockDatasetApi,
        mockFundingConfigurationService: mockPolicyApi,
        mockSpecificationHook,
        mockFundingConfigurationHook,
        mockFundingConfigurationQueryResult,
        mockCfsFundingConfiguration,
        mockFdzFundingConfiguration,
        testSpec,
        renderCreateDatasetPage
    }
}
