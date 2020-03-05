import {ProviderState} from "../states/ProviderState";
import {ProviderActions, ProviderActionTypes} from "../actions/ProviderActions";

const initialState: ProviderState = {
    providerSummary: {
        authority: "",
        countryCode: "",
        countryName: "",
        crmAccountId: "",
        dateClosed: "",
        dateOpened: "",
        dfeEstablishmentNumber: "",
        establishmentNumber: "",
        id: "",
        laCode: "",
        legalName: "",
        localGovernmentGroupTypeCode: "",
        localGovernmentGroupTypeName: "",
        name: "",
        navVendorNo: "",
        phaseOfEducation: "",
        postcode: "",
        providerId: "",
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
        urn: ""
    },
    providerTransactionSummary: {
        results: [],
        status: -1,
        latestStatus: "",
        fundingTotal: ""
    },
    profiling:
        {
            totalAllocation: 0,
            previousAllocation: 0,
            profilingInstallments: []
        }
};

export function reduceProvider(state: ProviderState = initialState, action: ProviderActions): ProviderState {
    switch (action.type) {
        case ProviderActionTypes.GET_PROVIDERBYIDANDVERSION:
            return {...state, providerSummary: action.payload};
        case ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS:
            return {...state, providerTransactionSummary: action.payload};
        case ProviderActionTypes.GET_PROFILING:
            return {...state, profiling: action.payload};
        default:
            return state;
    }
}