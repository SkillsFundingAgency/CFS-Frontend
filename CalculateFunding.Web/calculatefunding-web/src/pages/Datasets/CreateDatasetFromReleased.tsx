import React, {useMemo, useState} from "react";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {RouteComponentProps, useHistory} from "react-router";
import {useErrors} from "../../hooks/useErrors";
import {Section} from "../../types/Sections";
import {Permission} from "../../types/Permission";
import {EligibleSpecificationReferenceModel} from "../../types/Datasets/EligibleSpecificationReferenceModel";
import {FundingPeriod, FundingStream} from "../../types/viewFundingTypes";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Main} from "../../components/Main";
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import * as datasetService from "../../services/datasetService";
import {uniq} from "ramda";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {BackLink} from "../../components/BackLink";

export interface CreateDatasetFromExistingRouteProps {
    specificationId: string;
}

export function CreateDatasetFromReleased({match}: RouteComponentProps<CreateDatasetFromExistingRouteProps>) {
    const specificationId: string = match.params.specificationId;
    const {errors, addError, clearErrorMessages} = useErrors();
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream>();
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<FundingPeriod>();
    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(specificationId, [Permission.CanEditSpecification]);
    const {specification} =
        useSpecificationSummary(
            specificationId,
            err => addError({
                error: err,
                description: "Error while loading specification"
            }));
    const {data: validOptions} =
        useQuery<EligibleSpecificationReferenceModel[], AxiosError>(`eligible-spec-ref-${specificationId}`,
            async () => (await datasetService.getEligibleSpecificationDetailsForCreatingNewDataset(specificationId)).data,
            {
                enabled: !!specificationId,
                onError: err => addError({
                    error: err,
                    description: "Could not load valid options",
                    suggestion: "Please try again later"
                })
            });
    const history = useHistory();
    
    const fundingStreams = useMemo(() =>
        validOptions &&
        uniq(validOptions.map(o => {
            return {
                id: o.fundingStreamId,
                name: o.fundingStreamName
            } as FundingStream
        })), [validOptions]);
    
    const fundingPeriods = useMemo(() =>
        validOptions &&
        selectedFundingStream &&
        uniq(validOptions
            .filter(o => o.fundingStreamId === selectedFundingStream?.id)
            .map(o => {
                return {
                    id: o.fundingPeriodId,
                    name: o.fundingPeriodName
                } as FundingStream
            })), [validOptions, selectedFundingStream]);

    const onContinue = () => {
        alert('Coming into scope soon...');
    }

    const onCancel = () => {
        history.goBack();
    }

    const Form = (props: { token: string, heading: string, onSubmit: any, children: any }) => {
        return (
            <form id={`form-${props.token}`}
                  className="form"
                  onSubmit={props.onSubmit}
                  noValidate={true}>
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset"
                              aria-describedby={`${props.token}-hint`}>
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading">
                                {props.heading}
                            </h1>
                        </legend>
                    </fieldset>
                    {props.children}
                </div>
            </form>
        );
    }

    const FundingStreamSelection = () => {

        if (!fundingStreams || fundingStreams.length === 0) return null;

        const onFundingStreamSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
            clearErrorMessages();
            if (fundingStreams) {
                setSelectedFundingStream(fundingStreams.find(stream => stream.id === e.target.value));
                setSelectedFundingPeriod(undefined);
            }
        }

        return (
            <div className="govuk-form-group">
                <label id="funding-stream-label"
                       className="govuk-label"
                       htmlFor="funding-stream">
                    Funding stream
                </label>

                <select className="govuk-select"
                        id="funding-stream"
                        name="funding-stream"
                        aria-describedby="funding-stream-label"
                        aria-label="Select funding stream"
                        onChange={onFundingStreamSelection}>
                    <option></option>
                    {fundingStreams.map(stream =>
                        <option key={`funding-stream-${stream.id}`} value={stream.id}>{stream.name}</option>
                    )}
                </select>
            </div>
        );
    }

    const FundingPeriodSelection = () => {

        if (!fundingPeriods || fundingPeriods.length === 0) return null;

        const onFundingPeriodSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
            clearErrorMessages();
            if (fundingPeriods) {
                setSelectedFundingPeriod(fundingPeriods.find(period => period.id === e.target.value));
            }
        }

        return (
            <div className="govuk-form-group">
                <label id="funding-period-label"
                       className="govuk-label"
                       htmlFor="funding-period">
                    Funding period
                </label>

                <select className="govuk-select"
                        id="funding-period"
                        name="funding-period"
                        aria-describedby="funding-period-label"
                        aria-label="Select funding period"
                        onChange={onFundingPeriodSelection}>
                    <option></option>
                    {fundingPeriods.map(p =>
                        <option key={`funding-period-${p.id}`} value={p.id}>{p.name}</option>
                    )}
                </select>
            </div>
        );
    }

    const Actions = () => {
        
        if (!validOptions || validOptions.length === 0) return null;
        
        const selected = validOptions &&
            selectedFundingStream &&
            selectedFundingPeriod &&
            validOptions.find(o =>
                o.fundingStreamId === selectedFundingStream.id &&
                o.fundingPeriodId === selectedFundingPeriod.id);
        return (
            <div className="govuk-grid-row">
                {selected ?
                    <>
                        <dl id="showSpecification"
                            className="govuk-summary-list govuk-summary-list__row--no-border govuk-!-margin-top-5">
                            <div className="govuk-summary-list__row">
                                <dt id="term-specification-name"
                                    className="govuk-summary-list__key">
                                    Specification
                                </dt>
                                <dd aria-labelledby="term-specification-name"
                                    className="govuk-summary-list__value">
                                    {selected.specificationName}
                                </dd>
                            </div>
                        </dl>
                        <div className="govuk-grid-column-two-thirds">
                            <button className="govuk-button"
                                    data-module="govuk-button"
                                    onClick={onContinue}>
                                Continue
                            </button>
                        </div>
                    </>
                    :
                    <div className="govuk-grid-column-two-thirds">
                        <button
                            className="govuk-button govuk-button--secondary"
                            data-module="govuk-button"
                            onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                }
            </div>
        );
    }
    const NoOptions = () => <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
            <div className="govuk-inset-text">
                There are no funding streams to select. There is
                either no data sharing enabled with the funding stream of the current
                specification or there are no enabled funding streams with released data.
            </div>
            <BackLink/>
        </div>
    </div>

    return (
        <Main location={Section.Datasets}>
            <MultipleErrorSummary errors={errors}/>
            <Breadcrumbs>
                <Breadcrumb name="Calculate funding" url={"/"}/>
                <Breadcrumb name="Specifications" url="/SpecificationsList"/>
                <Breadcrumb name={specification ? specification.name : "Specification"}
                            url={specification ? `/ViewSpecification/${specification.id}` : "#"}/>
                <Breadcrumb name="Create data set"/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}
                              hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}/>
            <section>
                <Form token="create-dataset"
                      heading="Create data set"
                      onSubmit={onContinue}
                >
                    <div>
                        {validOptions ?
                            <>
                                <FundingStreamSelection />
                                <FundingPeriodSelection />
                                {validOptions.length === 0 &&
                                <NoOptions/>
                                }
                            </>
                            :
                            <LoadingFieldStatus title="Loading options"/>
                        }
                        <Actions/>
                    </div>
                </Form>
            </section>
        </Main>
    );
}