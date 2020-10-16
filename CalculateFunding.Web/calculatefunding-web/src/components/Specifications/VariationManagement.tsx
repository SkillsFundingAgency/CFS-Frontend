import {LoadingStatus} from "../LoadingStatus";
import {NoData} from "../NoData";
import {Link} from "react-router-dom";
import * as React from "react";
import {useEffect, useState} from "react";
import {ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {getProfileVariationPointersService} from "../../services/specificationService";

export function VariationManagement(props:{specificationId}){
    const [profileVariationPointers, setProfileVariationPointers] = useState<ProfileVariationPointer[]>([]);
    const [isLoadingVariationManagement, setIsLoadingVariationManagement] = useState(true);

    useEffect(() => {
        getProfileVariationPointersService(props.specificationId).then((result) => {
            const response = result;
            if (response.status === 200) {
                setProfileVariationPointers(response.data as ProfileVariationPointer[]);
            }
        }).finally(() => {
            setIsLoadingVariationManagement(false);
        });
    }, [props.specificationId]);

    return  <section className="govuk-tabs__panel" id="variation-management">
        <LoadingStatus title={"Loading variation management"}
                       hidden={!isLoadingVariationManagement}
                       description={"Please wait whilst variation management is loading"}/>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <NoData hidden={profileVariationPointers.length > 0 || isLoadingVariationManagement}/>
            </div>
            <div className="govuk-grid-column-full" hidden={profileVariationPointers.length === 0}>
                <h2 className="govuk-heading-l">Variation Management</h2>
                <p className="govuk-body">Set the installment from which a variation should take effect.</p>
            </div>
            <div className="govuk-grid-column-two-thirds">
                {
                    profileVariationPointers.map((f, index) =>
                        <dl key={index} className="govuk-summary-list">
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    {f.fundingLineId}
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    {f.typeValue} {f.year} <br/>
                                    Installment {f.occurrence}
                                </dd>
                                <dd className="govuk-summary-list__actions">
                                    <Link to={`/Specifications/EditVariationPoints/${specificationId}`}
                                          className="govuk-link">
                                        Change<span className="govuk-visually-hidden"> {f.periodType}</span>
                                    </Link>
                                </dd>
                            </div>
                        </dl>
                    )
                }
            </div>
        </div>
    </section>
}