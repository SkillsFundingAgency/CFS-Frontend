import {SearchRequestViewModel} from "../types/searchRequestViewModel";
import axios, {AxiosResponse} from "axios"
import {PublishProviderSearchResultViewModel} from "../types/PublishedProvider/PublishProviderSearchResultViewModel";

const baseUrl = "/api/publishedprovider";

export async function getPublishedProviderResultsService(criteria: SearchRequestViewModel): 
    Promise<AxiosResponse<PublishProviderSearchResultViewModel>> {
    return axios(`${baseUrl}/searchpublishedproviders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: criteria
    });

};