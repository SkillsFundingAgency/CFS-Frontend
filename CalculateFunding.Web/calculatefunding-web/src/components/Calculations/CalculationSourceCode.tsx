import React, {useEffect, useState} from "react";
import {CompilerOutputViewModel} from "../../types/Calculations/CalculationCompilePreviewResponse";
import {GdsMonacoEditor} from "../GdsMonacoEditor";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {CompilationErrorMessageList} from "./CompilationErrorMessageList";
import {FundingStream} from "../../types/viewFundingTypes";
import {compileCalculationPreviewService} from "../../services/calculationService";

export interface CalculationSourceCodeProps {
    excludeMonacoEditor: boolean,
    specificationId: string,
    calculationName: string,
    calculationType: string,
    fundingStreams: FundingStream[],
    originalSourceCode: string,
    onChange: (state: CalculationSourceCodeState) => void,
}

export interface CalculationSourceCodeState {
    calculationBuild: CompilerOutputViewModel,
    isBuilding: boolean,
    isDirty: boolean,
    sourceCode: string,
    errorMessage: string
}

export function CalculationSourceCode(props: CalculationSourceCodeProps) {
    const [state, setState] = useState<CalculationSourceCodeState>({
        sourceCode: "Return 0",
        isBuilding: false,
        isDirty: false,
        errorMessage: "",
        calculationBuild: {
            hasCodeBuiltSuccessfully: undefined,
            previewResponse: undefined
        }
    });
    
    useEffect(() => {
        if (props.originalSourceCode && props.originalSourceCode.length > 0) {
            setState(prevState => {
                return {
                    ...prevState,
                    sourceCode: props.originalSourceCode,
                    isDirty: false,
                    isBuilding: false,
                    calculationBuild: {
                        hasCodeBuiltSuccessfully: undefined,
                        previewResponse: undefined
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
            compileCalculationPreviewService(props.specificationId, 'temp-calc-id', state.sourceCode)
                .then((result) => {
                    setState(prevState => {
                        return {
                            ...prevState,
                            calculationBuild: {
                                hasCodeBuiltSuccessfully: result.status === 200 && result.data?.compilerOutput?.success === true,
                                previewResponse: result.data
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
                                previewResponse: undefined
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
                        previewResponse: undefined
                    },
                    isDirty: props.originalSourceCode !== newSourceCode
                }
            });
        }
    };
    
    const onBuildCalculation = async () => {
        setState(prevState => {
            return {
                ...prevState,
                isBuilding: true
            }
        });
    };

    return <div id="source-code"
                className={"govuk-form-group" + ((state.calculationBuild.hasCodeBuiltSuccessfully === false) ? " govuk-form-group--error" : "")}>
        <h3 className="govuk-caption-m govuk-!-font-weight-bold">
            Calculation script
        </h3>
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
        />}
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
        <div className={"govuk-inset-text" + (!state.calculationBuild.hasCodeBuiltSuccessfully ? " govuk-form-group--error" : "")}>
            <label className="govuk-label" htmlFor="build-output">
                <h4 className="govuk-heading-s">
                    Build output
                </h4>
            </label>
            {state.calculationBuild.hasCodeBuiltSuccessfully &&
            <p id="build-output" className="govuk-body">Code compiled successfully </p>
            }
            {!state.calculationBuild.hasCodeBuiltSuccessfully && state.calculationBuild.previewResponse &&
            <CompilationErrorMessageList compilerMessages={state.calculationBuild.previewResponse.compilerOutput.compilerMessages}/>
            }
        </div>
        }
    </div>
}
