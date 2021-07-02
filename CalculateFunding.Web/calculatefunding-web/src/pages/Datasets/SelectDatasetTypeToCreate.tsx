import React, {useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {Main} from "../../components/Main";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PermissionStatus} from "../../components/PermissionStatus";
import {useErrors} from "../../hooks/useErrors";
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {Permission} from "../../types/Permission";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";

export interface SelectDatasetTypeToCreateRouteProps {
    specificationId: string;
}

export function SelectDatasetTypeToCreate({match}: RouteComponentProps<SelectDatasetTypeToCreateRouteProps>) {
    const specificationId: string = match.params.specificationId;
    const {errors, addError, clearErrorMessages} = useErrors();
    const [referenceReleased, setReferenceReleased] = useState<boolean | undefined>();
    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(specificationId, [Permission.CanEditSpecification]);
    const {specification} =
        useSpecificationSummary(
            specificationId,
            err => addError({
                error: err,
                description: "Error while loading specification"
            }));
    const history = useHistory();

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

    const DatasetTypeOption = (props: {
        token: string,
        label: string,
        hint: string,
        checked: boolean,
        disabled: boolean,
        callback: () => void
    }) => {
        return (
            <div className="govuk-radios__item">
                <input className="govuk-radios__input"
                       id={`${props.token}-data`}
                       name={`${props.token}-data`}
                       type="radio"
                       checked={props.checked}
                       disabled={props.disabled}
                       value={props.token}
                       onChange={props.callback}
                       aria-describedby={`${props.token}-data-hint`}/>
                <label id={`${props.token}-data-label`}
                       className="govuk-label govuk-radios__label"
                       htmlFor={`${props.token}-data`}>
                    {props.label}
                </label>
                <div id={`${props.token}-data-hint`} className="govuk-hint govuk-radios__hint">
                    {props.hint}
                </div>
            </div>
        );
    }

    const Actions = () => {
        return (
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <button id="patternLink"
                            type="submit"
                            disabled={hasMissingPermissions}
                            className="govuk-button govuk-!-margin-right-1"
                            data-module="govuk-button">
                        Continue
                    </button>

                    <button
                        className="govuk-button govuk-button--secondary"
                        data-module="govuk-button"
                        onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const onSelectReferencedData = () => {
        setReferenceReleased(true);
    };

    const onSelectUploadedData = () => {
        setReferenceReleased(false);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrorMessages();

        if (referenceReleased === undefined) {
            addError({
                error: 'Select released data or uploaded data'
            })
            return;
        }

        referenceReleased ?
            history.push(`/Datasets/CreateDatasetFromReleased/${specificationId}`) :
            history.push(`/Datasets/CreateDataset/${specificationId}`);
    };

    return (
        <Main location={Section.Datasets}>
            <MultipleErrorSummary errors={errors}/>
            <Breadcrumbs>
                <Breadcrumb name="Calculate funding" url={"/"}/>
                <Breadcrumb name="Specifications" url="/SpecificationsList"/>
                <Breadcrumb name={specification ? specification.name : "Specification"}
                            url={specification ? `/ViewSpecification/${specification.id}` : "#"}/>
                <Breadcrumb name="Dataset type"/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}
                              hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}/>
            <section>
                <Form token="select-dataset-type"
                      heading="Which data set type?"
                      onSubmit={onSubmit}
                >
                    <div className="govuk-grid-row govuk-!-margin-bottom-4">
                        <div className="govuk-grid-column-two-thirds">
                            <div className="govuk-radios">
                                <DatasetTypeOption
                                    token="released"
                                    label="Released data"
                                    disabled={hasMissingPermissions}
                                    checked={referenceReleased === true}
                                    callback={onSelectReferencedData}
                                    hint="Data set referencing released allocations data from another CFS specification"
                                />
                                <DatasetTypeOption
                                    token="uploaded"
                                    label="Uploaded data"
                                    disabled={hasMissingPermissions}
                                    checked={referenceReleased === false}
                                    callback={onSelectUploadedData}
                                    hint="Data set referencing data uploaded into CFS"
                                />
                            </div>
                        </div>
                    </div>
                    <Actions/>
                </Form>
            </section>
        </Main>
    );
}
