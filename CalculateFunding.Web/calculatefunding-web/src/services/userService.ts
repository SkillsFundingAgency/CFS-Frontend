import axios from "axios"

let baseURL = "/api/users";

export async function getUserPermissionsService(specificationId: string) {
    return axios(`${baseURL}/effectivepermissions/${specificationId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}