import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {RouteComponentProps, useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {ErrorSummary} from "../../components/ErrorSummary";
import {Link} from "react-router-dom";
import {assignDataSourceService} from "../../services/datasetService";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {MappingStatus} from "../../components/DatasetMapping/MappingStatus";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {JobType} from "../../types/jobType";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useRelationshipData} from "../../hooks/useRelationshipData";
import {Dataset} from "../../types/Datasets/RelationshipData";
import {DatasetVersionSelection} from "../../components/DatasetMapping/DatasetVersionSelection";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {ErrorMessage} from "../../types/ErrorMessage";

export interface SelectDataSourceRouteProps {
    datasetRelationshipId: string
}

export function SelectDataSource({match}: RouteComponentProps<SelectDataSourceRouteProps>) {
    const [newVersionNumber, setNewVersionNumber] = useState<number | undefined>();
    const [newDataset, setNewDataset] = useState<Dataset>();
    const [missingVersion, setMissingVersion] = useState<boolean>(false);
    const [saveErrorOccurred, setSaveErrorOccurred] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    let history = useHistory();
    const [errors, setErrors] = useState<ErrorMessage[]>([]);

    const {relationshipData, isLoadingRelationshipData} = useRelationshipData(match.params.datasetRelationshipId);

    const specificationId = relationshipData && relationshipData.specificationId ? relationshipData.specificationId : "";
    const {specification, isLoadingSpecification} = 
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification") );

    const {isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.MapDatasets]);

    const {hasJob, latestJob, hasActiveJob, hasFailedJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(specificationId, [JobType.MapDatasetJob, JobType.MapFdzDatasetsJob, JobType.MapScopedDatasetJob, JobType.MapScopedDatasetJobWithAggregation]);
    
    function getCurrentDataset() {
        return newDataset ? newDataset :
            relationshipData ? relationshipData.datasets.find(x => x.selectedVersion !== null) :
                undefined;
    }

    function getCurrentVersion() {
        const dataset = getCurrentDataset();
        if (!dataset) {
            return undefined;
        }
        if (!newVersionNumber) {
            return dataset.versions.find(v => v.version === dataset.selectedVersion);
        }
        return dataset.versions.find(x => x.version === newVersionNumber);
    }

    function changeDataset(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        const currentDataset = getCurrentDataset();

        if (!currentDataset || newValue !== currentDataset.id) {
            const dataset = relationshipData?.datasets.find(x => x.id === newValue);
            setNewDataset(dataset);

            // auto select version if only one exists
            if (dataset && dataset.versions.length === 1) {
                const version = dataset.versions[0];
                setNewVersionNumber(version.version);
            } else {
                setNewVersionNumber(undefined);
            }
        }
    }

    function changeVersion(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        const newValueAsNumber: number = +newValue;
        const currentVersion = getCurrentVersion();

        if (!currentVersion || newValueAsNumber !== currentVersion.version) {
            const dataset = getCurrentDataset();
            if (!dataset) {
                throw new Error("Error: selecting version without a selected dataset");
            }
            const newVersion = dataset.versions.find(x => x.version === newValueAsNumber);
            if (!newVersion) {
                throw new Error("Error: selected version doesn't exist in selected dataset");
            }
            setNewVersionNumber(newVersion.version);
            setNewDataset(dataset);
        }
    }

    function goBack() {
        history.goBack();
    }

    function addErrorMessage(errorMessage: string, description?: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {
            id: errorCount + 1,
            fieldName: fieldName,
            description: description,
            message: errorMessage
        };
        setErrors(errors => [...errors, error]);
    }

    async function changeSpecificationDataMapping() {
        if (!newVersionNumber || !newDataset || !relationshipData || !specification) {
            return;
        }
        setMissingVersion(false);
        setSaveErrorOccurred(false);
        setIsUpdating(true);
        assignDataSourceService(relationshipData.relationshipId, specification.id, `${newDataset.id}_${newVersionNumber}`)
            .catch(() => setSaveErrorOccurred(true))
            .finally(() => setIsUpdating(false));
    }

    const specificationName = !isLoadingSpecification && specification && specification.name.length > 0 ? specification.name : "Specification";

    return (<div>
            <Header location={Section.Datasets}/>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <Breadcrumbs>
                            <Breadcrumb name={"Calculate funding"} url={"/"}/>
                            <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                            <Breadcrumb name={"Map data source files to datasets for a specification"} url={"/Datasets/MapDataSourceFiles"}/>
                            {specification &&
                            <Breadcrumb name={specificationName} url={`/Datasets/DataRelationships/${specification.id}`}/>}
                            <Breadcrumb name={`Change ${specificationName}`}/>
                        </Breadcrumbs>
                    </div>
                </div>
                <MultipleErrorSummary errors={errors} />
                {(isLoadingRelationshipData || isLoadingSpecification || isUpdating) &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <LoadingStatus title={isLoadingSpecification ? "Loading specification..." :
                            isLoadingRelationshipData ? "Loading data sources..." :
                                isUpdating ? "Assigning version to dataset..." : ""}/>
                    </div>
                </div>}
                {!isLoadingRelationshipData && isPermissionsFetched && hasMissingPermissions &&
                <div className="govuk-grid-row">
                    <PermissionStatus requiredPermissions={missingPermissions} hidden={false}/>
                </div>}
                {!isLoadingRelationshipData && !isUpdating &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        {specification &&
                        <h1 className="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-5">
                            {specification.name}
                            <span className="govuk-caption-xl govuk-!-margin-top-3">{specification.fundingPeriod.name}</span>
                        </h1>}
                        {(isCheckingForJob || hasJob) &&
                        <div className="govuk-form-group">
                            <LoadingFieldStatus title={"Checking for running jobs..."} hidden={!isCheckingForJob}/>
                            {hasJob &&
                            <MappingStatus job={latestJob} hasActiveJob={hasActiveJob}/>
                            }
                        </div>}
                        {!isCheckingForPermissions && !hasMissingPermissions &&
                        <div className="govuk-form-group">
                            <div hidden={!missingVersion}>
                                <ErrorSummary title={"Please select a version"} error={"No selection has been made"}
                                              suggestion={"No version is selected. Please select a version to apply."}/>
                            </div>
                            <div hidden={!saveErrorOccurred}>
                                <ErrorSummary title={"Error"} error={"An error was encountered whilst trying to save changes"}
                                              suggestion={"Please check and try again."}/>
                            </div>
                            <div hidden={relationshipData && relationshipData.datasets && relationshipData.datasets.length > 0}>
                                <ErrorSummary title={"Error"} error={"No datasets available for you"}
                                              suggestion={"Please check your permissions or data."}/>
                            </div>
                        </div>}
                        {!isCheckingForPermissions && !hasMissingPermissions && !hasActiveJob &&
                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h4 className="govuk-heading-s">Select data source file</h4>
                                </legend>
                                <span id="select-one-option" className="govuk-hint">
                                    Select one option.
                                </span>
                                {relationshipData && relationshipData.datasets &&
                                <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                    {relationshipData.datasets.map(dataset =>
                                        <React.Fragment key={dataset.id}>
                                            <div className="govuk-radios__item">
                                                <input className="govuk-radios__input"
                                                       id={`dataset-${dataset.id}`}
                                                       type="radio"
                                                       aria-controls="conditional-master-dataset-option-conditional"
                                                       aria-expanded="false"
                                                       value={dataset.id}
                                                       checked={newDataset ? dataset.id === newDataset.id : dataset.selectedVersion !== null}
                                                       onChange={changeDataset}/>
                                                <label className="govuk-label govuk-radios__label govuk-!-padding-top-0" htmlFor={`dataset-${dataset.id}`}>
                                                    {dataset.name}
                                                    <span className="govuk-hint">
                                                        <strong>Description:</strong> {dataset.description}
                                                    </span>
                                                </label>
                                            </div>
                                            {(newDataset ? dataset.id === newDataset.id : dataset.selectedVersion !== null) &&
                                            <div className="govuk-radios__conditional" id="conditional-how-contacted-conditional">
                                                <div className="govuk-form-group">
                                                    <fieldset className="govuk-fieldset">
                                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                                            <h4 className="govuk-heading-s">Select data source version</h4>
                                                        </legend>
                                                        <DatasetVersionSelection
                                                            newVersionNumber={newVersionNumber}
                                                            dataset={dataset}
                                                            changeVersion={changeVersion}/>
                                                    </fieldset>
                                                </div>
                                                {specification && dataset.versions.length > 5 &&
                                                <p className="govuk-body govuk-!-margin-top-5">
                                                    <Link
                                                        to={`/Datasets/SelectDataSourceExpanded/${specification.id}/${dataset.id}/${relationshipData.relationshipId}`}
                                                        className="govuk-link">View {relationshipData.datasets.length - 5} more versions</Link>
                                                </p>}
                                            </div>
                                            }
                                        </React.Fragment>
                                    )}
                                </div>}
                            </fieldset>
                        </div>
                        }
                        <div className="govuk-form-group">
                            {!hasActiveJob &&
                            <button className="govuk-button govuk-!-margin-right-1"
                                    name="saveButton"
                                    aria-label="saveButton"
                                    onClick={changeSpecificationDataMapping}
                                    disabled={!newVersionNumber || hasMissingPermissions || isCheckingForJob || hasActiveJob || isUpdating}>
                                Save
                            </button>
                            }
                            {(hasMissingPermissions || isUpdating || hasActiveJob) ?
                                <button className="govuk-button govuk-button--secondary" name="backButton" aria-label="backButton" onClick={goBack}>Back</button>
                                :
                                <button className="govuk-button govuk-button--secondary" name="cancelButton" aria-label="cancelButton" onClick={goBack}>Cancel</button>
                            }
                        </div>
                    </div>
                </div>}
            </div>
            <Footer/>
        </div>
    )
}
