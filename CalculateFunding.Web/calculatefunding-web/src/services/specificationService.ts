import axios from "axios";
import {CalculationSearchRequestViewModel} from "../types/CalculationSearchRequestViewModel";
import {SpecificationSearchRequestViewModel} from "../types/SpecificationSearchRequestViewModel";
import {PublishStatus, PublishStatusModel} from "../types/PublishStatusModel";
import {
    CreateSpecificationViewModel
} from "../types/Specifications/CreateSpecificationViewModel";
import {UpdateSpecificationViewModel} from "../types/Specifications/UpdateSpecificationViewModel";
import {ProfileVariationPointer} from "../types/Specifications/ProfileVariationPointer";

let baseURL = "/api/specs";

export async function getSpecificationSummaryService(specificationId: string) {
    return axios(`${baseURL}/specification-summary-by-id/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getAdditionalCalculationsForSpecificationService(calculationSearchRequestViewModel: CalculationSearchRequestViewModel) {
    return axios(`/api/calculations/getcalculationsforspecification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: calculationSearchRequestViewModel
    });
}

export async function getFundingStreamsService() {
    return axios(`${baseURL}/fundingstream-id-for-specifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getFundingPeriodsByFundingStreamIdService(fundingStreamId: string) {
    return axios(`/api/policy/fundingperiods/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getSpecificationsByFundingPeriodAndStreamIdService(fundingStreamId: string, fundingPeriodId: string) {
    return axios(`${baseURL}/specifications-by-fundingperiod-and-fundingstream/${fundingPeriodId}/${fundingStreamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getAllSpecificationsService(searchRequest: SpecificationSearchRequestViewModel) {
    const queryString = require("query-string");
    const stringSearchRequest = queryString.stringify(searchRequest);

    return axios(`${baseURL}/get-all-specifications/?${stringSearchRequest}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function changeFundingLineStateService(specificationId: string) {
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

export async function createSpecificationService(createSpecificationViewModel: CreateSpecificationViewModel) {
    return axios(`${baseURL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: createSpecificationViewModel
    });
}

export async function updateSpecificationService(updateSpecificationViewModel: UpdateSpecificationViewModel, specificationId: string) {
    return axios(`${baseURL}/update/${specificationId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: updateSpecificationViewModel
    });
}

export async function getDownloadableReportsService(specificationId: string) {
    return axios(`${baseURL}/${specificationId}/get-report-metadata/`, {
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
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: profileVariationPointer
    });
}