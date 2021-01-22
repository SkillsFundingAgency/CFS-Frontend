import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import React, {useState} from "react";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import * as publishService from "../../services/publishService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorProps} from "../../hooks/useErrors";

export function CsvDownloadPublishedProviders(
    props: {
        actionType: FundingActionType,
        specificationId: string,
        addError: (props: ErrorProps) => void
    }) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const [url, setUrl] = useState<string>("");

    const generateCsv = async () => {
        const isBatch = state.providerVersionIds && state.providerVersionIds.length > 0;
        try {
            if (props.actionType === FundingActionType.Approve) {
                const response = isBatch ?
                    await publishService.generateCsvForApprovalBatch(props.specificationId, state.providerVersionIds) :
                    await publishService.generateCsvForApprovalAll(props.specificationId);
                setUrl(response.data.url);
            }

            if (props.actionType === FundingActionType.Release) {
                const response = isBatch ?
                    await publishService.generateCsvForReleaseBatch(props.specificationId, state.providerVersionIds) :
                    await publishService.generateCsvForReleaseAll(props.specificationId);
                setUrl(response.data.url);
            }
        } catch (err) {
            props.addError({error: err, description: "Error while generating CSV"});
        }
    }
    useEffectOnce(() => {
        generateCsv()
            .catch(err => props.addError({error: err, description: "Error while generating CSV"}));
    });

    return url === "" ? <LoadingFieldStatus title={"Generating export of providers"}/> : <a href={url}>Export all as CSV</a>
}