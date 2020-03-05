import {ProviderState} from "../../states/ProviderState";
import {reduceProvider} from "../../reducers/providerReducer";
import {ProviderActionTypes} from "../../actions/ProviderActions";
import {ProviderSummary, ProviderTransactionSummary, Result} from "../../types/ProviderSummary";
import {Profiling, ProfilingInstallments} from "../../types/Profiling";

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

describe('ProviderReducer ', () => {
    it('should handle GET_PROVIDERBYIDANDVERSION', () => {
        const expectedState = {
            "profiling": {
                "previousAllocation": 0,
                "profilingInstallments": [],
                "totalAllocation": 0,
            },
            "providerSummary": {
                "authority": "",
                "countryCode": "",
                "countryName": "",
                "crmAccountId": "",
                "dateClosed": null,
                "dateOpened": null,
                "dfeEstablishmentNumber": "",
                "establishmentNumber": "",
                "id": "",
                "laCode": "",
                "legalName": "",
                "localGovernmentGroupTypeCode": null,
                "localGovernmentGroupTypeName": null,
                "name": "",
                "navVendorNo": "",
                "phaseOfEducation": "",
                "postcode": "",
                "providerId": "",
                "providerProfileIdType": "",
                "providerSubType": "",
                "providerType": "",
                "providerVersionId": "",
                "reasonEstablishmentClosed": "",
                "reasonEstablishmentOpened": "",
                "rscRegionCode": "",
                "rscRegionName": "",
                "status": "",
                "successor": "",
                "town": "",
                "trustCode": "",
                "trustName": "",
                "trustStatus": "",
                "ukprn": "",
                "upin": "",
                "urn": "",
            },
            "providerTransactionSummary": {
                "fundingTotal": "",
                "latestStatus": "",
                "results": [],
                "status": -1,
            },
        };
        expect(reduceProvider(initialState, {
            type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION,
            payload: {
                id: "",
                providerVersionId: "",
                providerId: "",
                name: "",
                urn: "",
                ukprn: "",
                upin: "",
                establishmentNumber: "",
                dfeEstablishmentNumber: "",
                authority: "",
                providerType: "",
                providerSubType: "",
                dateOpened: null,
                dateClosed: null,
                providerProfileIdType: "",
                laCode: "",
                navVendorNo: "",
                crmAccountId: "",
                legalName: "",
                status: "",
                phaseOfEducation: "",
                reasonEstablishmentOpened: "",
                reasonEstablishmentClosed: "",
                successor: "",
                trustStatus: "",
                trustName: "",
                trustCode: "",
                town: "",
                postcode: "",
                rscRegionName: "",
                rscRegionCode: "",
                localGovernmentGroupTypeName: null,
                localGovernmentGroupTypeCode: null,
                countryName: "",
                countryCode: ""
            } as ProviderSummary
        })).toEqual(expectedState);
    });
    it('should handle GET_PUBLISHEDPROVIDERTRANSACTIONS', () => {
        const expectedState = {
            "profiling": {
                "previousAllocation": 0,
                "profilingInstallments": [],
                "totalAllocation": 0,
            },
            "providerSummary": {
                "authority": "",
                "countryCode": "",
                "countryName": "",
                "crmAccountId": "",
                "dateClosed": "",
                "dateOpened": "",
                "dfeEstablishmentNumber": "",
                "establishmentNumber": "",
                "id": "",
                "laCode": "",
                "legalName": "",
                "localGovernmentGroupTypeCode": "",
                "localGovernmentGroupTypeName": "",
                "name": "",
                "navVendorNo": "",
                "phaseOfEducation": "",
                "postcode": "",
                "providerId": "",
                "providerProfileIdType": "",
                "providerSubType": "",
                "providerType": "",
                "providerVersionId": "",
                "reasonEstablishmentClosed": "",
                "reasonEstablishmentOpened": "",
                "rscRegionCode": "",
                "rscRegionName": "",
                "status": "",
                "successor": "",
                "town": "",
                "trustCode": "",
                "trustName": "",
                "trustStatus": "",
                "ukprn": "",
                "upin": "",
                "urn": "",
            },
            "providerTransactionSummary": {
                "fundingTotal": "",
                "latestStatus": "",
                "results": [
                    {
                        "author": "",
                        "dateChanged": "",
                        "fundingStreamValue": "",
                        "status": "",
                    },
                ],
                "status": 0,
            },
        };
        expect(reduceProvider(initialState, {
            type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS,
            payload: {
                status: 0,
                results: [
                    {
                        status: "",
                        author: "",
                        dateChanged: "",
                        fundingStreamValue: "",
                    }
                ],
                fundingTotal: "",
                latestStatus: ""
            } as ProviderTransactionSummary
        })).toEqual(expectedState);
    });
    it('should handle GET_PROFILING', () => {
        const expectedState = {
            "profiling": {
                "previousAllocation": 0,
                "profilingInstallments": [
                    {
                        "installmentMonth": "",
                        "installmentNumber": 0,
                        "installmentValue": 0,
                        "isPaid": true,
                    },
                ],
                "totalAllocation": 0,
            },
            "providerSummary": {
                "authority": "",
                "countryCode": "",
                "countryName": "",
                "crmAccountId": "",
                "dateClosed": "",
                "dateOpened": "",
                "dfeEstablishmentNumber": "",
                "establishmentNumber": "",
                "id": "",
                "laCode": "",
                "legalName": "",
                "localGovernmentGroupTypeCode": "",
                "localGovernmentGroupTypeName": "",
                "name": "",
                "navVendorNo": "",
                "phaseOfEducation": "",
                "postcode": "",
                "providerId": "",
                "providerProfileIdType": "",
                "providerSubType": "",
                "providerType": "",
                "providerVersionId": "",
                "reasonEstablishmentClosed": "",
                "reasonEstablishmentOpened": "",
                "rscRegionCode": "",
                "rscRegionName": "",
                "status": "",
                "successor": "",
                "town": "",
                "trustCode": "",
                "trustName": "",
                "trustStatus": "",
                "ukprn": "",
                "upin": "",
                "urn": "",
            },
            "providerTransactionSummary": {
                "fundingTotal": "",
                "latestStatus": "",
                "results": [],
                "status": -1,
            },
        };
        expect(reduceProvider(initialState, {
            type: ProviderActionTypes.GET_PROFILING,
            payload: {
                totalAllocation: 0,
                previousAllocation: 0,
                profilingInstallments: [{
                    installmentMonth: "",
                    installmentNumber: 0,
                    installmentValue: 0,
                    isPaid: true
                }]
            } as Profiling
        })).toEqual(expectedState);
    });
});

