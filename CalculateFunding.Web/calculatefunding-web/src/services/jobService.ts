import axios, {AxiosResponse} from "axios"
import {JobResponse} from "../types/jobDetails";
import {JobType} from "../types/jobType";

const baseURL = "/api/jobs";

export async function getJobStatusUpdatesForSpecification(specificationId: string, jobTypes: JobType[]): Promise<AxiosResponse<JobResponse[]>> {
    return axios(`${baseURL}/${specificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: jobTypes
    });
}

export async function getJob(jobId: string): Promise<AxiosResponse<JobResponse | undefined>> {
    return axios(`${baseURL}/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
