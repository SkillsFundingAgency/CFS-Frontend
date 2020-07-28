import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {RouteComponentProps} from "react-router";
import {BackToTop} from "../../components/BackToTop";
import {Link} from "react-router-dom";
import {searchDatasetRelationships} from "../../services/datasetRelationshipsService";
import {SpecificationDatasetRelationshipsViewModel} from "../../types/Datasets/SpecificationDatasetRelationshipsViewModel";
import {LoadingStatus} from "../../components/LoadingStatus";
import {NoData} from "../../components/NoData";

export interface DataRelationshipsRouteProps {
    specificationId: string
}

export function DataRelationships({match}: RouteComponentProps<DataRelationshipsRouteProps>) {

    const [datasetRelationships, setDatasetRelationships] = useState<SpecificationDatasetRelationshipsViewModel>({
        items: [],
        specification: {
            id: "",
            templateIds: {
                PSG: "",
            },
            publishedResultsRefreshedAt: null,
            providerVersionId: "",
            name: "",
            lastCalculationUpdatedAt: "",
            isSelectedForFunding: false,
            fundingStreams: [{
                id: "",
                name: ""
            }],
            fundingPeriod: {
                id: "",
                name: ""
            },
            description: "",
            approvalStatus: ""
        },
        specificationTrimmedViewModel: {
            description: "",
            fundingPeriod: {
                id: "",
                name: ""
            },
            fundingStreams: [{
                name: "",
                id: ""
            }],
            id: "",
            name: "",
            publishStatus: 0
        },
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffectOnce(() => {
        setIsLoading(true);
        searchDatasetRelationships(match.params.specificationId).then((result) => {
            if (result.status === 200) {
                setDatasetRelationships(result.data as SpecificationDatasetRelationshipsViewModel);
            }
            setIsLoading(false);
        });
    });

    return (<div>
            <Header location={Section.Datasets}/>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <Breadcrumbs>
                            <Breadcrumb name={"Calculate funding"} url={"/"}/>
                            <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                            <Breadcrumb name={"Map data sources to datasets for a specification"} url={"/Datasets/MapDataSourceFiles"}/>
                            <Breadcrumb name={datasetRelationships.specification.name}/>
                        </Breadcrumbs>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-margin-bottom-5">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">
                            {datasetRelationships.specification.name}
                            <span className="govuk-caption-xl">{datasetRelationships.specification.fundingPeriod.name}</span>
                        </h1>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <Link id={"create-dataset-link"} to={`/Datasets/CreateDataset/${datasetRelationships.specification.id}`} className="govuk-button govuk-button--primary button-createSpecification" data-module="govuk-button">
                            Add new dataset
                        </Link>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <LoadingStatus title={"Loading datasets"} hidden={!isLoading}/>
                        <table id="datarelationship-table" className="govuk-table" hidden={datasetRelationships.items.length === 0 || isLoading}>
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                                    Dataset
                                </th>
                                <th scope="col" className="govuk-table__header">Mapped data source file</th>
                                <th scope="col" className="govuk-table__header"></th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            {datasetRelationships.items.map((sdr, index) =>

                                    <tr key={index} className="govuk-table__row">
                                        <th scope="row" className="govuk-table__header">
                                            {sdr.relationName}
                                            {sdr.isProviderData ? <span className="govuk-body-s govuk-!-margin-left-1">(Provider data)</span> : ""}
                                            <details className="govuk-details govuk-!-margin-bottom-0 govuk-!-margin-top-2" data-module="govuk-details">
                                                <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Dataset details
            </span>
                                                </summary>
                                                <div className="govuk-details__text">
                                                    <p className="govuk-body">
                                                        <strong>Data schema:</strong> {sdr.definitionName}
                                                    </p>
                                                    <p className="govuk-body">
                                                        <strong>Description:</strong> {sdr.definitionDescription}
                                                    </p>
                                                </div>
                                            </details>
                                        </th>
                                        <td className="govuk-table__cell">{sdr.datasetPhrase}</td>
                                        <td className="govuk-table__cell">
                                                <Link to={`/Datasets/SelectDataSource/${sdr.relationshipId}`} className="govuk-link">{sdr.linkPhrase}</Link>
                                        </td>
                                    </tr>
                            )}
                            </tbody>
                        </table>
                        <NoData hidden={datasetRelationships.items.length > 0 || isLoading} />
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full"><BackToTop id={"top"}/></div>
                </div>
            </div>
        </div>
    )
}
