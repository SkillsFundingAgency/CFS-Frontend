import {LoadingStatus} from "../LoadingStatus";
import {NoData} from "../NoData";
import {Link} from "react-router-dom";
import * as React from "react";
import {useEffect, useState} from "react";
import {FundingLineProfileVariationPointer, ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {getProfileVariationPointersService} from "../../services/specificationService";
import {ErrorProps} from "../../hooks/useErrors";

export interface VariationManagementProps {
    specificationId: string,
    addError: (props: ErrorProps) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
}

export function VariationManagement({specificationId, addError, clearErrorMessages}: VariationManagementProps) {
    const [profileVariationPointers, setProfileVariationPointers] = useState<FundingLineProfileVariationPointer[]>([]);
    const [isLoadingVariationManagement, setIsLoadingVariationManagement] = useState(true);

    useEffect(() => {
        clearErrorMessages();
        getProfileVariationPointersService(specificationId).then((result) => {
            const response = result;
            setProfileVariationPointers(response.data as FundingLineProfileVariationPointer[]);
        }).catch(err => {
            addError({error: err, description: "Error while getting variation pointers"});
        }).finally(() => {
            setIsLoadingVariationManagement(false);
        });
    }, [specificationId]);

    return (
        <section className="govuk-tabs__panel" id="variation-management">
            <LoadingStatus title={"Loading variation management"}
                hidden={!isLoadingVariationManagement}
                description={"Please wait whilst variation management is loading"} />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <NoData hidden={profileVariationPointers.length > 0 || isLoadingVariationManagement} />
                </div>
                <div className="govuk-grid-column-full" hidden={profileVariationPointers.length === 0}>
                    <h2 className="govuk-heading-l">Variations</h2>
                    <p className="govuk-body">Set the installment from which a variation should take effect.</p>
                </div>
                <div className="govuk-grid-column-two-thirds">
                    {profileVariationPointers && profileVariationPointers.map((pointer, index) =>
                        <dl key={index} className="govuk-summary-list">
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    {pointer.fundingLineId}
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    {pointer.profileVariationPointer === null ? "Initial allocation" : <span>
                                        {`${pointer.profileVariationPointer.typeValue} ${pointer.profileVariationPointer.year}`} <br />
                                        {`Installment ${pointer.profileVariationPointer.occurrence}`}
                                    </span>}
                                </dd>
                                <dd className="govuk-summary-list__actions">
                                    <Link to={`/Specifications/EditVariationPoints/${specificationId}/${pointer.fundingLineId}`}
                                        className="govuk-link">
                                        {pointer.profileVariationPointer === null ? "Set" : "Change"}<span className="govuk-visually-hidden">
                                            {` ${pointer.profileVariationPointer !== null ? pointer.profileVariationPointer.periodType : ""}`}
                                        </span>
                                    </Link>
                                </dd>
                            </div>
                        </dl>
                    )
                    }
                </div>
            </div>
        </section>
    );
}