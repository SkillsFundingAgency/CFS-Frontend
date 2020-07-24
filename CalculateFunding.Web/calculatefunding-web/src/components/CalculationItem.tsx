import React, {useState} from "react";
import {Calculation, CalculationType, ValueFormatType, CalculationUpdateModel, AggregrationType, GroupRate, PercentageChangeBetweenAandB, CalculationAggregationType, CalculationDictionaryItem} from '../types/TemplateBuilderDefinitions';
import {TagEditor} from "./TagEditor";
import "../styles/CalculationItem.scss";
import {getStringArray, stringArrayToString} from "../services/templateBuilderDatasourceService";

export interface CalculationItemProps {
    node: Calculation,
    calcs: CalculationDictionaryItem[],
    updateNode: (p: CalculationUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>,
    cloneCalculation: (targetCalculationId: string, sourceCalculationId: string) => void,
    checkIfTemplateCalculationIdInUse: (templateCalculationId: number) => boolean,
    refreshNextId: () => void,
}

export function CalculationItem({
    node,
    calcs,
    updateNode,
    openSideBar,
    deleteNode,
    cloneCalculation,
    checkIfTemplateCalculationIdInUse,
    refreshNextId
}: CalculationItemProps) {
    const [name, setName] = useState<string>(node.name);
    const [type, setType] = useState<CalculationType>(node.type);
    const [allowedEnumTypeValues, setAllowedEnumTypeValues] = useState<string>(node.allowedEnumTypeValues || "");
    const [numerator, setNumerator] = useState<number>(node.groupRate ? node.groupRate.numerator : 0);
    const [denominator, setDenominator] = useState<number>(node.groupRate ? node.groupRate.denominator : 0);
    const [calculationA, setCalculationA] = useState<number>(node.percentageChangeBetweenAandB ? node.percentageChangeBetweenAandB.calculationA : 0);
    const [calculationB, setCalculationB] = useState<number>(node.percentageChangeBetweenAandB ? node.percentageChangeBetweenAandB.calculationB : 0);
    const [calculationAggregationType, setcalculationAggregationType] = useState<CalculationAggregationType>(node.percentageChangeBetweenAandB ? node.percentageChangeBetweenAandB.calculationAggregationType : CalculationAggregationType.Sum);
    const [formulaText, setFormulaText] = useState<string>(node.formulaText);
    const [valueFormat, setValueFormat] = useState<ValueFormatType>(node.valueFormat);
    const [aggregationType, setAggregationType] = useState<AggregrationType>(node.aggregationType);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [cloneId, setCloneId] = useState<string>('');
    const [saved, setSaved] = useState<boolean>(false);
    const [templateCalculationId, setTemplateCalculationId] = useState<string>(node.templateCalculationId.toString());

    const isClone = node.id.includes(":");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = CalculationType[e.target.value as keyof typeof CalculationType];

        switch (newType) {
            case CalculationType.Boolean:
                setValueFormat(ValueFormatType.Boolean);
                break;
            case CalculationType.Enum:
                setValueFormat(ValueFormatType.String);
                setAggregationType(AggregrationType.None);
                break;
            case CalculationType.Cash:
                setValueFormat(ValueFormatType.Currency);
                break;
        }

        setType(newType);
    }

    const handleFormulaTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormulaText(e.target.value);
    }

    const handleValueFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValueFormat(ValueFormatType[e.target.value as keyof typeof ValueFormatType]);
    }

    const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAggregationType(AggregrationType[e.target.value as keyof typeof AggregrationType]);
    }

    const handleNumeratorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNumerator(parseInt(e.target.value, 10));
    }

    const handleDenominatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDenominator(parseInt(e.target.value, 10));
    }

    const handleCalculationAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCalculationA(parseInt(e.target.value, 10));
    }

    const handleCalculationBChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCalculationB(parseInt(e.target.value, 10));
    }

    const handleCalculationAggregationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setcalculationAggregationType(CalculationAggregationType[e.target.value as keyof typeof CalculationAggregationType]);
    }

    const handleAddAllowedEnumTypeValue = (newValue: string) => {
        isAllowedEnumTypeValuesEmpty ?
            setAllowedEnumTypeValues(newValue) :
            setAllowedEnumTypeValues(allowedEnumTypeValues.concat(",", newValue));
    }

    const handleRemoveAllowedEnumTypeValue = (valueToRemove: string) => {
        const values: string[] | undefined = getStringArray(allowedEnumTypeValues);
        if (!values || values.length === 0) return;
        const indexOfValueToRemove = values.findIndex(s => s === valueToRemove);
        values.splice(indexOfValueToRemove, 1);
        const newValue = stringArrayToString(values);
        newValue ? setAllowedEnumTypeValues(newValue) : setAllowedEnumTypeValues("");
    }

    const handleCloneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCloneId(e.target.value);
    }

    const handleTemplateCalculationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setTemplateCalculationId(e.target.value);
        }
    }

    const handleDelete = () => {
        setConfirmDelete(true);
    }

    const handleCancelDelete = () => {
        setConfirmDelete(false);
    }

    const handleConfirmDelete = async () => {
        await deleteNode(node.id);
        openSideBar(false);
    }

    const handleCloneClick = async () => {
        if (cloneId.length === 0) {
            return;
        }
        await cloneCalculation(node.id, cloneId);
        openSideBar(false);
    }

    const handleSubmit = async () => {
        setSaved(true);
        if (!isFormValid()) return;

        const groupRate: GroupRate = {
            numerator: numerator,
            denominator: denominator
        };

        const percentageChangeBetweenAandB: PercentageChangeBetweenAandB = {
            calculationA: calculationA,
            calculationB: calculationB,
            calculationAggregationType: calculationAggregationType
        };

        const updatedNode: CalculationUpdateModel = {
            id: node.id,
            kind: node.kind,
            name: name,
            templateCalculationId: parseInt(templateCalculationId, 10),
            type: type,
            formulaText: formulaText,
            valueFormat: valueFormat,
            aggregationType: aggregationType,
            allowedEnumTypeValues: type !== CalculationType.Enum ? undefined : allowedEnumTypeValues,
            groupRate: aggregationType !== AggregrationType.GroupRate ? undefined : groupRate,
            percentageChangeBetweenAandB: aggregationType !== AggregrationType.PercentageChangeBetweenAandB ? undefined : percentageChangeBetweenAandB
        };

        await updateNode(updatedNode);
        refreshNextId();
        openSideBar(false);
    }

    const handleCancel = () => {
        openSideBar(false);
    }

    const renderValueFormatOptions = (): JSX.Element => {
        if (type === CalculationType.Boolean) {
            return <option value={ValueFormatType.Boolean}>Boolean</option>
        }
        if (type === CalculationType.Enum) {
            return <option value={ValueFormatType.String}>String</option>
        }
        if (type === CalculationType.Cash) {
            return <option value={ValueFormatType.Currency}>Currency</option>
        }

        return (
            <>
                <option value={ValueFormatType.Number}>Number</option>
                <option value={ValueFormatType.Percentage}>Percentage</option>
                <option value={ValueFormatType.Currency}>Currency</option>
            </>
        );
    }

    const isAllowedEnumTypeValuesEmpty = allowedEnumTypeValues.trim().length === 0;
    const isNameValid = name.length > 0;
    const isGroupRateValid = aggregationType !== AggregrationType.GroupRate ||
        (aggregationType === AggregrationType.GroupRate && numerator !== 0 && denominator !== 0);
    const isPecentageChangeBetweenAandBValid = aggregationType !== AggregrationType.PercentageChangeBetweenAandB ||
        (aggregationType === AggregrationType.PercentageChangeBetweenAandB && calculationA !== 0 && calculationB !== 0);

    const newTemplateCalculationId = parseInt(templateCalculationId, 10);
    const isTemplateCalculationIdValid = node.templateCalculationId === newTemplateCalculationId ||
        (templateCalculationId.trim().length !== 0 && !checkIfTemplateCalculationIdInUse(newTemplateCalculationId));

    const isFormValid = () => {
        const hasValidAllowedEnumTypes = type === CalculationType.Enum && allowedEnumTypeValues.trim().length === 0;
        return (
            isNameValid &&
            !hasValidAllowedEnumTypes &&
            isGroupRateValid &&
            isPecentageChangeBetweenAandBValid &&
            isTemplateCalculationIdValid
        );
    }

    return (
        <>
            <h2 className="govuk-heading-l">Edit Calculation</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div className={`govuk-form-group ${saved && !isNameValid ? "govuk-form-group--error" : ""}`}>
                    <label className="govuk-label" htmlFor="calc-name">Name</label>
                    <span id="calculation-name-hint" className="govuk-hint">The name of the calculation</span>
                    {saved && !isNameValid && <span id="name-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> Name must be not be blank
                    </span>}
                    <input className="govuk-input" id="calc-name" name="calc-name" type="text" value={name} onChange={handleNameChange} />
                </div>
                <div className={`govuk-form-group ${saved && !isTemplateCalculationIdValid ? "govuk-form-group--error" : ""}`}>
                    <label className="govuk-label" htmlFor="calc-template-calculation-id">Calculation ID</label>
                    {saved && !isTemplateCalculationIdValid && <span id="template-calculation-id-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {templateCalculationId.length > 0 ? 'This calculation ID is already in use.' : 'Calculation ID is required.'}
                    </span>}
                    <input className="govuk-input" id="template-calculation-id" name="template-calculation-id" type="text" value={templateCalculationId} onChange={handleTemplateCalculationIdChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-type">Type</label>
                    <select className="govuk-select" id="calc-type" name="calc-type" value={type} onChange={handleTypeChange} >
                        <option value={CalculationType.Cash}>Cash</option>
                        <option value={CalculationType.Rate}>Rate</option>
                        <option value={CalculationType.PupilNumber}>Pupil Number</option>
                        <option value={CalculationType.Number}>Number</option>
                        <option value={CalculationType.Weighting}>Weighting</option>
                        <option value={CalculationType.Boolean}>Boolean</option>
                        <option value={CalculationType.Enum}>Enum</option>
                    </select>
                </div>
                {type === CalculationType.Enum &&
                    <TagEditor
                        allowDuplicates={false}
                        tagValuesCsv={allowedEnumTypeValues}
                        showErrorMessageOnRender={saved && isAllowedEnumTypeValuesEmpty ? "You must add an enum value" : undefined}
                        duplicateErrorMessage={"You cannot add the same enum value twice"}
                        onAddNewValue={handleAddAllowedEnumTypeValue}
                        onRemoveValue={handleRemoveAllowedEnumTypeValue}
                    />
                }
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-formula-text">Formula Text</label>
                    <input className="govuk-input govuk-!-width-two-thirds" id="calc-formula-text" name="calc-formula-text" type="text" value={formulaText} placeholder="Enter formula text" onChange={handleFormulaTextChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-value-format">Value Format</label>
                    <span id="calculation-name-hint" className="govuk-hint">The way the value should show</span>
                    <select className="govuk-select" id="calc-value-format" name="calc-value-format" value={valueFormat} onChange={handleValueFormatChange} >
                        {renderValueFormatOptions()}
                    </select>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-aggregation-type">Aggregation Type</label>
                    <select className="govuk-select" id="calc-aggregation-type" name="calc-aggregation-type" value={aggregationType} onChange={handleAggregationChange} >
                        <option value={AggregrationType.None}>None</option>
                        {type !== CalculationType.Enum &&
                            <>
                                <option value={AggregrationType.Average}>Average</option>
                                <option value={AggregrationType.Sum}>Sum</option>
                                <option value={AggregrationType.GroupRate}>GroupRate</option>
                                <option value={AggregrationType.PercentageChangeBetweenAandB}>PercentageChangeBetweenAandB</option>
                            </>
                        }
                    </select>
                </div>
                {aggregationType === AggregrationType.GroupRate &&
                    <>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="calc-numerator">Numerator</label>
                            <select className="govuk-select" id="calc-numerator" name="calc-numerator" value={numerator} onChange={handleNumeratorChange}>
                                <option value="0">Please select</option>
                                {calcs && calcs
                                    .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                        c.aggregationType === AggregrationType.Sum &&
                                        c.templateCalculationId !== denominator)
                                    .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{`${c.name} (${c.templateCalculationId})`}</option>)}
                            </select>
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="calc-denominator">Denominator</label>
                            <select className="govuk-select" id="calc-denominator" name="calc-denominator" value={denominator} onChange={handleDenominatorChange} >
                                <option value="0">Please select</option>
                                {calcs && calcs
                                    .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                        c.aggregationType === AggregrationType.Sum &&
                                        c.templateCalculationId !== numerator)
                                    .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{`${c.name} (${c.templateCalculationId})`}</option>)}
                            </select>
                        </div>
                    </>
                }
                {aggregationType === AggregrationType.PercentageChangeBetweenAandB &&
                    <>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="calc-calculation-a">Calculation A</label>
                            <select className="govuk-select" id="calc-calculation-a" name="calc-calculation-a" value={calculationA} onChange={handleCalculationAChange} >
                                <option value="">Please select</option>
                                {calcs && calcs
                                    .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                        c.templateCalculationId !== calculationB)
                                    .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="calc-calculation-b">Calculation B</label>
                            <select className="govuk-select" id="calc-calculation-b" name="calc-calculation-b" value={calculationB} onChange={handleCalculationBChange} >
                                <option value="">Please select</option>
                                {calcs && calcs
                                    .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                        c.templateCalculationId !== calculationA)
                                    .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="calc-calculation-aggregation-type">Calculation Aggregation Type</label>
                            <select className="govuk-select" id="calc-calculation-aggregation-type" name="calc-calculation-aggregation-type" value={calculationAggregationType} onChange={handleCalculationAggregationTypeChange} >
                                <option value={CalculationAggregationType.Average}>Average</option>
                                <option value={CalculationAggregationType.Sum}>Sum</option>
                            </select>
                        </div>
                    </>
                }
                <button className="govuk-button" id="save-button" data-module="govuk-button" onClick={handleSubmit}>
                    Save and continue
                </button>
                {
                    !isClone &&
                    <>
                        <div className="govuk-form-group">
                            <select className="govuk-select" id="calc-clones" name="calc-clones" value={cloneId} onChange={handleCloneChange} >
                                <option value=''>Select a calculation</option>
                                {calcs && calcs
                                    .filter(c => c.templateCalculationId !== node.templateCalculationId)
                                    .map(c => <option key={c.templateCalculationId} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button className="govuk-button" data-module="govuk-button" onClick={handleCloneClick} >
                            Clone
                        </button>
                    </>
                }
                <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-warning-text__assistive">Warning</span>
                        Be careful. This will delete all child nodes.
                    </strong>
                </div>
                <div className="govuk-form-group">
                    {!confirmDelete && <button className="govuk-button govuk-button--warning" onClick={handleDelete}>Delete calculation</button>}
                    {confirmDelete && <><button className="govuk-button govuk-button--warning govuk-!-margin-right-1" onClick={handleConfirmDelete} >Confirm delete</button>
                        <button className="govuk-button govuk-button--secondary" onClick={handleCancelDelete} >Cancel</button></>}
                </div>
            </fieldset>
        </>
    );
}