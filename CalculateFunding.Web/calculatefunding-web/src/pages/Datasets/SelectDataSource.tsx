import React, {useEffect, useState} from "react";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {RouteComponentProps, useHistory} from "react-router";
import {DateFormatter} from "../../components/DateFormatter";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {DatasourceRelationshipResponseViewModel} from "../../types/Datasets/DatasourceRelationshipResponseViewModel";
import {ErrorSummary} from "../../components/ErrorSummary";
import {Link} from "react-router-dom";
import {assignDataSourceService, getDatasourcesByRelationshipIdService} from "../../services/datasetService";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {MappingStatus} from "../../components/MappingStatus";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {JobSummary} from "../../types/jobSummary";
import {RunningStatus} from "../../types/RunningStatus";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";

export interface SelectDataSourceRouteProps {
    datasetRelationshipId: string
}

export function SelectDataSource({match}: RouteComponentProps<SelectDataSourceRouteProps>) {
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    });
    const [datasourceVersions, setDatasourceVersions] = useState<DatasourceRelationshipResponseViewModel>({
        datasets: [{
            name: "",
            id: "",
            selectedVersion: 0,
            versions: [{
                author: {
                    name: "",
                    id: ""
                },
                date: new Date(),
                id: "",
                version: 0
            }],
            description: ""
        }],
        definitionId: "",
        definitionName: "",
        relationshipId: "",
        relationshipName: "",
        specificationId: "",
        specificationName: ""
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [missingVersion, setMissingVersion] = useState<boolean>(false);
    const [saveErrorOccurred, setSaveErrorOccurred] = useState<boolean>(false);
    const [selectedDataset, setSelectedDataset] = useState<string>("");
    const [isAssigning, setIsAssigning] = useState<boolean>(false);
    const [isInitiating, setIsInitiating] = useState<boolean>(false);
    const [jobMessage, setJobMessage] = useState<JobSummary | JobMessage>();
    let history = useHistory();
    const {canMapDatasets, missingPermissions} =
        useSpecificationPermissions(specificationSummary.id, [SpecificationPermissions.MapDatasets]);

    useEffect(() => {
        getDatasourcesByRelationshipIdService(match.params.datasetRelationshipId)
            .then((relationshipResult) => {
                const relationship = relationshipResult.data as DatasourceRelationshipResponseViewModel;
                setDatasourceVersions(relationship);
                relationship.datasets.forEach(x => {
                    if(x.selectedVersion !== null)
                    {
                        setSelectedDataset(x.id);
                    }
                });
                return getSpecificationSummaryService(relationship.specificationId);
            })
            .then((specResult) => {
                setSpecificationSummary(specResult.data as SpecificationSummary);
            })
            .catch((err) => {
                setMissingVersion(true);})
            .finally(() => {
                setIsLoading(false);});
    }, [match.params.datasetRelationshipId]);

    useEffect(() => {
        const retrieveLatestJobSpecification = async (specificationId: string) => {
            try {
                const latestJobResponse = await getJobStatusUpdatesForSpecification(specificationId, "MapDatasetJob");
                if (latestJobResponse.data && latestJobResponse.data.length > 0) {
                    setJobMessage(latestJobResponse.data[0]);
                }
            }
            catch (err) {
                // API returns a 400 if no job exists so ignore
            }
        };

        let hubConnect: HubConnection;

        const createHubConnection = async () => {
            hubConnect = new HubConnectionBuilder()
                .withUrl(`/api/notifications`)
                .withAutomaticReconnect()
                .build();
            hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
            hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;

            try {
                await hubConnect.start();

                hubConnect.on('NotificationEvent', (message: JobMessage) => {
                    if (message.jobType === "MapDatasetJob" &&
                        message.specificationId === datasourceVersions.specificationId) {
                        setIsInitiating(false);
                        setJobMessage(message);
                        if (message.runningStatus !== RunningStatus.Completed) {
                            setIsAssigning(true);
                        } else {
                            setIsAssigning(false);
                        }
                    }
                });

                await hubConnect.invoke("StartWatchingForAllNotifications");

            } catch (err) {
                await hubConnect.stop();
            }
        };

        if (!datasourceVersions.specificationId || datasourceVersions.specificationId.length === 0) return;
        retrieveLatestJobSpecification(datasourceVersions.specificationId);
        createHubConnection();
        return () => {
            hubConnect.stop();
        }
    }, [datasourceVersions]);

    function populateVersions(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedRadioButton = e.target.value;
        setSelectedDataset(selectedRadioButton);
    }

    function changeSelection() {
        history.goBack();
    }

    function saveSelection(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            setSelectedVersion(e.target.value);
        }
    }

    async function saveVersion() {
        if (selectedVersion === "") {
            return;
        }
        setMissingVersion(false);
        setSaveErrorOccurred(false);
        setIsAssigning(true);
        setIsInitiating(true);
        assignDataSourceService(datasourceVersions.relationshipId, specificationSummary.id, selectedVersion)
            .catch(() => setSaveErrorOccurred(true));
    }

    const allowToMapDatasets = !isLoading && canMapDatasets;

    return (<div>
        <Header location={Section.Datasets} />
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full" hidden={specificationSummary.name === ""}>
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"} />
                        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
                        <Breadcrumb name={"Map data source files to datasets for a specification"} url={"/Datasets/MapDataSourceFiles"} />
                        <Breadcrumb name={specificationSummary.name} url={`/Datasets/DataRelationships/${specificationSummary.id}`} />
                        <Breadcrumb name={`Change ${specificationSummary.name}`} />
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row" hidden={!isLoading}>
                <div className="govuk-grid-column-full">
                    <LoadingStatus title={"Loading datasources"} />
                </div>
            </div>
            <div className="govuk-grid-row" hidden={!isInitiating}>
                <div className="govuk-grid-column-full">
                    <LoadingStatus title={"Assigning version to dataset"} />
                </div>
            </div>
            {!allowToMapDatasets && missingPermissions &&
                <div className="govuk-grid-row">
                    <PermissionStatus requiredPermissions={missingPermissions} hidden={isInitiating || isLoading} />
                </div>}
            {!isLoading && !isInitiating &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">
                            {specificationSummary.name}
                            <span className="govuk-caption-xl">{specificationSummary.fundingPeriod.name}</span>
                        </h1>
                        {jobMessage &&
                            <div className="govuk-form-group">
                                <MappingStatus jobMessage={jobMessage} />
                            </div>}
                        {allowToMapDatasets &&
                            <div className="govuk-form-group">
                                <div hidden={!missingVersion}>
                                    <ErrorSummary title={"Please select a version"} error={"No selection has been made"}
                                        suggestion={"No version is selected. Please select a version to apply."} />
                                </div>
                                <div hidden={!saveErrorOccurred}>
                                    <ErrorSummary title={"Error"} error={"An error was encountered whilst trying to save changes"}
                                        suggestion={"Please check and try again."} />
                                </div>
                                <div
                                    hidden={datasourceVersions !== null && datasourceVersions.datasets !== null && datasourceVersions.datasets.length > 0}>
                                    <ErrorSummary title={"Error"} error={"No datasets available for you"}
                                        suggestion={"Please check your permissions or data."} />
                                </div>
                            </div>}
                        <div className="govuk-form-group" hidden={isLoading}>
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h4 className="govuk-heading-s">Select data source file</h4>
                                </legend>
                                <span id="select-one-option" className="govuk-hint">
                                    Select one option.
                                </span>
                                {datasourceVersions && datasourceVersions.datasets &&
                                    <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                        {datasourceVersions.datasets.map(d =>
                                            <React.Fragment key={d.id}>
                                                <div className="govuk-radios__item">
                                                    <input className="govuk-radios__input" id={`dataset-${d.id}`} name={`dataset-options`} type="radio"
                                                        aria-controls="conditional-master-dataset-option-conditional" aria-expanded="false"
                                                        value={d.id}
                                                        disabled={!allowToMapDatasets}
                                                        defaultChecked={d.selectedVersion !== null}
                                                        onChange={(e) => populateVersions(e)} />
                                                    <label className="govuk-label govuk-radios__label" htmlFor={`dataset-${d.id}`}>
                                                        {d.name}
                                                        <span className="govuk-hint">
                                                            <strong>Description:</strong> {d.description}
                                                        </span>
                                                    </label>
                                                </div>
                                                <div className="govuk-radios__conditional" id="conditional-how-contacted-conditional"
                                                    hidden={d.id !== selectedDataset}>
                                                    <div className="govuk-form-group">
                                                        <fieldset className="govuk-fieldset">
                                                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                                                <h4 className="govuk-heading-s">Select data source version</h4>
                                                            </legend>
                                                            <div className="govuk-radios govuk-radios--small">
                                                                {d.versions.slice(0, 5).map((v, index) =>
                                                                    <div className="govuk-radios__item" key={index}>
                                                                        <input className="govuk-radios__input" id={`datasource-${v.id}`}
                                                                            name={`datasource-${v.id}`} type="radio" value={`${d.id}_${v.version}`}
                                                                            defaultChecked={d.selectedVersion === v.version}
                                                                            onChange={(e) => saveSelection(e)} />
                                                                        <label className="govuk-label govuk-radios__label" htmlFor={`datasource-${v.id}`}>
                                                                            {d.name} (version {v.version})
                                                                        <div className="govuk-!-margin-top-1">
                                                                                <details className="govuk-details  summary-margin-removal"
                                                                                    data-module="govuk-details">
                                                                                    <div className="govuk-details__text summary-margin-removal">
                                                                                        <p className="govuk-body-s">
                                                                                            <strong>Version notes:</strong>
                                                                                        </p>
                                                                                        <p className="govuk-body-s">
                                                                                            <strong>Last updated:</strong>
                                                                                            <DateFormatter date={v.date} utc={true} /></p>
                                                                                        <p className="govuk-body-s">
                                                                                            <strong>Last updated by:</strong> {v.author.name}
                                                                                        </p>
                                                                                    </div>
                                                                                </details>
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                    <p className="govuk-body govuk-!-margin-top-5" hidden={d.versions.length <= 5}>
                                                        <Link
                                                            to={`/Datasets/SelectDataSourceExpanded/${specificationSummary.id}/${d.id}/${datasourceVersions.relationshipId}`}
                                                            className="govuk-link">View {datasourceVersions.datasets.length - 5} more versions</Link>
                                                    </p>
                                                </div>
                                            </React.Fragment>
                                        )}
                                    </div>}
                            </fieldset>
                        </div>
                        <div className="govuk-form-group" hidden={isLoading}>
                            <button className="govuk-button govuk-!-margin-right-1" onClick={saveVersion} disabled={selectedVersion === "" || isAssigning}>Save
                            </button>
                            <button className="govuk-button govuk-button--secondary" onClick={changeSelection}>Cancel</button>
                        </div>
                    </div>
                </div>}
        </div>
        <Footer />
    </div>
    )
}
