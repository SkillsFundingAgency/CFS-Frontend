import axios, {AxiosResponse} from "axios"
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {SpecificationSearchRequestViewModel} from "../types/SpecificationSearchRequestViewModel";
import {PublishStatus, PublishStatusModel} from "../types/PublishStatusModel";
import {CreateSpecificationModel} from "../types/Specifications/CreateSpecificationModel";
import {UpdateSpecificationModel} from "../types/Specifications/UpdateSpecificationModel";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";
import {SpecificationSummary} from "../types/SpecificationSummary";
import {FundingPeriod, Specification} from "../types/viewFundingTypes";
import {FundingStreamWithSpecificationSelectedForFunding} from "../types/SpecificationSelectedForFunding";
import {CalculationSearchResponse} from "../types/CalculationSearchResponse";
import {SpecificationListResults} from "../types/Specifications/SpecificationListResults";

const baseURL = "/api/specs";


export async function getSpecificationSummaryService(specificationId: string): 
    Promise<AxiosResponse<SpecificationSummary>> {
    return axios(`${baseURL}/specification-summary-by-id/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getAdditionalCalculationsForSpecificationService(
    calculationSearchRequestViewModel: CalculationSearchRequestViewModel):
    Promise<AxiosResponse<CalculationSearchResponse>> {
    return axios(`/api/calculations/getcalculationsforspecification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: calculationSearchRequestViewModel
    });
}

export async function getFundingStreamIdsWithSpecsService(): Promise<AxiosResponse<string[]>> {
    return axios(`${baseURL}/fundingstream-id-for-specifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingPeriodsByFundingStreamIdService(fundingStreamId: string): Promise<AxiosResponse<FundingPeriod[]>> {
    return axios(`/api/policy/fundingperiods/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getSpecificationsByFundingPeriodAndStreamIdService(fundingStreamId: string, fundingPeriodId: string): Promise<AxiosResponse<Specification[]>> {
    return axios(`${baseURL}/specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getSpecificationsByFundingPeriodAndStreamIdWithResultsService(fundingStreamId: string, fundingPeriodId: string) {
    return axios(`${baseURL}/specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}/with-results`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getAllSpecificationsService(searchRequest: SpecificationSearchRequestViewModel):
    Promise<AxiosResponse<SpecificationListResults>> {
    const queryString = require("query-string");
    const stringSearchRequest = queryString.stringify(searchRequest);

    return axios(`${baseURL}/get-all-specifications/?${stringSearchRequest}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
}

export async function approveFundingLineStructureService(specificationId: string) {
    const publishStatusEditModel: PublishStatusModel = {
        publishStatus: PublishStatus.Approved
    };

    return axios(`${baseURL}/${specificationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: publishStatusEditModel
    });
}

export async function createSpecificationService(createSpecificationViewModel: CreateSpecificationModel): 
    Promise<AxiosResponse<SpecificationSummary>> {
    return axios(`${baseURL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: createSpecificationViewModel
    });
}

export async function updateSpecificationService(updateSpecificationViewModel: UpdateSpecificationModel, specificationId: string) {
    return axios(`${baseURL}/update/${specificationId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: updateSpecificationViewModel
    });
}

export async function getDownloadableReportsService(specificationId: string, fundingPeriodId: string = "") {
    return axios(`${baseURL}/${specificationId}/get-report-metadata/${fundingPeriodId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getProfileVariationPointersService(specificationId: string) {
    return axios(`${baseURL}/${specificationId}/profile-variation-pointers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async  function setProfileVariationPointersService(specificationId:string, profileVariationPointer: ProfileVariationPointer[]) {
    return axios(`${baseURL}/${specificationId}/profile-variation-pointers`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: profileVariationPointer
    });
}

export async function getSpecificationsSelectedForFundingService(): Promise<AxiosResponse<FundingStreamWithSpecificationSelectedForFunding[]>> {
    return axios(`/api/specs/funding-selections`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getSpecificationsSelectedForFundingByPeriodAndStreamService(fundingPeriodId: string, fundingStreamId:string): Promise<AxiosResponse<Specification[]>> {
    return axios(`${baseURL}/selected-specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

