import React, {useState} from 'react';
import {Header} from "../../components/Header";
import {Footer} from "../../components/Footer";
import {Section} from "../../types/Sections";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {TemplateSearchRequest} from "../../types/publishedProviderSearchRequest";
import {DateFormatter} from "../../components/DateFormatter";
import {TemplatePermissions, TemplateSearchResponse, TemplateStatus} from "../../types/TemplateBuilderDefinitions";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {searchForTemplates} from "../../services/templateBuilderDatasourceService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useTemplatePermissions} from "../../hooks/useTemplatePermissions";
import {useHistory} from 'react-router';

export const ListTemplates = () => {
    const [haveResults, setHaveResults] = useState<boolean>(false);
    const [templateListResults, setTemplateListResults] = useState<TemplateSearchResponse>({
        facets: [], results: [], totalCount: 0, totalErrorCount: 0
    });
    const initialSearch: { pageNumber: number; top: number } = {pageNumber: 1, top: 100};
    const [searchCriteria, setSearchCriteria] = useState(initialSearch);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {canCreateTemplate, missingPermissions} = useTemplatePermissions([TemplatePermissions.Create]);

    const history = useHistory();

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
        window.scrollTo(0, 0);
        populateTemplates(searchCriteria);
    });

    const handleTemplateLinkClick = (e: React.MouseEvent, templateId: string) => {
        e.preventDefault();
        if (e.shiftKey) {
            history.push(`/Templates/${templateId}/Edit?disableUndo=true`);
       } else {
           history.push(`/Templates/${templateId}/Edit`);
       }
    }

    return (
        <div>
            <Header location={Section.Templates}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"}/>
                    <Breadcrumb name={"Templates"}/>
                </Breadcrumbs>
                <PermissionStatus requiredPermissions={missingPermissions}/>
                <div className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">Templates</h1>
                    <h3 className="govuk-caption-xl govuk-!-padding-bottom-5">View and edit existing templates</h3>
                    {canCreateTemplate &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                            <Link to="/Templates/Create" 
                                  id="create-template-link"
                                  data-testid={"create-template-link"}
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
                        <table className="govuk-table" id="templates-table" data-testid={"template-results"}>
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">Template</th>
                                <th scope="col" className="govuk-table__header">Last Updated</th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body" id="mainContentResults">
                            {templateListResults.results.map(template =>
                                <tr className="govuk-table__row" key={template.id} data-testid={`template-result-${template.id}`}>
                                    <th scope="row" className="govuk-table__header">
                                        <Link to={""} onClick={(e) => handleTemplateLinkClick(e, `${template.id}`)}>{template.name}</Link>
                                        <div className="govuk-!-margin-top-3">
                                            <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                                                <summary className="govuk-details__summary">
                                                    <span className="govuk-details__summary-text">
                                                        Template details
                                                    </span>
                                                </summary>
                                                <div className="govuk-details__text">
                                                    <p className="govuk-body"><strong>Funding stream:</strong> &nbsp; {template.fundingStreamName}</p>
                                                    <p className="govuk-body"><strong>Funding period:</strong> &nbsp; {template.fundingPeriodName}</p>
                                                    <p className="govuk-body"><strong>Current version:</strong> &nbsp;
                                                        <Link to={`/Templates/${template.id}/Edit`} className="govuk-link" data-testid={`template-link-${template.id}`}>
                                                            {template.currentMajorVersion}.{template.currentMinorVersion}
                                                        </Link> &nbsp;
                                                            {template.status === TemplateStatus.Draft &&
                                                        <span><strong className="govuk-tag govuk-tag--blue govuk-!-margin-left-2">In Progress</strong></span>}
                                                            {template.status === TemplateStatus.Published &&
                                                        <span><strong className="govuk-tag govuk-tag--green govuk-!-margin-left-2">Published</strong></span>}
                                                    </p>
                                                    <p className="govuk-body">
                                                        <Link to={`/Templates/${template.id}/Versions`} className="govuk-link" data-testid={`versions-link-${template.id}`}>
                                                            View all versions
                                                        </Link>
                                                    </p>
                                                </div>
                                            </details>
                                        </div>
                                    </th>
                                    <td className="govuk-table__cell"><DateFormatter date={template.lastUpdatedDate} utc={false}/></td>
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
            <Footer/>
        </div>
    );
};
