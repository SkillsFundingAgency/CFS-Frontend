import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import React, {useEffect, useState} from "react";
import {getCalculationByIdService, getMultipleVersionsByCalculationIdService} from "../../services/calculationService";
import {Calculation} from "../../types/CalculationSummary";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {CalculationVersionHistorySummary} from "../../types/Calculations/CalculationVersionHistorySummary";
import {GdsMonacoDiffEditor} from "../../components/GdsMonacoDiffEditor";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link} from "react-router-dom";

export interface CompareCalculationVersionsRouteProps {
    calculationId: string;
    firstCalculationVersionId: string;
    secondCalculationVersionId: string
}

export function CompareCalculationVersions({match}: RouteComponentProps<CompareCalculationVersionsRouteProps>) {
    const [isLoading, setIsLoading] = useState({
        specifications: true,
        calculations: true,
        calculationVersions: true
    });
    const calculationId = match.params.calculationId;
    const firstCalculationVersionId = parseInt(match.params.firstCalculationVersionId);
    const secondCalculationVersionId = parseInt(match.params.secondCalculationVersionId);

    const [specification, setSpecification] = useState<SpecificationSummary>({
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
    const [calculation, setCalculation] = useState<Calculation>({
        calculationType: "",
        description: null,
        fundingStreamId: "",
        id: "",
        lastUpdatedDate: new Date(),
        lastUpdatedDateDisplay: "",
        name: "",
        namespace: "",
        specificationId: "",
        specificationName: "",
        status: "",
        valueType: "",
        wasTemplateCalculation: false
    });
    const [calculationVersions, setCalculationVersions] = useState<CalculationVersionHistorySummary[]>([{
        sourceCode: "",
        version: 0,
        author: {
            name: "",
            id: "",
        },
        calculationId: "",
        calculationType: "",
        description: null,
        lastUpdated: new Date(),
        name: "",
        namespace: "",
        publishStatus: "",
        sourceCodeName: "",
        wasTemplateCalculation: false
    }, {
        sourceCode: "",
        version: 0,
        author: {
            name: "",
            id: "",
        },
        calculationId: "",
        calculationType: "",
        description: null,
        lastUpdated: new Date(),
        name: "",
        namespace: "",
        publishStatus: "",
        sourceCodeName: "",
        wasTemplateCalculation: false
    }]);

    const [inlineCodeView, setInlineCodeView] = useState<boolean>(false);

    function populateCalculation(calculationId: string) {
        getCalculationByIdService(calculationId).then((result) => {
            const response = result.data as Calculation;
            setCalculation(response);
            setIsLoading(prevState => {
                return {...prevState, calculations: false}
            })
        })
    }

    function populateSpecification(specificationId: string) {
        getSpecificationSummaryService(specificationId).then((result) => {
            const response = result.data as SpecificationSummary;
            setSpecification(response);
            setIsLoading(prevState => {
                return {...prevState, specifications: false}
            })
        })
    }

    function populateCalculationVersions(calculationId: string, versions: number[]) {
        getMultipleVersionsByCalculationIdService(calculationId, versions).then((result) => {
            const response = result.data as CalculationVersionHistorySummary[];
            setCalculationVersions(response);
            setIsLoading(prevState => {
                return {...prevState, calculationVersions: false}
            })
        })
    }

    useEffectOnce(() => {
        populateCalculation(calculationId);
        populateCalculationVersions(calculationId, [firstCalculationVersionId, secondCalculationVersionId]);
    });

    useEffect(() => {
        if (calculation.specificationId !== "") {
            populateSpecification(calculation.specificationId);
        }

    }, [calculation.specificationId]);

    function changeInlineCodeView(e: React.ChangeEvent<HTMLInputElement>) {
        const viewInline = e.target.checked;
        setInlineCodeView(viewInline);
    }

    return <div><Header location={Section.Specifications}/>
        <LoadingStatus title={"Loading calculation version history"}
                       description={"Please wait whilst calculation versions are loaded"} hidden={!isLoading.calculations && !isLoading.specifications && !isLoading.calculationVersions}/>
        <div className="govuk-width-container" hidden={isLoading.calculations || isLoading.specifications || isLoading.calculationVersions}>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                        <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`}/>
                        <Breadcrumb name={"Calculation version history"}/>
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-full">
                    <p className="govuk-body">Funding Period: <span>Financial year 2020 to 2021</span></p>
                    <h1 className="govuk-heading-xl">Primary unit of funding</h1>
                </div>
            </div>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            6 December 2020 10:33am <span className="right-align">Draft</span>
                        </label></div>
                </div>
                <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            6 December 2020 10:33am <span className="right-align">Draft</span>
                        </label></div>
                </div>
                <div className="govuk-grid-column-full">
                    <div className="govuk-form-group">
                        <GdsMonacoDiffEditor firstCalculationVersion={calculationVersions[0].sourceCode} secondCalculationVersion={calculationVersions[1].sourceCode} inlineCodeViewer={inlineCodeView}/>
                    </div>
                </div>
            </div>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-checkboxes govuk-checkboxes--small">
                                <div className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input" id="organisation" name="organisation"
                                           type="checkbox" onChange={(e) => changeInlineCodeView(e)}/>
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor="organisation">
                                        Inline code viewer
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <Link to={`/Calculations/CalculationVersionHistory/${calculationId}`} className="govuk-back-link">Back</Link>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>
}