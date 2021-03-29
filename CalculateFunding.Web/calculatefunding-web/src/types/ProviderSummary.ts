export interface ProviderSummary {
    id: string;
    providerVersionId: string;
    providerId: string;
    name: string;
    urn: string;
    ukprn: string;
    upin: string;
    establishmentNumber: string;
    dfeEstablishmentNumber: string;
    authority: string;
    providerType: string;
    providerTypeCode: string;
    providerSubType: string;
    providerSubTypeCode: string;
    dateOpened?: any;
    dateClosed?: any;
    providerProfileIdType: string;
    laCode: string;
    navVendorNo: string;
    crmAccountId: string;
    legalName: string;
    status: string;
    statusCode: string;
    phaseOfEducation: string;
    reasonEstablishmentOpenedCode: string;
    reasonEstablishmentClosedCode: string;
    phaseOfEducationCode: string;
    statutoryLowAge: string;
    statutoryHighAge: string;
    officialSixthFormCode: string;
    officialSixthFormName: string;
    previousLaCode: string;
    previousLaName: string;
    previousEstablishmentNumber: string;
    successor: string;
    trustStatus: string;
    trustName: string;
    trustCode: string;
    localAuthorityName: string;
    companiesHouseNumber: string;
    groupIdNumber: string;
    town: string;
    postcode: string;
    rscRegionName: string;
    rscRegionCode: string;
    governmentOfficeRegionName: string;
    governmentOfficeRegionCode: string;
    districtName: string;
    districtCode: string;
    wardName: string;
    wardCode: string;
    censusWardName: string;
    censusWardCode: string;
    middleSuperOutputAreaName: string;
    middleSuperOutputAreaCode: string;
    parliamentaryConstituencyName: string;
    parliamentaryConstituencyCode: string;
    localGovernmentGroupTypeName?: any;
    localGovernmentGroupTypeCode?: any;
    countryName: string;
    countryCode: string;
    paymentOrganisationId: string;
    paymentOrganisationName: string;
    paymentOrganisationUpin: string;
    paymentOrganisationTrustCode: string;
    paymentOrganisationLaCode: string;
    paymentOrganisationUrn: string;
    paymentOrganisationCompanyHouseNumber: string;
    paymentOrganisationType: string;
    paymentOrganisationUkprn: string;
}

export interface ProviderTransactionSummary {
    status: number;
    results: Result[];
    fundingTotal: string;
    latestStatus: string;
}

export interface Result {
    status: string;
    author: string;
    dateChanged: string;
    fundingStreamValue: string;
    variationReasons: string[];
}



