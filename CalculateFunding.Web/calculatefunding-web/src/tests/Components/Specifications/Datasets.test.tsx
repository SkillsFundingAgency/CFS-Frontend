import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {cleanup, render, screen, waitFor} from "@testing-library/react";
import {FundingStreamPermissions} from "../../../types/FundingStreamPermissions";
import {IStoreState} from "../../../reducers/rootReducer";
import * as redux from "react-redux";
import {FeatureFlagsState} from "../../../states/FeatureFlagsState";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {JobMonitoringFilter} from "../../../types/Jobs/JobMonitoringFilter";
import {DatasetRelationship} from "../../../types/DatasetRelationship";
import {getDatasetsBySpecification} from "../../../services/datasetService";
import {DatasetRelationshipType} from "../../../types/Datasets/DatasetRelationshipType";
import * as ReactQuery from "react-query";
import {UseQueryResult} from "react-query/types/react/types";
import {EligibleSpecificationReferenceModel} from "../../../types/Datasets/EligibleSpecificationReferenceModel";
import {AxiosError} from "axios";

const renderDatasets = async () => {
    const {Datasets} = require('../../../components/Specifications/Datasets');
    const page = render(
        <QueryClientProviderTestWrapper>
            <MemoryRouter initialEntries={['/Datasets/SPEC123']}>
                <Switch>
                    <Route path="/Datasets/:specificationId">
                        <Datasets specificationId={"SPEC123"} lastConverterWizardReportDate={new Date()}/>
                    </Route>
                </Switch>
            </MemoryRouter>
        </QueryClientProviderTestWrapper>
    )

    await waitFor(() => {
        expect(screen.getByText("Loading datasets")).not.toBeVisible()
    });

    return page;
}

beforeAll(() => {
    hasDatasets();
})

afterEach(cleanup);

describe("<Datasets /> ", () => {
    beforeEach(async () => {
        hasReduxState({
            featureFlags: {
                specToSpec: false,
                profilingPatternVisible: false,
                enableReactQueryDevTool: false,
                releaseTimetableVisible: false,
                templateBuilderVisible: false,
            }
        });
        await renderDatasets();
    });

    it('renders definitions correctly', async () => {
        expect(await screen.findByText(/definition1/)).toBeInTheDocument();
    })

    it('renders the map data source file to data set link correctly', async () => {
        const button = await screen.findByRole("link", {name: /Map data source file to data set/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/DataRelationships/SPEC123");
    });

    it('renders the create dataset link correctly', async () => {
        const button = await screen.findByRole("link", {name: /Create dataset/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/SPEC123");
    });

    it('renders the converter wizard report link correctly', async () => {
        const button = await screen.findByRole("link", {name: /Converter wizard report/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/api/datasets/reports/SPEC123/download");
    });

    it('renders the converter wizard report date correctly', async () => {
        expect(screen.getByText(/Converter wizard last run:/)).toBeInTheDocument();
    });
});

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
const hasReduxState = (mocks: {
    permissions?: FundingStreamPermissions[],
    jobMonitorFilter?: JobMonitoringFilter
    featureFlags?: FeatureFlagsState
}) => {
    const state: IStoreState = {
        featureFlags: mocks.featureFlags ?? {
            templateBuilderVisible: false,
            releaseTimetableVisible: false,
            enableReactQueryDevTool: false,
            specToSpec: false,
            profilingPatternVisible: undefined
        },
        fundingSearchSelection: {searchCriteria: undefined, selectedProviderIds: []},
        userState: {
            isLoggedIn: true,
            userName: "test-user",
            hasConfirmedSkills: true,
            fundingStreamPermissions: mocks.permissions ?? []
        },
        jobObserverState: {jobFilter: mocks.jobMonitorFilter}
    }
    useSelectorSpy.mockImplementation(callback => {
        return callback(state);
    });
}
const useQuerySpy = jest.spyOn(ReactQuery, 'useQuery');

const hasDatasets = () => {
    useQuerySpy.mockReturnValue({
        data: [{
            definition: {
                description: "",
                id: "",
                name: "definition1"
            },
            relationshipDescription: "casual",
            relationshipType: DatasetRelationshipType.Uploaded,
            isProviderData: false,
            converterEligible: false,
            converterEnabled: false,
            id: "",
            name: ""
        },
            {
                definition: null,
                relationshipDescription: "how do I describe this relationship?",
                relationshipType: DatasetRelationshipType.ReleasedData,
                isProviderData: false,
                converterEligible: true,
                converterEnabled: false,
                id: "Con123",
                name: ""
            }] as DatasetRelationship[],
        status: 'success',
        isSuccess: true,
        isFetched: true,
    } as UseQueryResult<DatasetRelationship[], AxiosError>);
}
