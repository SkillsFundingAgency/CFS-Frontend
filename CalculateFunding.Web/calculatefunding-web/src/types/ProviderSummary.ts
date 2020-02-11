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
    providerSubType: string;
    dateOpened?: any;
    dateClosed?: any;
    providerProfileIdType: string;
    laCode: string;
    navVendorNo: string;
    crmAccountId: string;
    legalName: string;
    status: string;
    phaseOfEducation: string;
    reasonEstablishmentOpened: string;
    reasonEstablishmentClosed: string;
    successor: string;
    trustStatus: string;
    trustName: string;
    trustCode: string;
    town: string;
    postcode: string;
    rscRegionName: string;
    rscRegionCode: string;
    localGovernmentGroupTypeName?: any;
    localGovernmentGroupTypeCode?: any;
    countryName: string;
    countryCode: string;
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
}



