import React, { MouseEvent, useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { SearchSidebar } from "../../components/SearchFilterContainer";
import { TableNavBottom } from "../../components/TableNavBottom";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { useTemplatePermissions } from "../../hooks/TemplateBuilder/useTemplatePermissions";
import { useTemplateSearch } from "../../hooks/TemplateBuilder/useTemplateSearch";
import { useErrors } from "../../hooks/useErrors";
import { Section } from "../../types/Sections";
import { TemplatePermissions, TemplateStatus, } from "../../types/TemplateBuilderDefinitions";
import { TemplateSearchRequest } from "../../types/templateSearchRequest";

export const ListTemplates = () => {
  const [searchCriteria, setSearchCriteria] = useState<TemplateSearchRequest>(
    {
      pageNumber: 1,
      searchTerm: "",
      top: 20,
      includeFacets: false,
      countOnly: false,
      currentPage: 1,
    }
  );
  const { errors, addError } = useErrors();
  const { canCreateTemplate, missingPermissions } = useTemplatePermissions([TemplatePermissions.Create]);
  const { templateSearchResponse, isLoadingTemplateSearchResults } = useTemplateSearch(searchCriteria, {
    onError: err => addError({ error: err, description: "Error while getting templates" })
  });
  const history = useHistory();

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
        <Breadcrumb name="Home" url="/"/>
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isLoadingTemplateSearchResults}/>
      <MultipleErrorSummary errors={errors}/>

      <Title title="Templates"
             titleCaption="Create and manage funding templates for funding line calculation hierarchies for any given funding stream and period."
      />

      {canCreateTemplate && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Link
              to="/Templates/Create"
              id="create-template-link"
              data-testid="create-template-link"
              className="govuk-button govuk-button--primary"
              data-module="govuk-button"
            >
              Create a new template
            </Link>
          </div>
        </div>
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <SearchSidebar
            updateSearchText={filterBySearchTerm}
            enableStickyScroll={false}
            enableTextSearch={true}
          />
        </div>
        <div className="govuk-grid-column-two-thirds">
          {isLoadingTemplateSearchResults && (
            <LoadingStatus
              title="Loading templates list"
              description="Please wait whilst the templates list is loading"
            />
          )}
          {!!templateSearchResponse?.results?.length && (
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
              {templateSearchResponse?.results?.map((template) => (
                <tr
                  className="govuk-table__row"
                  key={template.id}
                  data-testid={`template-result-${template.id}`}
                >
                  <th scope="row" className="govuk-table__header">
                    <TextLink
                      handleOnClick={(e) => handleTemplateLinkClick(e as MouseEvent, `${template.id}`)}
                    >
                      {template.name}
                    </TextLink>
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
                            <TextLink
                              to={`/Templates/${template.id}/Edit`}
                              id={`template-link-${template.id}`}
                            >
                              {template.currentMajorVersion}.{template.currentMinorVersion}
                            </TextLink>{" "}
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
                            <TextLink
                              to={`/Templates/${template.id}/Versions`}
                              id={`versions-link-${template.id}`}
                            >
                              View all versions
                            </TextLink>
                          </p>
                        </div>
                      </details>
                    </div>
                  </th>
                  <td className="govuk-table__cell">
                    <DateTimeFormatter date={template.lastUpdatedDate}/>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
          {templateSearchResponse?.results?.length === 0 &&
              <p className="govuk-body">There are no records to match your search</p>}
          {!!templateSearchResponse?.results?.length && (
            <>
              <TableNavBottom
                currentPage={templateSearchResponse?.pagerState?.currentPage}
                lastPage={templateSearchResponse?.pagerState?.lastPage}
                totalCount={templateSearchResponse?.totalCount}
                startItemNumber={templateSearchResponse?.startItemNumber}
                endItemNumber={templateSearchResponse?.endItemNumber}
                onPageChange={setPagination}
              />
              <BackToTop id={"listTemplates"}/>
            </>
          )}
        </div>
      </div>
    </Main>
  );
};
