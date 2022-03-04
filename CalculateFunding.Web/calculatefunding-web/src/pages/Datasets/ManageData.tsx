import { Main } from "components/Main";
import React from "react";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { Section } from "../../types/Sections";

export function ManageData() {
  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
      </Breadcrumbs>
      <nav aria-label="Data management" aria-describedby="title-caption">
        <Title
          title="Manage data"
          titleCaption="Manage data source files or map them to datasets for a specification"
        />
        <section className="homepage-section-container govuk-!-margin-top-9 govuk-!-margin-bottom-9">
          <div className="govuk-grid-row">
            <div className=" govuk-grid-column-one-third">
              <h3 id=" manage-data-source-files-title" className=" govuk-heading-m">
                <TextLink to="/Datasets/ManageDataSourceFiles" describedBy=" upload-data-source-desc">
                  Manage data source files
                </TextLink>
              </h3>
              <p id=" upload-data-source-desc" className=" govuk-body">
                Upload new or updated data source files
              </p>
            </div>
            <div className=" govuk-grid-column-one-third">
              <h3 id=" map-data-source-files-title" className=" govuk-heading-m">
                <TextLink to="/Datasets/MapDataSourceFiles" describedBy=" map-data-sources-desc">
                  Map data source files to datasets for a specification
                </TextLink>
              </h3>
              <p id=" map-data-sources-desc" className=" govuk-body">
                Select the data source file a dataset uses
              </p>
            </div>
            <div className=" govuk-grid-column-one-third">
              <h3 id={" download-data-schemas-title"} className=" govuk-heading-m">
                <TextLink to="/Datasets/DownloadDataSchema" describedBy=" download-schemas-desc">
                  Download data schemas
                </TextLink>
              </h3>
              <p id=" download-schemas-desc" className=" govuk-body">
                Download the data schema for data source
              </p>
            </div>
          </div>
          <div className=" govuk-grid-row">
            <div className=" govuk-grid-column-one-third">
              <h3 className=" govuk-heading-m">
                <TextLink to="/Datasets/Export/SelectSpecificationForExport" describedBy=" sql-export-desc">
                  Refresh SQL
                </TextLink>
              </h3>
              <p id=" sql-export-desc" className=" govuk-body">
                Refresh SQL funding
              </p>
            </div>
            <div className=" govuk-grid-column-one-third">
              <h3 className=" govuk-heading-m">
                <TextLink to="/Configuration/SelectConfiguration" describedBy=" download-config-desc">
                  Funding and profiling configuration
                </TextLink>
              </h3>
              <p id=" download-config-desc" className=" govuk-body">
                Download the funding and profiling configuration files.
              </p>
            </div>
          </div>
        </section>
      </nav>
    </Main>
  );
}
