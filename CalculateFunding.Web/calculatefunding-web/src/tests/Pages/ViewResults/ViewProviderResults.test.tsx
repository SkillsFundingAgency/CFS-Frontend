import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewProviderResults, ViewProviderResultsRouteProps} from "../../../pages/ViewResults/ViewProviderResults";
import {ProviderSummary} from "../../../types/ProviderSummary";
import {ProviderVersionQueryResult} from "../../../hooks/Providers/useProviderVersion";
import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import * as specHook from "../../../hooks/useSpecificationSummary";
import * as providerVersionHook from "../../../hooks/Providers/useProviderVersion";
const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const history = createMemoryHistory();
const location = createLocation("","","");
const testProvider: ProviderSummary = {
    authority: "",
    countryCode: "",
    countryName: "",
    crmAccountId: "",
    dfeEstablishmentNumber: "",
    establishmentNumber: "",
    id: "Hog-1",
    laCode: "",
    legalName: "",
    name: "Hogwarts School of Witchcraft and Wizardry",
    navVendorNo: "",
    phaseOfEducation: "",
    postcode: "",
    providerId: "Hog",
    providerProfileIdType: "",
    providerSubType: "",
    providerType: "",
    providerVersionId: "",
    reasonEstablishmentClosed: "",
    reasonEstablishmentOpened: "",
    rscRegionCode: "",
    rscRegionName: "",
    status: "",
    successor: "",
    town: "",
    trustCode: "",
    trustName: "",
    trustStatus: "",
    ukprn: "",
    upin: "",
    urn: "",
    paymentOrganisationIdentifier: "",
    paymentOrganisationName: "",
};
const providerResult: ProviderVersionQueryResult = {
    providerVersion: testProvider,
    isLoadingProviderVersion: false,
    errorLoadingProviderVersion: null,
    isErrorLoadingProviderVersion: false
};
const matchMock : match<ViewProviderResultsRouteProps> = {
    params: {
        providerId: "123",
        fundingStreamId: "xyz"
    },
    path:"",
    isExact: true,
    url: ""
};

const renderPage = () => {
    const {ViewProviderResults} = require('../../../pages/ViewResults/ViewProviderResults');
    return render(
        <MemoryRouter>
                <ViewProviderResults location={location} history={history} match={matchMock}/>
        </MemoryRouter>
    );
};
const hasProvider = () => jest.spyOn(providerVersionHook, 'useProviderVersion').mockImplementation(() => (providerResult));

describe("<ViewProviderResults />", () => {
    it('will render the correct number of breadcrumbs', () => {
        hasProvider();
        const {container} = renderPage();
        expect(container.getElementsByClassName('govuk-breadcrumbs__list-item')).toHaveLength(5);
    });
});