import {LoadingStatus} from "../LoadingStatus";
import {NoData} from "../NoData";
import * as React from "react";
import {useEffect, useState} from "react";
import {
    FundingLineProfileVariationPointer,
    ProfileVariationPointer
} from "../../types/Specifications/ProfileVariationPointer";
import {
    getProfileVariationPointersService, mergeProfileVariationPointersService,
} from "../../services/specificationService";
import {ErrorProps} from "../../hooks/useErrors";
import ProfilePatternSelector from "../Funding/ProfilePatternSelector";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {getAvailableFundingLinePeriods} from "../../services/publishService";
import {AvailableVariationPointerFundingLine} from "../../types/Publishing/AvailableVariationPointerFundingLine";

export interface VariationManagementProps {
    specificationId: string,
    fundingPeriodId: string,
    fundingStreamId: string,
    addError: (props: ErrorProps) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
}

export function VariationManagement({
                                        specificationId,
                                        fundingPeriodId,
                                        fundingStreamId,
                                        addError,
                                        clearErrorMessages
                                    }: VariationManagementProps) {
    const [profileVariationPointers, setProfileVariationPointers] = useState<FundingLineProfileVariationPointer[]>([]);
    const [isLoadingVariationManagement, setIsLoadingVariationManagement] = useState(true);
    const [updatedPointers, setUpdatedPointers] = useState<ProfileVariationPointer[] | undefined>();

    useEffect(() => {
        clearErrorMessages();
        getProfileVariationPointersService(specificationId).then((result) => {
            setProfileVariationPointers(result.data);
        }).catch(err => {
            addError({error: err, description: "Error while getting variation pointers"});
        }).finally(() => {
            setIsLoadingVariationManagement(false);
        });
    }, [specificationId]);

    const {data: availableFundingLines, isFetching: isFetchingProfilePatterns, refetch} =
        useQuery<AvailableVariationPointerFundingLine[], AxiosError>(`available-funding-periods-${specificationId}`,
            async () => (await getAvailableFundingLinePeriods(specificationId)).data,
            {
                onError: err => addError({
                    error: err.message,
                    description: "Error while loading available funding lines"
                }),
                refetchOnWindowFocus: false
            });

    function setPointer(pattern: string, pointer: AvailableVariationPointerFundingLine) {
        const splitPattern = pattern.split('-');

        const pointerPattern: ProfileVariationPointer = {
            fundingLineId: pointer.fundingLineCode,
            fundingStreamId: fundingStreamId,
            typeValue: 'Calendar',
            year: parseInt(splitPattern[0]),
            periodType: splitPattern[1],
            occurrence: parseInt(splitPattern[2])
        }

        let updatedCollection = updatedPointers === undefined ? [] : updatedPointers;
        const i = updatedCollection.findIndex(x => x.fundingLineId == pointerPattern.fundingLineId, 0)
        if (i > -1) {
            updatedPointers?.splice(i, 1);
        }

        updatedCollection?.push(pointerPattern);
        setUpdatedPointers(updatedCollection);
    }

    async function updatePointers() {
        if (updatedPointers) {
            await mergeProfileVariationPointersService(specificationId, updatedPointers).then(() => {
                refetch();
            });
        }
    }

    return (
        <section className="govuk-tabs__panel" id="variation-management">
            <LoadingStatus title={"Loading variation management"}
                           hidden={!isLoadingVariationManagement}
                           description={"Please wait whilst variation management is loading"}/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <NoData hidden={profileVariationPointers.length > 0 || isLoadingVariationManagement}/>
                </div>
                <div className="govuk-grid-column-full" hidden={profileVariationPointers.length === 0}>
                    <h2 className="govuk-heading-l">Variations</h2>
                    <p className="govuk-body">Set the instalment from which a variation should take effect.</p>
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <h4 className="govuk-heading-s">Instalment variation</h4>
                    <form>
                    <table className="govuk-table">
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th className="govuk-table__header">Funding line</th>
                            <th className="govuk-table__header">Currently set instalment</th>
                            <th className="govuk-table__header">Future instalment</th>
                        </tr>
                        </thead>
                        <tbody className="govuk__body">
                        {availableFundingLines && availableFundingLines.map((pointer, index) =>
                                <tr className="govuk-table__row" key={index}>
                                    <td className="govuk-table__header">{pointer.fundingLineName} ({pointer.fundingLineCode})</td>
                                    <td className="govuk-table__header"> {pointer.selectedPeriod === null ? "Initial allocation" :
                                        <span>
{`${pointer.selectedPeriod.periodType} ${pointer.selectedPeriod.year} Instalment ${pointer.selectedPeriod.occurrence}`}
                                    </span>}</td>
                                    <td className="govuk-table__cell">
                                        <ProfilePatternSelector profilePatternList={pointer.periods}
                                                                pointer={pointer} callback={setPointer}/>
                                    </td>
                                </tr>
                        )
                        }
                        <tr>
                            <td colSpan="2">
                                    <button className={'govuk-button govuk-!-margin-right-2'}
                                            onClick={() => updatePointers()}>Save
                                    </button>
                                <button className={'govuk-button govuk-button--secondary'} type={"reset"}>Reset future
                                    instalments
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </form>
                </div>
            </div>
        </section>
    );
}
