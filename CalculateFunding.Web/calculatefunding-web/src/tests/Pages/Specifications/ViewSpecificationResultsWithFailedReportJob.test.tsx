import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react-hooks";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { Route, Switch } from "react-router-dom";
import { IStoreState, rootReducer } from "reducers/rootReducer";
import { createStore, Store } from "redux";
import { JobNotification } from "types/Jobs/JobSubscriptionModels";

import * as specHook from "../../../hooks/useSpecificationSummary";
import { JobType } from "../../../types/jobType";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { jobSubscriptionTestUtils } from "../../testing-utils";

function renderViewSpecificationResults() {
    const { ViewSpecificationResults } = require("../../../pages/Specifications/ViewSpecificationResults");
    return render(
        <MemoryRouter initialEntries={["/Specifications/ViewSpecificationResults/ABC123"]}>
            <Provider store={store}>
                <QueryClientProvider client={new QueryClient()}>
                    <Switch>
                        <Route path="" component={ViewSpecificationResults}/>
                    </Switch>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    );
}

const { setupJobSpy, haveFailedJobNotification, getNotificationCallback } = jobSubscriptionTestUtils();


const store: Store<IStoreState> = createStore(rootReducer);
store.dispatch = jest.fn();

const testSpec: SpecificationSummary = {
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "Wizard Training",
    approvalStatus: "",
    description: "",
    fundingPeriod: {
        id: "FP123",
        name: "2019-20",
    },
    fundingStreams: [
        {
            name: "FS123",
            id: "Wizard Training Scheme",
        },
    ],
    id: "ABC123",
    isSelectedForFunding: true,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: [],
};

const mockSpecification = () =>
    jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => ({
        clearSpecificationFromCache: () => Promise.resolve(),
        specification: testSpec,
        isLoadingSpecification: false,
        errorCheckingForSpecification: null,
        haveErrorCheckingForSpecification: false,
        isFetchingSpecification: false,
        isSpecificationFetched: true,
    }));

describe("<ViewSpecificationResults /> with failed CSV Generate job  ", () => {
    let notification: JobNotification;
    beforeEach(() => {
        notification = haveFailedJobNotification({
            jobType: JobType.EditSpecificationJob
        }, {})
        setupJobSpy();
    });

    afterEach(() => jest.clearAllMocks());

    it("renders error notification badge", async () => {
        act(() => {
            getNotificationCallback()(notification);
        });

        mockSpecification();

        renderViewSpecificationResults();

        await waitFor(() => {
            expect(screen.queryByTestId("notification-badge") as HTMLSpanElement).toBeInTheDocument();
        });
    });
});
