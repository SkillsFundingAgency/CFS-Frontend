import React, { MouseEvent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CollapsiblePanel } from "../../components/CollapsiblePanel";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { SearchBox } from "../../components/SearchBox";
import { TableNavBottom } from "../../components/TableNavBottom";
import { Title } from "../../components/Title";
import { useTemplatePermissions } from "../../hooks/TemplateBuilder/useTemplatePermissions";
import { useErrors } from "../../hooks/useErrors";
import { searchForTemplates } from "../../services/templateBuilderDatasourceService";
import { Section } from "../../types/Sections";
import {
  TemplatePermissions,
  TemplateSearchResponse,
  TemplateStatus,
} from "../../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../../types/templateSearchRequest";

export const ListTemplates = () => {
  const [haveResults, setHaveResults] = useState<boolean>(false);
  const [templateListResults, setTemplateListResults] = useState<TemplateSearchResponse>({
    facets: [],
    pagerState: {
      lastPage: 0,
      currentPage: 0,
      pages: [],
      displayNumberOfPages: 0,
      nextPage: 0,
      previousPage: 0,
    },
    results: [],
    totalCount: 0,
    totalErrorCount: 0,
    startItemNumber: 0,
    endItemNumber: 0,
  });
  const initialSearch: { pageNumber: number; top: number } = { pageNumber: 1, top: 20 };
  const [searchCriteria, setSearchCriteria] = useState<TemplateSearchRequest>(
    initialSearch as TemplateSearchRequest
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { canCreateTemplate, missingPermissions } = useTemplatePermissions([TemplatePermissions.Create]);
  const { errors, addError } = useErrors();
  const history = useHistory();

  const getAllTemplates = async () => {
    try {
      const result = await searchForTemplates(searchCriteria);
      const templateSearchResponse = result.data as TemplateSearchResponse;
      setTemplateListResults(templateSearchResponse);
      setHaveResults(templateSearchResponse.results.length > 0);
    } catch (err: any) {
      addError({ error: err, description: "Error while getting templates" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTemplates();
  }, [searchCriteria]);

  const handleTemplateLinkClick = (e: MouseEvent, templateId: string) => {
    e.preventDefault();
    if (e.shiftKey) {
      history.push(`/Templates/${templateId}/Edit?disableUndo=true`);
    } else {
      history.push(`/Templates/${templateId}/Edit`);
    }
  };

  function filterBySearchTerm(searchTerm: string) {
    if (searchTerm.length === 0 || searchTerm.length > 2) {
      setIsLoading(true);
      setSearchCriteria((prevState) => {
        return { ...prevState, searchTerm: searchTerm, pageNumber: 1 };
      });
    }
  }

  const setPagination = (pageNumber: number) => {
    setSearchCriteria((prevState) => {
      return { ...prevState, pageNumber: pageNumber };
    });
  };

  return (
    <Main location={Section.Templates}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Templates"} />
      </Breadcrumbs>
      <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoading} />
      <MultipleErrorSummary errors={errors} />
      <LoadingStatus
        title={"Loading templates list"}
        description={"Please wait whilst the templates list is loading"}
        hidden={!isLoading}
      />

      <Title title={"Templates"} titleCaption={"Create and manage funding templates for funding line calculation hierarchies for any given funding stream and period."} />

      {canCreateTemplate && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Link
              to="/Templates/Create"
              id="create-template-link"
              data-testid={"create-template-link"}
              className="govuk-button govuk-button--primary"
              data-module="govuk-button"
            >
              Create a new template
            </Link>
          </div>
        </div>
      )}
      <div className="govuk-grid-row" hidden={isLoading}>
        <div className="govuk-grid-column-one-third">
          <CollapsiblePanel title={"Search"} isExpanded={true}>
            <label className="govuk-label filterLabel" htmlFor="filter-by-type">
              Search
            </label>
            <SearchBox callback={filterBySearchTerm} timeout={900} />
          </CollapsiblePanel>
        </div>
        <div className="govuk-grid-column-two-thirds">
          {haveResults && (
            <table className="govuk-table" id="templates-table" data-testid={"template-results"}>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Template
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body" id="mainContentResults">
                {templateListResults.results.map((template) => (
                  <tr
                    className="govuk-table__row"
                    key={template.id}
                    data-testid={`template-result-${template.id}`}
                  >
                    <th scope="row" className="govuk-table__header">
                      <Link
                        to={""}
                        onClick={(e) => handleTemplateLinkClick(e as MouseEvent, `${template.id}`)}
                      >
                        {template.name}
                      </Link>
                      <div className="govuk-!-margin-top-3">
                        <details
                          className="govuk-details govuk-!-margin-bottom-0"
                          data-module="govuk-details"
                        >
                          <summary className="govuk-details__summary">
                            <span className="govuk-details__summary-text">Template details</span>
                          </summary>
                          <div className="govuk-details__text">
                            <p className="govuk-body">
                              <strong>Funding stream:</strong> &nbsp; {template.fundingStreamName}
                            </p>
                            <p className="govuk-body">
                              <strong>Funding period:</strong> &nbsp; {template.fundingPeriodName}
                            </p>
                            <p className="govuk-body">
                              <strong>Current version:</strong> &nbsp;
                              <Link
                                to={`/Templates/${template.id}/Edit`}
                                className="govuk-link"
                                data-testid={`template-link-${template.id}`}
                              >
                                {template.currentMajorVersion}.{template.currentMinorVersion}
                              </Link>{" "}
                              &nbsp;
                              {template.status === TemplateStatus.Draft && (
                                <span>
                                  <strong className="govuk-tag govuk-tag--blue govuk-!-margin-left-2">
                                    In Progress
                                  </strong>
                                </span>
                              )}
                              {template.status === TemplateStatus.Published && (
                                <span>
                                  <strong className="govuk-tag govuk-tag--green govuk-!-margin-left-2">
                                    Published
                                  </strong>
                                </span>
                              )}
                            </p>
                            <p className="govuk-body">
                              <Link
                                to={`/Templates/${template.id}/Versions`}
                                className="govuk-link"
                                data-testid={`versions-link-${template.id}`}
                              >
                                View all versions
                              </Link>
                            </p>
                          </div>
                        </details>
                      </div>
                    </th>
                    <td className="govuk-table__cell">
                      <DateTimeFormatter date={template.lastUpdatedDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!haveResults && <p className="govuk-body">There are no records to match your search</p>}
          <BackToTop id={"listTemplates"} />

          <TableNavBottom
            currentPage={templateListResults?.pagerState?.currentPage}
            lastPage={templateListResults?.pagerState?.lastPage}
            totalCount={templateListResults?.totalCount}
            totalResults={templateListResults?.totalCount}
            startItemNumber={templateListResults?.startItemNumber}
            endItemNumber={templateListResults?.endItemNumber}
            onPageChange={setPagination}
          />
        </div>
      </div>
    </Main>
  );
};
