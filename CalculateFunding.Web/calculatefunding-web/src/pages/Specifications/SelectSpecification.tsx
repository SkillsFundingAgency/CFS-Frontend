import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { getFundingStreamsService } from "../../services/policyService";
import {
  getFundingPeriodsByFundingStreamIdService,
  getSpecificationsByFundingPeriodAndStreamIdWithResultsService,
} from "../../services/specificationService";
import { Section } from "../../types/Sections";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";

export function SelectSpecification() {
  const [selectedFundingStreamId, setSelectedFundingStreamId] = useState("");
  const [selectedSpecificationId, setSpecificationId] = useState("");

  const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
  const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationSummary[]>([]);

  const [loadingState, setLoadingState] = useState({
    specification: {
      loading: false,
      loaded: false,
      data: false,
    },
  });

  document.title = "Select specification - Calculate funding";

  useEffectOnce(() => {
    getFundingStreamsService(false).then((response) => {
      setFundingStreams(response.data as FundingStream[]);
    });
  });

  function updateFundingPeriods(event: React.ChangeEvent<HTMLSelectElement>) {
    setFundingPeriods([]);
    const filter = event.target.value;
    setSelectedFundingStreamId(filter);
    setLoadingState({
      specification: {
        data: false,
        loaded: false,
        loading: false,
      },
    });
    setSpecificationId("");

    getFundingPeriodsByFundingStreamIdService(filter).then((response) => {
      setFundingPeriods(response.data as FundingPeriod[]);
    });
  }

  function updateSpecifications(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedFundingPeriodId = event.target.value;
    setLoadingState({
      specification: {
        data: false,
        loaded: false,
        loading: true,
      },
    });
    setSpecificationId("");
    getSpecificationsByFundingPeriodAndStreamIdWithResultsService(
      selectedFundingStreamId,
      selectedFundingPeriodId
    ).then((response) => {
      setSpecifications(response.data as SpecificationSummary[]);
      setLoadingState({
        specification: {
          data: response.data.length > 0,
          loaded: true,
          loading: false,
        },
      });
    });
  }

  function setSpecification(event: React.ChangeEvent<HTMLSelectElement>) {
    setSpecificationId(event.target.value);
  }

  return (
    <div>
      <Header location={Section.Results} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View results"} url={"/results"} />
          <Breadcrumb name={"Select specification"} />
        </Breadcrumbs>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-l">Select specification</h2>
            <span className="govuk-caption-m">You can select the specification and funding period.</span>
          </div>
        </div>
        <div className="govuk-main-wrapper govuk-main-wrapper--l">
          <fieldset className="govuk-fieldset">
            <div className="govuk-form-group">
              <label htmlFor="select-funding-stream" className="govuk-label">
                Select funding stream:
              </label>
              <select
                id="select-funding-stream"
                className="govuk-select"
                disabled={fundingStreams.length === 0}
                onChange={(e) => {
                  updateFundingPeriods(e);
                }}
              >
                <option>Please select a funding stream</option>
                {fundingStreams.map((fs) => (
                  <option key={fs.id} value={fs.id}>
                    {fs.name}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <fieldset className="govuk-fieldset">
            <div className="govuk-form-group">
              <label htmlFor="select-provider" className="govuk-label">
                Select funding period:
              </label>
              <select
                id="select-provider"
                className="govuk-select"
                placeholder="Please select"
                disabled={fundingPeriods.length === 0}
                onChange={(e) => {
                  updateSpecifications(e);
                }}
              >
                <option>Please select a funding period</option>
                {fundingPeriods.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.name}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <LoadingFieldStatus title="Loading specifications" hidden={!loadingState.specification.loading} />
          <div
            className="govuk-form-group"
            hidden={
              !(loadingState.specification.loaded && !loadingState.specification.data) ||
              loadingState.specification.loading
            }
          >
            <label className="govuk-label">Specification</label>
            <div className="govuk-error-summary">
              <span className="govuk-body-m">There are no specifications available for the selection</span>
            </div>
          </div>
          <fieldset
            className="govuk-fieldset"
            hidden={
              !(loadingState.specification.loaded && loadingState.specification.data) ||
              loadingState.specification.loading
            }
          >
            <div className="govuk-form-group">
              <label htmlFor="select-provider" className="govuk-label">
                Select specification:
              </label>
              <select
                id="select-provider"
                className="govuk-select"
                placeholder="Please select"
                disabled={specifications.length === 0}
                onChange={(e) => {
                  setSpecification(e);
                }}
              >
                <option key={""} value={""}>
                  Please select a specification
                </option>
                {specifications.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <div
            className="govuk-grid-row"
            hidden={
              !(loadingState.specification.loaded && loadingState.specification.data) ||
              loadingState.specification.loading
            }
          >
            <div className="govuk-grid-column-full">
              <Link
                to={
                  selectedSpecificationId === ""
                    ? "#"
                    : `/ViewSpecificationResults/${selectedSpecificationId}`
                }
                role="button"
                className={`govuk-button govuk-button ${
                  selectedSpecificationId === "" ? "govuk-button--disabled" : "govuk-button govuk-button"
                }`}
                data-module="govuk-button"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
