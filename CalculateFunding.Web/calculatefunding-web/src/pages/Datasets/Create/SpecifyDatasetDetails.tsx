import React, {useEffect, useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {useErrors} from "../../../hooks/useErrors";
import {Section} from "../../../types/Sections";
import {Permission} from "../../../types/Permission";
import {MultipleErrorSummary} from "../../../components/MultipleErrorSummary";
import {Breadcrumb, Breadcrumbs} from "../../../components/Breadcrumbs";
import {PermissionStatus} from "../../../components/PermissionStatus";
import {Main} from "../../../components/Main";
import {useSpecificationPermissions} from "../../../hooks/Permissions/useSpecificationPermissions";
import {useSpecificationSummary} from "../../../hooks/useSpecificationSummary";
import {CreateDatasetRouteProps} from "./SelectDatasetTypeToCreate";
import Form from "../../../components/Form";
import {ErrorMessage} from "../../../types/ErrorMessage";
import {useAppContext} from "../../../context/useAppContext";

export function SpecifyDatasetDetails({match}: RouteComponentProps<CreateDatasetRouteProps>) {
    const forSpecId: string = match.params.forSpecId;
    const {errors, addError, clearErrorMessages} = useErrors();
    const {state, dispatch} = useAppContext();
    const criteria = state.createDatasetWorkflowState;
    const [datasetName, setDatasetName] = useState<string | undefined>(criteria?.datasetName);
    const [datasetDescription, setDatasetDescription] = useState<string | undefined>(criteria?.datasetDescription);
    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(criteria?.forSpecId as string, [Permission.CanEditSpecification]);
    const {specification: forSpec} =
        useSpecificationSummary(
            criteria?.forSpecId as string,
            err => addError({
                error: err,
                description: "Error while loading specification"
            }));
    const history = useHistory();

    useEffect(() => {
        if (!state || state.createDatasetWorkflowState?.forSpecId != forSpecId) {
            history.push(`/Datasets/Create/SelectDatasetTypeToCreate/${forSpecId}`);
        }
    }, [state, forSpecId])

    const onDatasetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrorMessages(['dataset-name']);
        setDatasetName(e.target.value);
    };

    const onDatasetDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        clearErrorMessages(['dataset-description']);
        setDatasetDescription(e.target.value);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        clearErrorMessages();
        if (!datasetName?.length) {
            addError({error: `Provide a data set name`, fieldName: 'dataset-name'})
        }
        if (!datasetDescription?.length) {
            addError({error: `Provide a data set description`, fieldName: 'dataset-description'})
        }
        if (datasetName?.length && datasetDescription?.length) {
            dispatch({
                type: 'setCreateDatasetWorkflowState',
                payload: {...criteria, datasetName: datasetName, datasetDescription: datasetDescription}
            });
            history.push(`/Datasets/Create/SelectDatasetTemplateItems/${forSpecId}`);
        }
    };

    const onCancel = () => {
        history.goBack();
    };

    return (
        <Main location={Section.Datasets}>
            <MultipleErrorSummary errors={errors}/>
            <Breadcrumbs>
                <Breadcrumb name="Calculate funding" url={"/"}/>
                <Breadcrumb name="Specifications" url="/SpecificationsList"/>
                <Breadcrumb name={forSpec ? forSpec.name : "Specification"}
                            url={`/ViewSpecification/${forSpecId}`}/>
                <Breadcrumb name="Data set type"
                            url={`/Datasets/Create/SelectDatasetTypeToCreate/${forSpecId}`}/>
                <Breadcrumb name="Funding stream and period"
                            url={`/Datasets/Create/SelectReferenceSpecification/${forSpecId}`}/>
                <Breadcrumb name="Create data set"/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}
                              hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}/>
            <section>
                <Form token="create-dataset"
                      heading="Create data set"
                      onSubmit={onSubmit}
                >
                    <DatasetName
                        datasetName={datasetName || ''}
                        onDatasetNameChange={onDatasetNameChange}
                        error={errors.find(e => e.fieldName === "dataset-name")}
                    />
                    <DatasetDescription
                        datasetDescription={datasetDescription || ''}
                        onDatasetDescriptionChange={onDatasetDescriptionChange}
                        error={errors.find(e => e.fieldName === "dataset-name")}
                    />
                    <Actions onContinue={onSubmit}
                             onCancel={onCancel}/>
                </Form>
            </section>
        </Main>
    );
}


const Actions = (props: {
    onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void,
    onCancel: () => void
}) => <div className="govuk-grid-row">
    <div className="govuk-grid-column-two-thirds">
        <button className="govuk-button"
                data-module="govuk-button"
                onClick={props.onContinue}>
            Continue
        </button>
    </div>
    <div className="govuk-grid-column-two-thirds">
        <button
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={props.onCancel}>
            Cancel
        </button>
    </div>
</div>

const DatasetName = (props: {
    datasetName: string,
    onDatasetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error: ErrorMessage | undefined,
}) => {
    return (
        <div className={`govuk-form-group ${props.error ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label"
                   htmlFor="dataset-name">
                Data set name
            </label>
            {props.error ?
                <span key={props.error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                    <span className="govuk-visually-hidden">Error:</span> {props.error.message}
                </span>
                :
                <span id="dataset-name-hint"
                      className="govuk-hint">
                        Use a descriptive, unique name that other users will understand.
                </span>
            }
            <input className="govuk-input"
                   id="dataset-name"
                   name="dataset-name"
                   type="text"
                   value={props.datasetName}
                   onChange={props.onDatasetNameChange}
                   aria-describedby="dataset-name-hint"/>
        </div>
    );
}

const DatasetDescription = (props: {
    datasetDescription: string,
    onDatasetDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    error: ErrorMessage | undefined,
}) => {
    return (
        <div className={`govuk-form-group ${props.error ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label"
                   htmlFor="dataset-description">
                Description
            </label>
            {props.error &&
                <span key={props.error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                    <span className="govuk-visually-hidden">Error:</span> {props.error.message}
                </span>
            }
            <textarea className="govuk-textarea"
                      id="dataset-description"
                      name="dataset-description"
                      value={props.datasetDescription}
                      onChange={props.onDatasetDescriptionChange}
                      rows={5}/>
        </div>
    );
}