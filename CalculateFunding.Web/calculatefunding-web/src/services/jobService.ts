import axios, {AxiosResponse} from "axios"
import {JobResponse} from "../types/jobDetails";

const baseURL = "/api/jobs";

export async function getJobStatusUpdatesForSpecification(specificationId: string, jobTypes: string): Promise<AxiosResponse<JobResponse[]>> {
    return axios(`${baseURL}/${specificationId}/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getLatestSuccessfulJob(specificationId: string, jobType: string): Promise<AxiosResponse<JobResponse | undefined>> {
    return axios(`${baseURL}/latest-success/${specificationId}/${jobType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getLatestJobByEntityId(specificationId:string, entityId:string): Promise<AxiosResponse<JobResponse | undefined>> {
    return axios(`${baseURL}/latest-by-entity-id/${specificationId}/${entityId}`, {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json'
        }
    })
}
