import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link, useParams} from "react-router-dom";
import {LoadingStatus} from "../../components/LoadingStatus";
import {DateFormatter} from "../../components/DateFormatter";
import React, {useEffect, useState} from "react";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getTemplateById, getVersionsOfTemplate} from "../../services/templateBuilderDatasourceService";
import Pagination from "../../components/Pagination";
import {GetTemplateVersionsResponse, TemplateResponse, TemplateStatus, TemplateVersionSummary} from "../../types/TemplateBuilderDefinitions";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {Footer} from "../../components/Footer";
import {AxiosError} from "axios";

export const ListVersions = () => {
    let {templateId} = useParams();
    const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(true);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState<boolean>(true);
    const [template, setTemplate] = useState<TemplateResponse>();
    const [totalResultCount, setTotalResults] = useState<number>(0);
    const [results, setResults] = useState<TemplateVersionSummary[]>();
    const [page, setPage] = useState<number>(1);
    const [includeDrafts, setIncludeDrafts] = useState<boolean>(true);
    const [includePublished, setIncludePublished] = useState<boolean>(true);
    const [errors, setErrors] = useState<string[]>([]);
    const itemsPerPage = 10;

    function loadTemplate() {
        const getTemplate = async () => {
            const result = await getTemplateById(templateId);
            return result.data as TemplateResponse;
        };
        setIsLoadingTemplate(true);
        getTemplate().then((result) => {
            setTemplate(result);
            setIsLoadingTemplate(false);
        }).catch((error: AxiosError) => {
            const response = error.response;
            if (!response) {
                setErrors(errors => [...errors, `Error whilst fetching template: ${response.statusText}`]);
            }
        }).finally(() => setIsLoadingTemplate(false));
    }

    useEffectOnce(() => {
        loadTemplate();
    });

    useEffect(() => {
        function loadTemplateVersions() {
            setIsLoadingVersions(true);
            const getVersions = async () => {
                const statuses: TemplateStatus[] = [
                    ...includeDrafts ? [TemplateStatus.Draft] : [],
                    ...includePublished ? [TemplateStatus.Published] : [],
                ]
                const result = await getVersionsOfTemplate(templateId, page, itemsPerPage, statuses);
                return result.data as GetTemplateVersionsResponse;
            };
            if (!includeDrafts && !includePublished) {
                setResults([]);
                setTotalResults(0);
                setIsLoadingVersions(false);
            } else {
                getVersions().then((result) => {
                    setResults(result.pageResults);
                    setTotalResults(result.totalCount);
                }).catch((error: AxiosError) => {
                    const response = error.response;
                    if (!response) {
                        setErrors(errors => [...errors, `Error whilst fetching versions: ${response.statusText}`]);
                    }
                }).finally(() => setIsLoadingVersions(false));
            }
        }
        loadTemplateVersions();
    }, [page, includeDrafts, includePublished, templateId]);

    function onStatusFilterChanged(e: React.ChangeEvent<HTMLInputElement>) {
        setPage(1);
        const status = e.target.value as TemplateStatus;
        if (status === TemplateStatus.Draft) {
            setIncludeDrafts(e.target.checked);
        } else if (status === TemplateStatus.Published) {
            setIncludePublished(e.target.checked);
        }
    }

    const onChangePage = async (newPage: number) => {
        setPage(newPage);
    }
    
    return (
        <div>
            <Header location={Section.Templates}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate Funding"} url={"/"}/>
                    <Breadcrumb name={"Templates"} url={"/Templates/List"}/>
                    <Breadcrumb name={template ? template.name : "Template"} url={`/Templates/${templateId}/Edit`}/>
                    <Breadcrumb name={"Template Versions"}/>
                </Breadcrumbs>
                <div className="govuk-main-wrapper">
                    {errors.length > 0 &&
                    <div className="govuk-error-summary"
                         aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <ul className="govuk-list govuk-error-summary__list">
                                {errors.map((error, index) =>
                                    <li key={index}>
                                        <span className="govuk-error-message">{error}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>}

                    <div className="govuk-grid-row" hidden={!isLoadingTemplate && !isLoadingVersions}>
                        <LoadingStatus title={"Loading"} description={"Please wait whilst the template versions are loading"}/>
                    </div>
                    
                    {!isLoadingTemplate && template &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-xl">{template && template.name}</h1>
                            <h3 className="govuk-caption-l govuk-!-padding-bottom-5">View or restore previous versions of the template.</h3>
                            <span className="govuk-caption-m">Funding stream</span>
                            <h3 className="govuk-heading-m">{template && template.fundingStreamName}</h3>
                            <span className="govuk-caption-m">Funding period</span>
                            <h3 className="govuk-heading-m">{template && template.fundingPeriodName}</h3>
                        </div>
                    </div>
                    }
                    {results && template &&
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                            <form id="filters">
                                <CollapsiblePanel title={"Filter by status"} expanded={false}>
                                    <fieldset className="govuk-fieldset">
                                        <div className="govuk-checkboxes">
                                            <div className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`status-${TemplateStatus.Draft}`}
                                                       name={`status-${TemplateStatus.Draft}`}
                                                       type="checkbox"
                                                       checked={includeDrafts}
                                                       value={TemplateStatus.Draft}
                                                       onChange={(e) => onStatusFilterChanged(e)}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`status-${TemplateStatus.Draft}`}>
                                                    {TemplateStatus.Draft}
                                                </label>
                                            </div>
                                            <div className="govuk-checkboxes__item">
                                                <input className="govuk-checkboxes__input"
                                                       id={`status-${TemplateStatus.Published}`}
                                                       name={`status-${TemplateStatus.Published}`}
                                                       type="checkbox"
                                                       checked={includePublished}
                                                       value={TemplateStatus.Published}
                                                       onChange={(e) => onStatusFilterChanged(e)}/>
                                                <label className="govuk-label govuk-checkboxes__label"
                                                       htmlFor={`status-${TemplateStatus.Published}`}>
                                                    {TemplateStatus.Published}
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </CollapsiblePanel>
                            </form>
                        </div>
                        <div className="govuk-grid-column-two-thirds">
                            {totalResultCount > 0 && results && template &&
                            <div>
                                <table className="govuk-table" id="templates-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Template version</th>
                                        <th scope="col" className="govuk-table__header">Status</th>
                                        <th scope="col" className="govuk-table__header">Last Updated</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body" id="mainContentResults">
                                    {results.map(item =>
                                        <tr key={item.version} className="govuk-table__row">
                                            <th scope="row" className="govuk-table__header">
                                                <Link to={`/Templates/${template.templateId}/Versions/${item.version}`}
                                                      data-testid={"version-" + item.version}
                                                >Version {item.majorVersion}.{item.minorVersion}</Link>
                                            </th>
                                            <td className="govuk-table__cell" data-testid={"status-" + item.version}>
                                                {item.status === TemplateStatus.Draft && item.version === template.version &&
                                                <span><strong className="govuk-tag govuk-tag--blue">In Progress</strong></span>}
                                                {item.status === TemplateStatus.Draft && item.version !== template.version &&
                                                <span><strong className="govuk-tag govuk-tag--grey">Draft</strong></span>}
                                                {item.status === TemplateStatus.Published &&
                                                <span><strong className="govuk-tag govuk-tag--green">Published</strong></span>}
                                            </td>
                                            <td className="govuk-table__cell">
                                                <DateFormatter date={item.lastModificationDate} utc={false}/><br/>
                                                by {item.authorName}
                                            </td>
                                        </tr>)
                                    }
                                    </tbody>
                                </table>

                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <Pagination callback={onChangePage}
                                                    currentPage={page}
                                                    lastPage={Math.ceil(totalResultCount / itemsPerPage)}/>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <p className="govuk-body-s">Showing {(page - 1) * itemsPerPage + 1} - {(page - 1) * itemsPerPage + results.length} of {totalResultCount} results</p>
                                    </div>
                                </div>
                            </div>
                            }
                            {!isLoadingVersions && totalResultCount === 0 &&
                            <div className="govuk-grid-column-full" data-testid="no-results">
                                <p className="govuk-body">There are no records to match your search</p>
                            </div>
                            }
                        </div>
                    </div>
                    }
                </div>
            </div>
            <Footer/>
        </div>
    );
}
