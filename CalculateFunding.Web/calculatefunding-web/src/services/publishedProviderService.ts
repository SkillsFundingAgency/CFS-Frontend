import {SearchRequestViewModel} from "../types/searchRequestViewModel";
import axiosInstance from "../services/axiosInterceptor"

const baseUrl = "/api/publishedprovider";


export async function getPublishedProviderResultsService(criteria: SearchRequestViewModel) {

    return axiosInstance(`${baseUrl}/searchpublishedproviders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });

};