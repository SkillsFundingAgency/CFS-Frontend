import { toNumber } from "lodash";
import React, { useState } from "react";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CancelLink } from "../../components/CancelLink";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { FundingStreamAndPeriodSelection } from "../../components/TemplateBuilder/FundingStreamAndPeriodSelection";
import { Title } from "../../components/Title";
import { useTemplatePermissions } from "../../hooks/TemplateBuilder/useTemplatePermissions";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import {
  cloneNewTemplateFromExisting,
  getAllFundingStreamsWithAvailablePeriods,
  getTemplateVersion,
} from "../../services/templateBuilderDatasourceService";
import { ErrorMessage } from "../../types/ErrorMessage";
import { Section } from "../../types/Sections";
import { TemplatePermissions, TemplateResponse } from "../../types/TemplateBuilderDefinitions";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";

export interface TemplateVersionRoute {
  templateId: string;
  version: string;
}

export const CloneTemplate = () => {
  const { templateId, version } = useParams<TemplateVersionRoute>();
  const [fundingStream, setFundingStream] = useState<FundingStream>();
  const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
  const [templateToClone, setTemplateToClone] = useState<TemplateResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string>();
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false);
  const { canCreateTemplate, missingPermissions, fundingStreamPermissions } = useTemplatePermissions([
    TemplatePermissions.Create,
  ]);
  const history = useHistory();

  const fetchAvailableFundingConfigurations = async () => {
    const result = await getAllFundingStreamsWithAvailablePeriods();
    return result.data;
  };

  useEffectOnce(() => {
    setIsLoading(true);

    const fetchTemplateToClone = async (templateId: string, version: number) => {
      try {
        setIsLoading(true);
        const templateResult = await getTemplateVersion(templateId, version);
        if (templateResult.status !== 200) {
          addErrorMessage("Could not fetch template from which to clone. " + templateResult.statusText);
        }
        const templateResponse = templateResult.data as TemplateResponse;
        setTemplateToClone(templateResponse);
        setFundingStream({ id: templateResponse.fundingStreamId, name: templateResponse.fundingStreamName });
        await loadAvailable(templateResponse.fundingStreamId);
      } catch (err: any) {
        addErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadAvailable = async (fundingStreamId: string) => {
      if (!fundingStreamId) {
        return;
      }
      const fundingStreamWithPeriodsResponse = await fetchAvailableFundingConfigurations();
      setIsLoading(false);

      // extract funding stream matching the template we're cloning from
      const streamWithPeriods = fundingStreamWithPeriodsResponse.find(
        (x) => x.fundingStream.id === fundingStreamId
      );
      if (!streamWithPeriods) {
        addErrorMessage("No available funding streams with periods", "fundingStreamId");
        return;
      }
      // user has sufficient permissions?
      if (
        fundingStreamPermissions &&
        !fundingStreamPermissions.some(
          (f) => f.permission === TemplatePermissions.Create && f.fundingStreamId === fundingStreamId
        )
      ) {
        addErrorMessage(
          "Insufficient permissions to clone a template with this funding stream",
          "fundingStreamId"
        );
        return;
      }
      populateFundingPeriods(streamWithPeriods.fundingPeriods);
    };

    try {
      fetchTemplateToClone(templateId, toNumber(version));
    } catch (err: any) {
      addErrorMessage(`Template options could not be loaded: ${err.message}.`);
      setIsLoading(false);
    }
  });

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const description = e.target.value;
    setDescription(description);
  };

  function addErrorMessage(errorMessage: string, fieldName?: string) {
    const errorCount: number = errors.length;
    const error: ErrorMessage = { id: errorCount + 1, fieldName: fieldName, message: errorMessage };
    setErrors((errors) => [...errors, error]);
  }

  function clearErrorMessages() {
    setErrors([]);
  }

  function populateFundingPeriods(fundingPeriods: FundingPeriod[]) {
    setFundingPeriods([]);
    if (!fundingPeriods || fundingPeriods.length === 0) {
      addErrorMessage(
        "No funding periods available for this funding stream. You will not be able to select a funding period if a template for this funding stream and period already exists. Please select a different funding stream.",
        "fundingPeriodId"
      );
      setEnableSaveButton(false);
      return;
    }
    setFundingPeriods(fundingPeriods);
    setSelectedFundingPeriodId(fundingPeriods[0].id);
    setEnableSaveButton(true);
  }

  const handleFundingPeriodChange = (fundingPeriodId: string) => {
    clearErrorMessages();
    setSelectedFundingPeriodId(fundingPeriodId);
  };

  const handleSaveClick = async () => {
    if (!templateToClone || !enableSaveButton || !fundingStream) {
      return;
    }
    setEnableSaveButton(false);
    try {
      if (selectedFundingPeriodId === undefined) {
        addErrorMessage("Funding period is not defined", "fundingPeriodId");
        return;
      }

      setSaveMessage("Saving template...");

      const result = await cloneNewTemplateFromExisting(
        templateToClone.templateId,
        templateToClone.version,
        templateToClone.fundingStreamId,
        selectedFundingPeriodId,
        description
      );
      if (result.status === 201) {
        history.push(`/Templates/${result.data}/Edit`);
      } else {
        addErrorMessage(
          "Template creation failed: " + result.status + " " + result.statusText + " " + result.data
        );
      }
    } catch (err: any) {
      addErrorMessage(
        `Template could not be saved: ${err.message}. Try refreshing the page and saving again.`
      );
      setSaveMessage(`Template could not be saved: ${err.message}.`);
      setEnableSaveButton(true);
    }
  };

  return (
    <Main location={Section.Templates}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate Funding"} url={"/"} />
        <Breadcrumb name={"Templates"} url={"/Templates/List"} />
        <Breadcrumb
          name={isLoading ? "Loading..." : templateToClone ? templateToClone.name : "Template"}
          url={`/Templates/${templateId}/Edit`}
        />
        <Breadcrumb
          name={
            isLoading
              ? "Loading..."
              : templateToClone
              ? `Version ${templateToClone.majorVersion}.${templateToClone.minorVersion}`
              : ""
          }
          url={
            templateToClone && `/Templates/${templateToClone.templateId}/Versions/${templateToClone.version}`
          }
        />
      </Breadcrumbs>
      <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoading} />
      <MultipleErrorSummary errors={canCreateTemplate ? errors : []} />
      <LoadingStatus
        title={"Loading options..."}
        description={"Please wait whilst the options are loading"}
        hidden={!isLoading}
      />
      <Title
        title="Clone a template"
        titleCaption={
          templateToClone &&
          `Clone a template of ${templateToClone.name} version ${templateToClone.majorVersion}.${templateToClone.minorVersion}`
        }
      />

      {canCreateTemplate && (
        <form id="cloneTemplate">
          {fundingStream && !isLoading && (
            <FundingStreamAndPeriodSelection
              hideFundingStreamSelection={true}
              selectedFundingStreamId={fundingStream.id}
              selectedFundingPeriodId={selectedFundingPeriodId}
              fundingStreams={[fundingStream]}
              fundingPeriods={fundingPeriods}
              errors={errors}
              onFundingPeriodChange={handleFundingPeriodChange}
            />
          )}
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <label className="govuk-label" htmlFor="description">
                Template description
              </label>
              <textarea
                className="govuk-textarea"
                id="description"
                rows={8}
                aria-describedby="description-hint"
                maxLength={1000}
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full govuk-body-m">
              {selectedFundingPeriodId && (
                <button
                  className="govuk-button govuk-!-padding-right-4"
                  data-testid="save"
                  onClick={handleSaveClick}
                  disabled={!enableSaveButton}
                >
                  Clone Template
                </button>
              )}
              {saveMessage.length > 0 ? <span className="govuk-error-message">{saveMessage}</span> : null}
              <CancelLink to={`/Templates/${templateId}/Edit?version=${version}`} />
            </div>
          </div>
        </form>
      )}
    </Main>
  );
};
