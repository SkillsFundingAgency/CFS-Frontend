import axios, {AxiosResponse} from "axios"
import {JobSummary} from "../types/jobSummary";

const baseURL = "/api/jobs";

export async function getJobStatusUpdatesForSpecification(specificationId: string, jobTypes: string): Promise<AxiosResponse<JobSummary[]>> {
    return axios(`${baseURL}/${specificationId}/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

export async function getLatestSuccessfulJob(specificationId: string, jobType: string): Promise<AxiosResponse<JobSummary | undefined>> {
    return axios(`${baseURL}/latest-success/${specificationId}/${jobType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
