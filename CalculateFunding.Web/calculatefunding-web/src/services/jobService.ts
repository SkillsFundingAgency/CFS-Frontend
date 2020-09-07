import axios, {AxiosResponse} from "axios"
import {JobSummary} from "../types/jobSummary";

let baseURL = "/api/jobs";

export async function getJobStatusUpdatesForSpecification(specificationId: string, jobTypes: string): Promise<AxiosResponse<JobSummary[]>> {
    return axios(`${baseURL}/${specificationId}/${jobTypes}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
