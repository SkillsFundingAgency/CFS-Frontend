import axios, {AxiosResponse} from "axios"
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";

const baseURL = "/api/users";

export async function getUserPermissionsService(specificationId: string): Promise<AxiosResponse<EffectiveSpecificationPermission>> {
    return axios(`${baseURL}/effectivepermissions/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}