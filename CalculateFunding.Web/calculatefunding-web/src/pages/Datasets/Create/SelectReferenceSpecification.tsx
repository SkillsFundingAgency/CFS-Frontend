import React, {useMemo, useState} from "react";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {RouteComponentProps, useHistory} from "react-router";
import {useErrors} from "../../../hooks/useErrors";
import {Section} from "../../../types/Sections";
import {Permission} from "../../../types/Permission";
import {EligibleSpecificationReferenceModel} from "../../../types/Datasets/EligibleSpecificationReferenceModel";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {MultipleErrorSummary} from "../../../components/MultipleErrorSummary";
import {Breadcrumb, Breadcrumbs} from "../../../components/Breadcrumbs";
import {PermissionStatus} from "../../../components/PermissionStatus";
import {Main} from "../../../components/Main";
import {useSpecificationPermissions} from "../../../hooks/Permissions/useSpecificationPermissions";
import {useSpecificationSummary} from "../../../hooks/useSpecificationSummary";
import * as datasetService from "../../../services/datasetService";
import {uniq} from "ramda";
import {LoadingFieldStatus} from "../../../components/LoadingFieldStatus";
import {BackLink} from "../../../components/BackLink";
import {useAppContext} from "../../../context/AppContextState";
import {CreateDatasetRouteProps} from "./SelectDatasetTypeToCreate";
import Form from "../../../components/Form";

export function SelectReferenceSpecification({match}: RouteComponentProps<CreateDatasetRouteProps>) {
    const forSpecId: string = match.params.forSpecId;
    const {errors, addError, clearErrorMessages} = useErrors();
    const {state, dispatch} = useAppContext();
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream>();
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<FundingPeriod>();
    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(forSpecId, [Permission.CanEditSpecification]);
    const {specification: forSpec} =
        useSpecificationSummary(
            forSpecId,
            err => addError({
                error: err,
                description: "Error while loading specification"
            }));
    const {data: validOptions} =
        useQuery<EligibleSpecificationReferenceModel[], AxiosError>(`eligible-spec-ref-${forSpecId}`,
            async () => (await datasetService.getEligibleSpecificationDetailsForCreatingNewDataset(forSpecId)).data,
            {
                enabled: !!forSpecId,
                onError: err => addError({
                    error: err,
                    description: "Could not load valid options",
                    suggestion: "Please try again later"
                })
            });
    const history = useHistory();

    const fundingStreams: undefined | FundingStream[] = useMemo(() =>
        validOptions &&
        uniq(validOptions.map(o => {
            return {
                id: o.fundingStreamId,
                name: o.fundingStreamName
            } as FundingStream
        })), [validOptions]);

    const fundingPeriods: undefined | FundingPeriod[] = useMemo(() =>
        validOptions &&
        selectedFundingStream &&
        uniq(validOptions
            .filter(o => o.fundingStreamId === selectedFundingStream?.id)
            .map(o => {
                return {
                    id: o.fundingPeriodId,
                    name: o.fundingPeriodName
                } as FundingPeriod
            })), [validOptions, selectedFundingStream]);

    const selectedSpec: EligibleSpecificationReferenceModel | undefined = validOptions &&
        selectedFundingStream &&
        selectedFundingPeriod &&
        validOptions.find(o =>
            o.fundingStreamId === selectedFundingStream.id &&
            o.fundingPeriodId === selectedFundingPeriod.id);

    const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedSpec) {
            if (!selectedFundingStream) {
                addError({
                    error: 'Select a funding stream',
                    fieldName: 'funding-stream'
                });
            }
            if (fundingPeriods?.length && !selectedFundingPeriod) {
                addError({
                    error: 'Select a funding period',
                    fieldName: 'funding-period'
                });
            }
        }
        if (!!selectedSpec) {
            dispatch({
                type: 'setCreateDatasetWorkflowState',
                payload: {
                    forSpecId: forSpecId,
                    referencingSpec: selectedSpec
                }
            });
            history.push(`/Datasets/Create/SpecifyDatasetDetails/${forSpecId}`);
        }
    };

    const onCancel = () => {
        history.goBack();
    };

    const FundingStreamSelection = () => {

        if (!fundingStreams || fundingStreams.length === 0) return null;

        const onFundingStreamSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
            clearErrorMessages();
            if (fundingStreams) {
                if (e.target.value.length === 0) {
                    setSelectedFundingStream(undefined);
                    setSelectedFundingPeriod(undefined);
                } else {
                    const newFundingStream = fundingStreams.find(stream => stream.id === e.target.value);
                    if (!selectedFundingStream || newFundingStream !== selectedFundingStream) {
                        setSelectedFundingStream(newFundingStream);
                        setSelectedFundingPeriod(undefined);
                    }
                }
            }
        }

        return (
            <div className={`govuk-form-group ${errors.filter(e =>
                e.fieldName === "funding-stream").length > 0 ? 'govuk-form-group--error' : ''}`}>
                <label id="funding-stream-label"
                       className="govuk-label"
                       htmlFor="funding-stream">
                    Funding stream
                </label>
                {errors.filter(e => e.fieldName === "funding-stream").length > 0 &&
                errors.map(error => error.fieldName === "funding-stream" &&
                    <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                        <span className="govuk-visually-hidden">Error:</span> {error.message}
                    </span>
                )}
                <select className="govuk-select"
                        id="funding-stream"
                        name="funding-stream"
                        aria-describedby="funding-stream-label"
                        aria-label="Select funding stream"
                        defaultValue={selectedFundingStream?.id}
                        onChange={onFundingStreamSelection}>
                    <option></option>
                    {fundingStreams.map(stream =>
                        <option key={`funding-stream-${stream.id}`} value={stream.id}>{stream.name}</option>
                    )}
                </select>
            </div>
        );
    };

    const FundingPeriodSelection = () => {

        if (!fundingPeriods || fundingPeriods.length === 0) return null;

        const onFundingPeriodSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
            clearErrorMessages();

            if (e.target.value.length === 0) {
                setSelectedFundingPeriod(undefined);
            } else {
                if (fundingPeriods) {
                    setSelectedFundingPeriod(fundingPeriods.find(period => period.id === e.target.value));
                }
            }
        }

        return (
            <div className={`govuk-form-group ${errors.filter(e =>
                e.fieldName === "funding-period").length > 0 ? 'govuk-form-group--error' : ''}`}>
                <label id="funding-period-label"
                       className="govuk-label"
                       htmlFor="funding-period">
                    Funding period
                </label>
                {errors.filter(e => e.fieldName === "funding-period").length > 0 &&
                errors.map(error => error.fieldName === "funding-period" &&
                    <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                        <span className="govuk-visually-hidden">Error:</span> {error.message}
                    </span>
                )}
                <select className="govuk-select"
                        id="funding-period"
                        name="funding-period"
                        aria-describedby="funding-period-label"
                        aria-label="Select funding period"
                        defaultValue={selectedFundingPeriod?.id}
                        onChange={onFundingPeriodSelection}>
                    <option></option>
                    {fundingPeriods.map(p =>
                        <option key={`funding-period-${p.id}`} value={p.id}>{p.name}</option>
                    )}
                </select>
            </div>
        );
    };

    const Actions = () => {

        if (!validOptions || validOptions.length === 0) return null;

        return (
            <div className="govuk-grid-row">
                {selectedSpec ?
                    <>
                        <div className="govuk-grid-column-two-thirds">
                            <dl id="showSpecification"
                                className="govuk-summary-list govuk-summary-list__row--no-border govuk-!-margin-top-5">
                                <div className="govuk-summary-list__row">
                                    <dt id="term-specification-name"
                                        className="govuk-summary-list__key">
                                        Specification
                                    </dt>
                                    <dd aria-labelledby="term-specification-name"
                                        className="govuk-summary-list__value">
                                        {selectedSpec.specificationName}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div className="govuk-grid-column-two-thirds">
                            <button className="govuk-button"
                                    data-module="govuk-button"
                                    onClick={onSubmit}>
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
    };

    const NoOptions = () =>
        <div className="govuk-grid-row">
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
                <Breadcrumb name={forSpec ? forSpec.name : "Specification"}
                            url={`/ViewSpecification/${forSpecId}`}/>
                <Breadcrumb name="Create data set"/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}
                              hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}/>
            <section>
                <Form token="create-dataset"
                      heading="Create data set"
                      onSubmit={onSubmit}
                >
                    <div>
                        {validOptions ?
                            <>
                                <FundingStreamSelection/>
                                <FundingPeriodSelection/>
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