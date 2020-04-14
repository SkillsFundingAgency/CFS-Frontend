import React, {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Banner} from "../../components/Banner";
import {RouteComponentProps} from "react-router";
import {Section} from "../../types/Sections";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {getProfileVariationPointers} from "../../actions/ViewSpecificationsActions";
import {useDispatch, useSelector} from "react-redux";
import {ViewSpecificationState} from "../../states/ViewSpecificationState";
import {AppState} from "../../states/AppState";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import {SpecificationSummary} from "../../types/SpecificationSummary";

export interface EditVariationPointsRouteProps {
    specificationId: string;
}

export function EditVariationPoints({match}: RouteComponentProps<EditVariationPointsRouteProps>) {
    const dispatch = useDispatch();
    const specificationId = match.params.specificationId;
    const [specificationName, setSpecificationName] = useState<string>("");
    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View specifications",
            url: "/app/SpecificationsList"
        },
        {
            name: specificationName,
            url: `/app/ViewSpecification/${specificationId}`
        },
        {
            name: "Edit specification",
            url: null
        }
    ];

    useEffectOnce(() => {
        const getSpecification = async () => {
            const specificationResult = await getSpecificationSummaryService(specificationId);
            return specificationResult;
        };
        getSpecification().then((result) => {
            const viewSpecification = result.data as SpecificationSummary;
            setSpecificationName(viewSpecification.name);
        });
    });


    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <fieldset className="govuk-fieldset" id="update-specification-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Variation occurence
                        </h1>
                    </legend>
                </fieldset>
            </div>
        </div>
        <Footer/>
    </div>
}
