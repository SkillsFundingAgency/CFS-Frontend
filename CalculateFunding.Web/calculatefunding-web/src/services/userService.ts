import axios, {AxiosResponse} from "axios"
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";
import {User} from "../types/User";

const baseURL = "/api/users";

export async function getUserPermissionsService(specificationId: string): Promise<AxiosResponse<EffectiveSpecificationPermission>> {
    return axios(`${baseURL}/effectivepermissions/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getAdminUsersForFundingStream(fundingStreamId: string): Promise<AxiosResponse<User[]>> {
    return axios(`${baseURL}/permissions/${fundingStreamId}/admin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}