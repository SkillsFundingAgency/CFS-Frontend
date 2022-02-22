import { AxiosError } from "axios";
import React from "react";

import { useErrorContext } from "../../context/ErrorContext";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { DateFormatter } from "../DateFormatter";
import { LoadingFieldStatus } from "../LoadingFieldStatus";

export const ProviderDataTab = ({
  providerId,
  providerVersionId,
}: {
  providerId: string;
  providerVersionId: string | undefined;
}) => {
  const { addErrorToContext: addError } = useErrorContext();

  const { providerVersion: providerDetails, isLoadingProviderVersion } = useProviderVersion(
    providerId,
    providerVersionId,
    (err: AxiosError) => addError({ error: err.message, description: "Error while loading provider" })
  );

  if (isLoadingProviderVersion || !providerDetails) {
    return <LoadingFieldStatus title="Loading..." />;
  }
  return (
    <section className="govuk-tabs__panel" id="provider-data">
      <h2 className="govuk-heading-l">Provider data</h2>
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          You are using {providerDetails.name} from the master version.
        </strong>
      </div>
      <h4 className="govuk-heading-m">Establishment details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.name}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Number</dt>
          <dd className="govuk-summary-list__value">{providerDetails.establishmentNumber}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">UKPRN</dt>
          <dd className="govuk-summary-list__value">{providerDetails.ukprn}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">UPIN</dt>
          <dd className="govuk-summary-list__value">{providerDetails.upin}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">URN</dt>
          <dd className="govuk-summary-list__value">{providerDetails.urn}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Previous establishment number</dt>
          <dd className="govuk-summary-list__value">{providerDetails.previousEstablishmentNumber}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Predecessor UKPRN</dt>
          <dd className="govuk-summary-list__value" data-testid={"predecessors"}>
            {providerDetails.predecessors?.map((predecessor, index) => {
              return index > 0 ? `, ${predecessor}` : predecessor;
            })}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Successor UKPRN</dt>
          <dd className="govuk-summary-list__value" data-testid={"successors"}>
            {providerDetails.successors?.map((successors, index) => {
              return index > 0 ? `, ${successors}` : successors;
            })}
          </dd>
        </div>
      </dl>
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h4 className="govuk-heading-m">Provider details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Type</dt>
          <dd className="govuk-summary-list__value">{providerDetails.providerType}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Type code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.providerTypeCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Sub type</dt>
          <dd className="govuk-summary-list__value">{providerDetails.providerSubType}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Sub type code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.providerSubTypeCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Phase of education</dt>
          <dd className="govuk-summary-list__value">{providerDetails.phaseOfEducation}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Provider profile type</dt>
          <dd className="govuk-summary-list__value">{providerDetails.providerType}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Further education type code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.furtherEducationTypeCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Further education type name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.furtherEducationTypeName}</dd>
        </div>
      </dl>
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h4 className="govuk-heading-m">Location details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Local authority</dt>
          <dd className="govuk-summary-list__value">{providerDetails.authority}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Local authority code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.laCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Previous local authority name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.previousLaName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Previous local authority code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.previousLaCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Town</dt>
          <dd className="govuk-summary-list__value">{providerDetails.town}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Postcode</dt>
          <dd className="govuk-summary-list__value">{providerDetails.postcode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Regional schools commissioner region name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.rscRegionName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Regional schools commissioner region code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.rscRegionCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Government office region name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.governmentOfficeRegionName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Government office region code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.governmentOfficeRegionCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">London region code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.londonRegionCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">London region name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.londonRegionName}</dd>
        </div>

        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Local government group type</dt>
          <dd className="govuk-summary-list__value">{providerDetails.localGovernmentGroupTypeName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Local government group type code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.localGovernmentGroupTypeCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Country</dt>
          <dd className="govuk-summary-list__value">{providerDetails.countryName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Country code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.localGovernmentGroupTypeCode}</dd>
        </div>
      </dl>
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h4 className="govuk-heading-m">Status details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Status</dt>
          <dd className="govuk-summary-list__value">{providerDetails.status}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Date opened</dt>
          <dd className="govuk-summary-list__value">
            {providerDetails !== undefined ? <DateFormatter date={providerDetails.dateOpened} /> : "Unknown"}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Date closed</dt>
          <dd className="govuk-summary-list__value">
            {providerDetails !== undefined ? <DateFormatter date={providerDetails.dateClosed} /> : "Unknown"}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Reason establishment opened</dt>
          <dd className="govuk-summary-list__value">{providerDetails.reasonEstablishmentOpenedCode}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Reason establishment closed</dt>
          <dd className="govuk-summary-list__value">{providerDetails.reasonEstablishmentClosedCode}</dd>
        </div>
      </dl>
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h4 className="govuk-heading-m">Trust details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Status</dt>
          <dd className="govuk-summary-list__value">{providerDetails.trustStatus}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.trustName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Code</dt>
          <dd className="govuk-summary-list__value">{providerDetails.trustCode}</dd>
        </div>
      </dl>
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h4 className="govuk-heading-m">Payment organisation details</h4>
      <dl className="govuk-summary-list govuk-!-margin-bottom-6 govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Name</dt>
          <dd className="govuk-summary-list__value">{providerDetails.paymentOrganisationName}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Identifier</dt>
          <dd className="govuk-summary-list__value">{providerDetails.paymentOrganisationIdentifier}</dd>
        </div>
      </dl>
    </section>
  );
};
