import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Section } from "../types/Sections";
import { PermissionStatus } from "../components/PermissionStatus";
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";
import { useSelector } from "react-redux";
import { AppState } from "../states/AppState";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../components/Breadcrumbs";
import {TemplateSearchRequest} from "../types/searchRequestViewModel";
import {DateFormatter} from "../components/DateFormatter";
import {TemplateSearchResponse} from "../types/TemplateBuilderDefinitions";
import {useEffectOnce} from "../hooks/useEffectOnce";
import {searchForTemplates} from "../services/templateBuilderDatasourceService";
import {LoadingStatus} from "../components/LoadingStatus";
import {CollapsiblePanel} from "../components/CollapsiblePanel";

export const Templates = () => {
    const [canCreateTemplate, setCanCreateTemplate] = useState<boolean>(false);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [haveResults, setHaveResults] = useState<boolean>(false);
    const [templateListResults, setTemplateListResults] = useState<TemplateSearchResponse>({
        facets: [], results: [], totalCount: 0, totalErrorCount: 0
    });
    const initialSearch: { pageNumber: number; top: number } = { pageNumber: 1,  top: 100 };
    const [searchCriteria, setSearchCriteria] = useState(initialSearch);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);
    function getEffectiveCanCreateTemplate(fundingStreamPermissions: FundingStreamPermissions[]) {
        return fundingStreamPermissions.some(resolveCreateTemplates);
    }
    function resolveCreateTemplates(permission: FundingStreamPermissions) {
        return permission.canCreateTemplates;
    }
    useEffect(() => {
        let missingPermissions = [];
        if (!canCreateTemplate) {
            missingPermissions.push("create");
        }
        setMissingPermissions(missingPermissions);
    }, [canCreateTemplate]);
    useEffect(() => {
        const permissionsToApply = permissions ? permissions : [];
        setCanCreateTemplate(getEffectiveCanCreateTemplate(permissionsToApply));
    }, [permissions]);

    function populateTemplates(criteria: TemplateSearchRequest) {
        const getAllTemplates = async () => {
            const result = await searchForTemplates(criteria);
            return result.data as TemplateSearchResponse;
        };
        getAllTemplates().then((result) => {
            setTemplateListResults(result);
            setHaveResults(result.results.length > 0);
            setIsLoading(false);
        });
    }
    useEffectOnce(() => {
        populateTemplates(searchCriteria);
    });

    return (
        <div>
            <Header location={Section.Templates} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Templates"} />
                </Breadcrumbs>
                <PermissionStatus requiredPermissions={missingPermissions} />
                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Templates</h1>
                    {canCreateTemplate &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                            <Link to="/CreateTemplate" id="create-template-link"
                                  className="govuk-button govuk-button--primary"
                                  data-module="govuk-button">
                                Create a new template
                            </Link>
                        </div>
                    </div>}
                </div>

                <div className="govuk-grid-row" hidden={!isLoading}>
                    <LoadingStatus title={"Loading templates list"}
                                   description={"Please wait whilst the templates list is loading"}
                    />
                </div>
                <div className="govuk-grid-row" hidden={isLoading}>
                <div className="govuk-grid-column-full">
                    {haveResults &&
                    <table className="govuk-table" id="templates-table">
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">Template</th>
                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Funding Stream</th>
                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Funding Period</th>
                            <th scope="col" className="govuk-table__header govuk-!-width-one-half">Last Amend</th>
                            <th scope="col" className="govuk-table__header govuk-!-width-one-quarter">Status</th>
                        </tr>
                        </thead>
                        <tbody className="govuk-table__body" id="mainContentResults">
                        {templateListResults.results.map(template =>
                            <tr key={template.id} className="govuk-table__row">
                                <th scope="row" className="govuk-table__header"><Link
                                    to={`/TemplateBuilder/${template.id}`}>{template.name}</Link></th>
                                <td className="govuk-table__cell">{template.fundingStreamId}</td>
                                <td className="govuk-table__cell">{template.fundingPeriodId}</td>
                                <td className="govuk-table__cell"><DateFormatter date={template.lastUpdatedDate} utc={false}/></td>
                                <td className="govuk-table__cell">{"Draft"}</td>
                            </tr>)
                        }
                        </tbody>
                    </table>
                    }
                    {!haveResults &&
                        <p className="govuk-body">There are no records to match your search</p>
                    }
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};
