import * as React from "react";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { Main } from "../../components/Main";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { Section } from "../../types/Sections";

export default function FundingManagementHome(): JSX.Element {
  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
      </Breadcrumbs>

      <Title
        title="Funding management"
        titleCaption="Approve allocations and release allocations for statement and funding."
      />

      <section className="homepage-section-container govuk-!-margin-top-9 govuk-!-margin-bottom-9">
        <nav className="govuk-grid-row" aria-label={"Funding management"}>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-heading-m">
              <TextLink to="/FundingManagement/Approve/Selection">Funding approvals</TextLink>
            </div>
            <p className="govuk-body">Approve allocations for funding.</p>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-heading-m">
              <TextLink to="/FundingManagement/Release/Select">Release management</TextLink>
            </div>
            <p className="govuk-body">Release allocations for statement of funding.</p>
          </div>
        </nav>
      </section>
    </Main>
  );
}
