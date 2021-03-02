import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import React, {useEffect, useState} from "react";
import {getCalculationByIdService, getMultipleVersionsByCalculationIdService} from "../../services/calculationService";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {CalculationVersionHistorySummary} from "../../types/Calculations/CalculationVersionHistorySummary";
import {GdsMonacoDiffEditor} from "../../components/GdsMonacoDiffEditor";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Link} from "react-router-dom";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {CalculationDetails} from "../../types/CalculationDetails";
import {CalculationType} from "../../types/CalculationSearchResponse";
import {ValueType} from "../../types/ValueType";
import {PublishStatus} from "../../types/PublishStatusModel";
import {CalculationDataType} from "../../types/Calculations/CalculationCompilePreviewResponse";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import {BackLink} from "../../components/BackLink";

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
    const {errors, addError} = useErrors();
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
        providerVersionId: "",
        dataDefinitionRelationshipIds: [],
        templateIds: {},
        coreProviderVersionUpdates: undefined
    });
    const [calculation, setCalculation] = useState<CalculationDetails>({
        calculationType: CalculationType.Template,
        fundingStreamId: "",
        id: "",
        lastUpdated: new Date(),
        name: "",
        namespace: "",
        specificationId: "",
        dataType: CalculationDataType.Decimal,
        publishStatus: PublishStatus.Draft,
        valueType: ValueType.Percentage,
        wasTemplateCalculation: false,
        author: {id: "", name: ""},
        sourceCode: "",
        sourceCodeName: "",
        version: 0
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
            const response = result.data as CalculationDetails;
            setCalculation(response);
        }).catch(err => {
            addError({error: err, description: `Error while getting calculation`});
        }).finally(() => {
            setIsLoading(prevState => {
                return {...prevState, calculations: false}
            });
        })
    }

    function populateSpecification(specificationId: string) {
        getSpecificationSummaryService(specificationId).then((result) => {
            const response = result.data as SpecificationSummary;
            setSpecification(response);
        }).catch(err => {
            addError({error: err, description: `Error while getting specification summary`});
        }).finally(() => {
            setIsLoading(prevState => {
                return {...prevState, specifications: false}
            })
        });
    }

    function populateCalculationVersions(calculationId: string, versions: number[]) {
        getMultipleVersionsByCalculationIdService(calculationId, versions).then((result) => {
            const response = result.data as CalculationVersionHistorySummary[];
            setCalculationVersions(response);
        }).catch(err => {
            addError({error: err, description: `Error while getting calculation versions`});
        }).finally(() => {
            setIsLoading(prevState => {
                return {...prevState, calculationVersions: false}
            });
        });
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

    return <div><Header location={Section.Specifications} />
        <LoadingStatus title={"Loading calculation version history"}
            description={"Please wait whilst calculation versions are loaded"} hidden={!isLoading.calculations && !isLoading.specifications && !isLoading.calculationVersions} />
        <div className="govuk-width-container" hidden={isLoading.calculations || isLoading.specifications || isLoading.calculationVersions}>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"} />
                        <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
                        <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`} />
                        <Breadcrumb name={"Calculation version history"} />
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors} />
                </div>
            </div>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-full">
                    <p className="govuk-body">Funding Period: <span>{specification.fundingPeriod.name}</span></p>
                    <h1 className="govuk-heading-xl">{calculation.name}</h1>
                </div>
            </div>
            <div className="govuk-grid-row" >
                <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            <DateTimeFormatter date={calculationVersions[0].lastUpdated} /> <span className="right-align">{calculationVersions[0].publishStatus}</span>
                        </label></div>
                </div>
                <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            <DateTimeFormatter date={calculationVersions[1].lastUpdated} /> <span className="right-align">{calculationVersions[1].publishStatus}</span>
                        </label></div>
                </div>
                <div className="govuk-grid-column-full">
                    <div className="govuk-form-group">
                        <GdsMonacoDiffEditor firstCalculationVersion={calculationVersions[0].sourceCode} secondCalculationVersion={calculationVersions[1].sourceCode} inlineCodeViewer={inlineCodeView} />
                    </div>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-checkboxes govuk-checkboxes--small">
                                <div className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input" id="organisation" name="organisation"
                                        type="checkbox" onChange={(e) => changeInlineCodeView(e)} />
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor="organisation">
                                        Inline code viewer
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <BackLink to={`/Calculations/CalculationVersionHistory/${calculationId}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}