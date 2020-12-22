import React, {useEffect, useState} from "react";
import {
    CalculationCompilePreviewResponse,
    CalculationDataType,
    CompilerOutputViewModel,
    PreviewCompileRequestViewModel
} from "../../types/Calculations/CalculationCompilePreviewResponse";
import {GdsMonacoEditor} from "../GdsMonacoEditor";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {CompilationErrorMessageList} from "./CompilationErrorMessageList";
import {FundingStream} from "../../types/viewFundingTypes";
import {compileCalculationPreviewService} from "../../services/calculationService";

export interface CalculationSourceCodeProps {
    excludeMonacoEditor: boolean,
    specificationId: string,
    calculationId?: string,
    calculationName: string,
    calculationType: string,
    dataType: CalculationDataType,
    fundingStreams: FundingStream[],
    originalSourceCode: string,
    onChange: (state: CalculationSourceCodeState) => void
}

export interface CalculationSourceCodeState {
    calculationBuild: CompilerOutputViewModel,
    isBuilding: boolean,
    isDirty: boolean,
    sourceCode: string,
    errorMessage: string,
    providerId: string,
    dataType: CalculationDataType
}

export function CalculationSourceCode(props: CalculationSourceCodeProps) {
    const [state, setState] = useState<CalculationSourceCodeState>({
        sourceCode: "Return 0",
        isBuilding: false,
        isDirty: false,
        errorMessage: "",
        calculationBuild: {
            hasCodeBuiltSuccessfully: undefined,
            previewResponse: undefined,
            isProviderValid: undefined,
            providerRuntimeException: "",
            providerName: "",
            providerResult: undefined,
        },
        providerId: "",
        dataType: CalculationDataType.Decimal
    });

    useEffect(() => {
        if (props.originalSourceCode && props.originalSourceCode.length > 0) {
            setState(prevState => {
                return {
                    ...prevState,
                    sourceCode: props.originalSourceCode,
                    isDirty: false,
                    isBuilding: false,
                    dataType: props.dataType,
                    calculationBuild: {
                        hasCodeBuiltSuccessfully: undefined,
                        previewResponse: undefined,
                        isProviderValid: undefined,
                        providerRuntimeException: "",
                        providerName: "",
                        providerResult: undefined,
                    }
                }
            });
        }
    }, [props.originalSourceCode]);

    useEffect(() => {
        props.onChange(state);
    }, [state]);

    useEffect(() => {
        if (state.isBuilding) {
            const previewCompileRequestViewModel: PreviewCompileRequestViewModel = {
                sourceCode: state.sourceCode,
                providerId: state.providerId,
                dataType: state.dataType
            }
            compileCalculationPreviewService(props.specificationId, props.calculationId?? 'temp-calc-id', previewCompileRequestViewModel)
                .then((result) => {
                    setState((prevState: CalculationSourceCodeState) => {
                        return {
                            ...prevState,
                            calculationBuild: {
                                hasCodeBuiltSuccessfully: result.status === 200 && result.data?.compilerOutput?.success === true,
                                previewResponse: result.data,
                                isProviderValid: state.providerId !== "" &&
                                    (result.data?.previewProviderCalculation?.providerName !== undefined && result.data?.previewProviderCalculation?.providerName !== ""),
                                providerRuntimeException: result.data?.previewProviderCalculation?.calculationResult?.exceptionMessage,
                                providerName: result.data?.previewProviderCalculation?.providerName,
                                providerResult: result.data?.previewProviderCalculation?.calculationResult,
                            },
                            errorMessage: result.status !== 200 && result.status !== 400 ?
                                "Unexpected response with status " + result.statusText : "",
                            isBuilding: false
                        }
                    });
                })
                .catch(err => {
                    setState(prevState => {
                        return {
                            ...prevState,
                            calculationBuild: {
                                hasCodeBuiltSuccessfully: false,
                                previewResponse: undefined,
                                isProviderValid: undefined,
                                providerRuntimeException: "",
                                providerName: "",
                                providerResult: undefined,
                            },
                            errorMessage: err.toString(),
                            isBuilding: false
                        }
                    });
                });
        }
    }, [state.isBuilding]);

    const onUpdateSourceCode = async (newSourceCode: string) => {
        if (newSourceCode) {
            setState(prevState => {
                return {
                    ...prevState,
                    sourceCode: newSourceCode,
                    calculationBuild: {
                        hasCodeBuiltSuccessfully: undefined,
                        previewResponse: undefined,
                        isProviderValid: undefined,
                        providerRuntimeException: "",
                        providerName: "",
                        providerResult: undefined,
                    },
                    isDirty: props.originalSourceCode !== newSourceCode
                }
            });
        }
    };

    function onUpdateUKPRN(e: React.ChangeEvent<HTMLInputElement>) {
        setState(prevState => {
            return {
                ...prevState,
                providerId: e.target.value
            }
        });
    }

    const onBuildCalculation = async () => {
        setState(prevState => {
            return {
                ...prevState,
                isBuilding: true
            }
        });
    };

    return <div id="source-code"
                className={"govuk-form-group govuk-!-margin-bottom-0 govuk-!-margin-top-3" + ((state.calculationBuild.hasCodeBuiltSuccessfully === false) ? " govuk-form-group--error" : "")}>
        <h4 className="govuk-heading-s">
            Calculation script
        </h4>
        {!props.excludeMonacoEditor &&
        <GdsMonacoEditor
            value={state.sourceCode}
            change={onUpdateSourceCode}
            language={"vb"}
            minimap={false}
            specificationId={props.specificationId}
            calculationType={props.calculationType + "Calculation"}
            calculationName={props.calculationName ? props.calculationName : ""}
            fundingStreams={props.fundingStreams}
            calculationId={props.calculationId}
        />}

        <h4 className="govuk-heading-s">
            UKPRN
            <span className="govuk-hint">
            Optional: Enter a UKPRN to view calculation results for this provider
          </span>
        </h4>

        <div className="govuk-form-group govuk-!-margin-bottom-5">
            <input className="govuk-input govuk-input--width-10" type="text" aria-label="enter UKPRN"
                   data-testid="providerId"
                   onChange={onUpdateUKPRN}
                   value={state.providerId}/>
        </div>

        <button data-prevent-double-click="true"
                className="govuk-button"
                data-module="govuk-button"
                data-testid="build"
                onClick={onBuildCalculation}
                disabled={state.isBuilding}>
            Build calculation
        </button>
        <LoadingFieldStatus title={"Building source code"} hidden={!state.isBuilding}/>

        {state.calculationBuild.hasCodeBuiltSuccessfully !== undefined &&
        <div
            className={"govuk-inset-text" + (!state.calculationBuild.hasCodeBuiltSuccessfully ? " govuk-form-group--error" : "")}>
            <label className="govuk-label">
                <h4 className="govuk-heading-s">
                    Build output
                </h4>
            </label>
            {state.calculationBuild.hasCodeBuiltSuccessfully &&
            <div>
                <p className="govuk-body">Code compiled successfully </p>
                {!state.calculationBuild.isProviderValid &&
                <p className="govuk-body"><strong>No provider found. Try a different UKPRN.</strong></p>
                }
                {state.calculationBuild.isProviderValid && state.calculationBuild.providerRuntimeException !== "" &&
                <p className="govuk-body"><strong>{state.calculationBuild.providerRuntimeException}</strong></p>
                }
                {state.calculationBuild.providerName !== "" &&
                <p className="govuk-body"><strong>Provider: {state.calculationBuild.providerName}</strong></p>
                }
                {state.calculationBuild.providerResult !== undefined &&
                <p className="govuk-body"><strong>Provider result: {state.calculationBuild.providerResult.value}</strong></p>
                }
            </div>
            }
            {!state.calculationBuild.hasCodeBuiltSuccessfully && state.calculationBuild.previewResponse &&
            <CompilationErrorMessageList
                compilerMessages={state.calculationBuild.previewResponse.compilerOutput.compilerMessages}/>
            }
        </div>
        }
    </div>
}
