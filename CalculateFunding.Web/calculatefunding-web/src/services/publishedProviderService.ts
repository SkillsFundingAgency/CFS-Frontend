import {SearchRequestViewModel} from "../types/searchRequestViewModel";
import axios from "axios"

const baseUrl = "/api/publishedprovider";


export async function getPublishedProviderResultsService(criteria: SearchRequestViewModel) {

    return axios(`${baseUrl}/searchpublishedproviders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });

};