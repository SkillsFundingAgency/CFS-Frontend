import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import React, {createElement, createElement as create, useRef, useState} from "react";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {
    generateCsvForApprovalBatch,
    generateCsvForApprovalAll, generateCsvForReleaseAll,
    generateCsvForReleaseBatch
} from "../../services/publishService";
import {AxiosError} from "axios";
import {PublishProviderDataDownload} from "../../types/PublishedProvider/PublishProviderDataDownload";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingFieldStatus} from "../LoadingFieldStatus";

export function CsvDownloadPublishedProviders(props: { actionType: FundingActionType, specificationId: string, error: (errorMessage: string, description?: string, fieldName?: string) => void }) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const [url, setUrl] = useState<string>("");

    useEffectOnce(() => {
        if (props.actionType === FundingActionType.Approve)
            if (state.providerVersionIds.length > 0) {
                generateCsvForApprovalBatch(props.specificationId, state.providerVersionIds).then((response => {
                    if (response.status === 200) {
                        setUrl((response.data as PublishProviderDataDownload).url);

                    }
                    if (response.status === 404) {
                        props.error(response.statusText);
                    }
                }))
                    .catch(
                        (err: AxiosError) =>
                            props.error(err.message)
                    )
            } else {
                generateCsvForApprovalAll(props.specificationId).then((response => {
                    if (response.status === 200) {
                        setUrl((response.data as PublishProviderDataDownload).url);
                    }
                    if (response.status === 404) {
                        props.error(response.statusText);
                    }
                })).catch(
                    (err: AxiosError) => props.error(err.message));
            }

        if (props.actionType === FundingActionType.Release) {
            if (state.providerVersionIds.length > 0) {
                generateCsvForReleaseBatch(props.specificationId, state.providerVersionIds).then((response => {
                    if (response.status === 200) {
                        setUrl((response.data as PublishProviderDataDownload).url);
                    }
                    if (response.status === 404) {
                        props.error(response.statusText);
                    }
                })).catch(
                    (err: AxiosError) => props.error(err.message))
            } else {
                generateCsvForReleaseAll(props.specificationId).then((response => {
                    if (response.status === 200) {
                        setUrl((response.data as PublishProviderDataDownload).url);
                    }
                    if (response.status === 404) {
                        props.error(response.statusText);
                    }
                })).catch(
                    (err: AxiosError) => props.error(err.message));
            }
        }

    });

    return url === "" ? <LoadingFieldStatus title={"Please wait"} /> : <a href={url}>Export all as CSV</a>
}