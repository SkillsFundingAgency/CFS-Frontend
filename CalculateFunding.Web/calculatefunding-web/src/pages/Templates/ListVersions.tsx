import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { SearchFilterContainer, SearchFilterSection, SearchSidebar } from "../../components/SearchFilterContainer";
import { TableNavBottom } from "../../components/TableNavBottom";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { useTemplate } from "../../hooks/TemplateBuilder/useTemplate";
import { useTemplateVersions } from "../../hooks/TemplateBuilder/useTemplateVersions";
import { useErrors } from "../../hooks/useErrors";
import { useToggle } from "../../hooks/useToggle";
import { Section } from "../../types/Sections";
import { TemplateStatus, TemplateVersionSearchQuery, } from "../../types/TemplateBuilderDefinitions";

export interface TemplateRoute {
  templateId: string;
}

export const ListVersions = () => {
  const { templateId } = useParams<TemplateRoute>();
  const itemsPerPage = 10;
  const [searchCriteria, setSearchCriteria] = useState<TemplateVersionSearchQuery>({
    templateId,
    page: 1,
    itemsPerPage,
  });
  const { errors, addError } = useErrors();
  const { template, isLoadingTemplate } = useTemplate(
    templateId,
    {
      onError: err => addError({
        error: err,
        description: "Error whilst fetching template"
      })
    });
  const { templateVersions, isLoadingTemplateVersions } = useTemplateVersions(
    searchCriteria,
    {
      onError: err => addError({
        error: err,
        description: "Error whilst searching template versions"
      })
    });

  const {
    isExpanded,
    toggleExpanded,
  } = useToggle();


  const isTemplateStatus = (arg: any): arg is TemplateStatus => {
    return !!(arg as TemplateStatus)?.length;
  }

  const onStatusAdded = (extraStatus: string) => {
    if (isTemplateStatus(extraStatus)) {
      setSearchCriteria(prev => ({
        ...prev,
        page: 1,
        statuses: [...(prev.statuses ?? []).filter(s => s !== extraStatus).concat([extraStatus])]
      }));
    }
  };

  const onStatusRemoved = (removedStatus: string) => {
    if (isTemplateStatus(removedStatus)) {
      setSearchCriteria(prev => ({
        ...prev,
        page: 1,
        statuses: [...(prev.statuses ?? []).filter(s => s !== removedStatus)]
      }));
    }
  };

  const onChangePage = async (newPage: number) => {
    setSearchCriteria(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const statusFilters = searchCriteria.statuses?.map(s => s.toString()) ?? [];

  return (
    <Main location={Section.Templates}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/"/>
        <Breadcrumb name={"Templates"} url={"/Templates/List"}/>
        <Breadcrumb name={template ? template.name : "Template"} url={`/Templates/${templateId}/Edit`}/>
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors}/>
      {isLoadingTemplate && isLoadingTemplateVersions && (
        <LoadingStatus
          title="Loading"
          description="Please wait whilst the template versions are loading"
        />
      )}
      <Title
        title={template?.name ?? ""}
        titleCaption={template && `${template.fundingStreamName} for ${template.fundingPeriodName}`}
      />

      {!!template && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <SearchSidebar enableStickyScroll={false}>
              <SearchFilterContainer>
                <SearchFilterSection title="Status"
                                     facets={[TemplateStatus.Draft, TemplateStatus.Published]}
                                     isExpanded={isExpanded}
                                     toggleExpanded={toggleExpanded}
                                     enableStandalone={true}
                                     addFilter={onStatusAdded}
                                     removeFilter={onStatusRemoved}
                                     selectedFilters={statusFilters}/>
              </SearchFilterContainer>
            </SearchSidebar>
          </div>
          <div className="govuk-grid-column-two-thirds">
            {templateVersions?.totalCount ? (
              <>
                <table className="govuk-table" id="templates-table">
                  <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                      Template version
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Status
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Last Updated
                    </th>
                  </tr>
                  </thead>
                  <tbody className="govuk-table__body" id="mainContentResults">
                  {templateVersions.pageResults.map((item) => {
                    const label = `Version ${item.majorVersion}.${item.minorVersion}`;
                    return (
                      <tr key={item.version} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                          <TextLink
                            to={`/Templates/${template.templateId}/Versions/${item.version}`}
                            id={"version-" + item.version}
                            label={label}
                          >
                            {label}
                          </TextLink>
                        </th>
                        <td className="govuk-table__cell" data-testid={"status-" + item.version}>
                          {item.status === TemplateStatus.Draft && item.version === template.version && (
                            <span>
                            <strong className="govuk-tag govuk-tag--blue">In Progress</strong>
                          </span>
                          )}
                          {item.status === TemplateStatus.Draft && item.version !== template.version && (
                            <span>
                            <strong className="govuk-tag govuk-tag--grey">Draft</strong>
                          </span>
                          )}
                          {item.status === TemplateStatus.Published && (
                            <span>
                            <strong className="govuk-tag govuk-tag--green">Published</strong>
                          </span>
                          )}
                        </td>
                        <td className="govuk-table__cell">
                          <DateTimeFormatter date={item.lastModificationDate}/>
                          <br/>
                          by {item.authorName}
                        </td>
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
                <TableNavBottom
                  totalCount={templateVersions.totalCount}
                  startItemNumber={(searchCriteria.page - 1) * itemsPerPage + 1}
                  endItemNumber={(searchCriteria.page - 1) * itemsPerPage + templateVersions.pageResults.length}
                  currentPage={searchCriteria.page}
                  lastPage={Math.ceil(templateVersions.totalCount / itemsPerPage)}
                  onPageChange={onChangePage}/>
              </>
            ) : (
              <div className="govuk-grid-column-two-thirds" data-testid="no-results">
                <p className="govuk-body">There are no records to match your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Main>
  );
};
