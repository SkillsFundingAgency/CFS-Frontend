import React, {useState} from "react";
import {
    Calculation,
    CalculationType,
    ValueFormatType,
    CalculationUpdateModel,
    AggregrationType,
    GroupRate,
    PercentageChangeBetweenAandB,
    CalculationAggregationType,
    CalculationDictionaryItem
} from '../../types/TemplateBuilderDefinitions';
import {TagEditor} from "../TagEditor";
import "../../styles/CalculationItem.scss";
import {getStringArray, stringArrayToString} from "../../services/templateBuilderDatasourceService";
import {ErrorMessage} from "../../types/ErrorMessage";

export interface CalculationItemProps {
    node: Calculation,
    calcs: CalculationDictionaryItem[],
    updateNode?: (p: CalculationUpdateModel) => void,
    isEditMode: boolean,
    openSideBar: (open: boolean) => void,
    deleteNode?: (id: string) => Promise<void>,
    cloneCalculation?: (targetCalculationId: string, sourceCalculationId: string) => void,
    refreshNextId?: () => void,
    allowDelete?: boolean,
}

export function CalculationItem({
    node,
    calcs,
    updateNode,
    isEditMode,
    openSideBar,
    deleteNode,
    cloneCalculation,
    refreshNextId,
    allowDelete,
}: CalculationItemProps) {
    const [name, setName] = useState<string>(node.name);
    const [type, setType] = useState<CalculationType>(node.type);
    const [allowedEnumTypeValues, setAllowedEnumTypeValues] = useState<string>(node.allowedEnumTypeValues || "");
    const [numerator, setNumerator] = useState<number>(node.groupRate ? node.groupRate.numerator : 0);
    const [denominator, setDenominator] = useState<number>(node.groupRate ? node.groupRate.denominator : 0);
    const [calculationA, setCalculationA] = useState<number>(node.percentageChangeBetweenAandB ? node.percentageChangeBetweenAandB.calculationA : 0);
    const [calculationB, setCalculationB] = useState<number>(node.percentageChangeBetweenAandB ? node.percentageChangeBetweenAandB.calculationB : 0);
    const [calculationAggregationType, setcalculationAggregationType] = useState<CalculationAggregationType>(
        node.percentageChangeBetweenAandB ?
            node.percentageChangeBetweenAandB.calculationAggregationType :
            CalculationAggregationType.Sum);
    const [formulaText, setFormulaText] = useState<string>(node.formulaText);
    const [valueFormat, setValueFormat] = useState<ValueFormatType>(node.valueFormat);
    const [aggregationType, setAggregationType] = useState<AggregrationType>(node.aggregationType);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [cloneId, setCloneId] = useState<string>('');
    const [saved, setSaved] = useState<boolean>(false);
    const [calculationId, setTemplateCalculationId] = useState<string>(node.templateCalculationId.toString());
    const [errors, setErrors] = useState<ErrorMessage[]>([]);

    const isClone = node.id.includes(":");

    function IsSameAsInitialName(name: string) {
        return node.name === name;
    }

    const validateName = (name: string) => {
        const fieldName = "calculation-name";
        clearErrorMessages(fieldName);
        let isValid = true;

        if (IsSameAsInitialName(name)) {
            return true;
        }
        const nameTrimmed = name.trim();

        if (nameTrimmed.length === 0) {
            addErrorMessage("Name must be not be blank", fieldName);
            isValid = false;
        } else if (calcs.some(calc => calc.name.trim() === nameTrimmed)) {
            addErrorMessage("This name is already in use by another calculation", fieldName);
            isValid = false;
        }
        return isValid;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        validateName(newName);
    };

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
            case CalculationType.Number:
                setValueFormat(ValueFormatType.Number);
                break;
            case CalculationType.PupilNumber:
                setValueFormat(ValueFormatType.Number);
                break;
            default:
                setValueFormat(ValueFormatType[e.target.value as keyof typeof ValueFormatType]);
                break;
        }

        setType(newType);
    };

    const handleFormulaTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormulaText(e.target.value);
    };

    const handleValueFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValueFormat(ValueFormatType[e.target.value as keyof typeof ValueFormatType]);
    };

    const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAggregationType(AggregrationType[e.target.value as keyof typeof AggregrationType]);
    };

    const handleNumeratorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value);
        if (validateGroupRateNumerator(newValue)) {
            setNumerator(newValue);
        }
    };

    const handleDenominatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value);
        if (validateGroupRateDenominator(newValue)) {
            setDenominator(newValue);
        }
    };

    const handleCalculationAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const calcA = parseInt(e.target.value, 10);
        setCalculationA(calcA);
        validatePercentageChangeCalculationA(calcA);
    };

    const handleCalculationBChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const calcB = parseInt(e.target.value, 10);
        setCalculationB(calcB);
        validatePercentageChangeCalculationB(calcB);
    };

    const handleCalculationAggregationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setcalculationAggregationType(CalculationAggregationType[e.target.value as keyof typeof CalculationAggregationType]);
    };

    const handleAddAllowedEnumTypeValue = (newValue: string) => {
        validateAllowedEnumTypeValues(newValue);
        if (newValue.length > 0) {
            allowedEnumTypeValues.length > 0 ?
                setAllowedEnumTypeValues(allowedEnumTypeValues.concat(",", newValue)) :
                setAllowedEnumTypeValues(newValue);
        }
    };

    const handleRemoveAllowedEnumTypeValue = (valueToRemove: string) => {
        const values: string[] | undefined = getStringArray(allowedEnumTypeValues);
        if (!values || values.length === 0) return;
        const indexOfValueToRemove = values.findIndex(s => s === valueToRemove);
        values.splice(indexOfValueToRemove, 1);
        const newValue = stringArrayToString(values);
        newValue ? setAllowedEnumTypeValues(newValue) : setAllowedEnumTypeValues("");
    };

    const handleCloneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCloneId(e.target.value);
    };

    function IsSameAsInitialId(calculationId: string) {
        return node.templateCalculationId.toString() === calculationId;
    }

    const validateCalculationId = (id: string) => {
        const fieldName = "calculation-id";
        clearErrorMessages(fieldName);
        let isValid = true;

        if (IsSameAsInitialId(id)) {
            return true;
        }

        if (id.trim().length === 0) {
            addErrorMessage("Calculation ID must not be blank", fieldName);
            isValid = false;
        } else {
            const regExp = /^[0-9\b]+$/;
            if (!regExp.test(id)) {
                addErrorMessage('This calculation ID is invalid. Use a number.', fieldName)
                isValid = false;
            } else {
                const newIdAsNumber = parseInt(id, 10);
                if (calcs.some(calc => calc.templateCalculationId === newIdAsNumber)) {
                    addErrorMessage('This calculation ID is already in use.', fieldName)
                    isValid = false;
                }
            }
        }
        return isValid;
    };

    const handleTemplateCalculationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrorMessages();
        const newId = e.target.value.trim();
        setTemplateCalculationId(newId);
        validateCalculationId(newId)
    };

    const handleDelete = () => {
        setConfirmDelete(true);
    };

    const handleCancelDelete = () => {
        setConfirmDelete(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteNode) {
            return;
        }
        await deleteNode(node.id);
        openSideBar(false);
    };

    const handleCloneClick = async () => {
        if (!cloneCalculation || cloneId.length === 0) {
            return;
        }
        await cloneCalculation(node.id, cloneId);
        openSideBar(false);
    };

    const getGroupRate = () => {
        return {
            numerator: numerator,
            denominator: denominator
        } as GroupRate;
    };

    const getPercentageChange = () => {
        return {
            calculationA: calculationA,
            calculationB: calculationB,
            calculationAggregationType: calculationAggregationType
        } as PercentageChangeBetweenAandB;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !updateNode || !refreshNextId) return;

        setSaved(true);

        const updatedNode: CalculationUpdateModel = {
            id: node.id,
            kind: node.kind,
            name: name,
            templateCalculationId: parseInt(calculationId, 10),
            type: type,
            formulaText: formulaText,
            valueFormat: valueFormat,
            aggregationType: aggregationType,
            allowedEnumTypeValues: type !== CalculationType.Enum ? undefined : allowedEnumTypeValues,
            groupRate: aggregationType !== AggregrationType.GroupRate ? undefined : getGroupRate(),
            percentageChangeBetweenAandB:
                aggregationType !== AggregrationType.PercentageChangeBetweenAandB ? undefined : getPercentageChange()
        };

        await updateNode(updatedNode);
        refreshNextId();
        openSideBar(false);
    };

    const handleCancel = () => {
        openSideBar(false);
    };

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
        if (type === CalculationType.Rate) {
            return <>
                <option value="">Please select</option>
                <option value={ValueFormatType.Percentage}>Percentage</option>
                <option value={ValueFormatType.Currency}>Currency</option>
            </>
        }
        if (type === CalculationType.Weighting) {
            return <>
                <option value="">Please select</option>
                <option value={ValueFormatType.Number}>Number</option>
                <option value={ValueFormatType.Percentage}>Percentage</option>
            </>
        }
        if (type === CalculationType.Number || type === CalculationType.PupilNumber) {
            return <option value={ValueFormatType.Number}>Number</option>
        }

        return (
            <>
                <option value="">Please select</option>
                <option value={ValueFormatType.Number}>Number</option>
                <option value={ValueFormatType.Percentage}>Percentage</option>
                <option value={ValueFormatType.Currency}>Currency</option>
            </>
        );
    };

    function addErrorMessage(errorMessage: string, fieldName: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages(fieldName?: string) {
        if (errors.length > 0) {
            if (fieldName === undefined) {
                setErrors([]);
            } else if (errors.some(e => e.fieldName === fieldName)) {
                setErrors(errors.filter(e => e.fieldName !== fieldName))
            }
        }
    }

    const validateAllowedEnumTypeValues = (values: string) => {
        const fieldName = "calculation-allowed-enum-values";
        clearErrorMessages(fieldName);

        if (type === CalculationType.Enum && values.trim().length === 0) {
            addErrorMessage("Allowed enum values must not be blank", fieldName);
            return false;
        }
        return true;
    };

    const validateGroupRateNumerator = (numerator: number) => {
        const fieldName = "group-rate-numerator";
        clearErrorMessages(fieldName);

        if (aggregationType === AggregrationType.GroupRate && numerator === 0) {
            addErrorMessage("Group rate numerator must not be blank", fieldName);
            return false;
        }
        return true;
    };

    const validateGroupRateDenominator = (denominator: number) => {
        const fieldName = "group-rate-denominator";
        clearErrorMessages(fieldName);

        if (aggregationType === AggregrationType.GroupRate && denominator === 0) {
            addErrorMessage("Group rate denominator must not be blank", fieldName);
            return false;
        }
        return true;
    };

    const validatePercentageChangeCalculationA = (calcA: number) => {
        const fieldName = "percentage-change-calculation-a";
        clearErrorMessages(fieldName);

        if (aggregationType === AggregrationType.PercentageChangeBetweenAandB && calcA === 0) {
            addErrorMessage("Percentage change calculation A must not be blank", fieldName);
            return false;
        }
        return true;
    };

    const validatePercentageChangeCalculationB = (calcB: number) => {
        const fieldName = "percentage-change-calculation-b";
        clearErrorMessages(fieldName);

        if (aggregationType === AggregrationType.PercentageChangeBetweenAandB && calcB === 0) {
            addErrorMessage("Percentage change calculation B must not be blank", fieldName);
            return false;
        }
        return true;
    };

    const validateValueFormat = (value: ValueFormatType) => {
        const fieldName = "calculation-value-format";
        clearErrorMessages(fieldName);

        if (value.length === 0) {
            addErrorMessage("Please select a value format", fieldName);
            return false;
        }

        return true;
    }

    const validateForm = () => {
        clearErrorMessages();
        const isValidCalc = validateCalculationId(calculationId);
        const isValidName = validateName(name);
        const isValidEnums = validateAllowedEnumTypeValues(allowedEnumTypeValues);
        const isValidNumerator = validateGroupRateNumerator(numerator);
        const isValidDenominator = validateGroupRateDenominator(denominator);
        const isValidCalculationA = validatePercentageChangeCalculationA(calculationA);
        const isValidCalculationB = validatePercentageChangeCalculationB(calculationB);
        const isValidEnumTypeValues = validateAllowedEnumTypeValues(allowedEnumTypeValues);
        const isValidValueFormat = validateValueFormat(valueFormat);

        return isValidEnumTypeValues && isValidCalc && isValidName && isValidEnums &&
            isValidNumerator && isValidDenominator && isValidCalculationA && isValidCalculationB && isValidValueFormat;
    };

    const enumValuesError = () => {
        const error = errors.find(err => err.fieldName == "calculation-allowed-enum-values");
        if (error === undefined) {
            return undefined;
        }
        return error.message;
    }

    return (
        <div data-testid='sidebar-fundingcalc'>
            <h2 className="govuk-heading-l">{isEditMode ? "Edit" : ""} Calculation</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div className={`govuk-form-group ${errors.filter(e =>
                    e.fieldName === "calculation-name").length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label className="govuk-label" htmlFor="calculation-name">Name</label>
                    {isEditMode ?
                        <>
                            {errors.filter(e => e.fieldName === "calculation-name").length === 0 ?
                                <span id="calculation-name-hint" className="govuk-hint">The name of the calculation</span>
                                : errors.map(error => error.fieldName === "calculation-name" &&
                                    <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                        <span className="govuk-visually-hidden">Error:</span> {error.message}
                                    </span>
                                )}
                            <input className="govuk-input" id="calculation-name" name="calculation-name" type="text" value={name}
                                onChange={handleNameChange} />
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calc-name" className="govuk-hint">{name}</span>
                        </div>
                    }
                </div>
                <div className={`govuk-form-group ${errors.filter(e =>
                    e.fieldName === "calculation-id").length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label className="govuk-label" htmlFor="calculation-id">Calculation ID</label>
                    {isEditMode ?
                        <>
                            {errors.map(error => error.fieldName === "calculation-id" &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            )}
                            <input className="govuk-input" id="calculation-id" name="calculation-id" type="text"
                                value={calculationId} onChange={handleTemplateCalculationIdChange} />
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calculation-id" className="govuk-hint">{calculationId}</span>
                        </div>
                    }
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calculation-type">Type</label>
                    {isEditMode ?
                        <>
                            <select className="govuk-select" id="calculation-type" name="calculation-type" value={type} onChange={handleTypeChange}>
                                <option value={CalculationType.Cash}>Cash</option>
                                <option value={CalculationType.Rate}>Rate</option>
                                <option value={CalculationType.PupilNumber}>Pupil Number</option>
                                <option value={CalculationType.Number}>Number</option>
                                <option value={CalculationType.Weighting}>Weighting</option>
                                <option value={CalculationType.Boolean}>Boolean</option>
                                <option value={CalculationType.Enum}>Enum</option>
                            </select>
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calculation-type" className="govuk-hint">{type}</span>
                        </div>
                    }
                </div>
                {type === CalculationType.Enum &&
                    <>
                        {isEditMode ?
                            <TagEditor
                                allowDuplicates={false}
                                tagValuesCsv={allowedEnumTypeValues}
                                label={"Allowed enum values"}
                                showErrorMessageOnRender={enumValuesError()}
                                duplicateErrorMessage={"You cannot add the same enum value twice"}
                                onAddNewValue={handleAddAllowedEnumTypeValue}
                                onRemoveValue={handleRemoveAllowedEnumTypeValue}
                            />
                            :
                            <div className="govuk-form-group govuk-!-margin-bottom-6">
                                <label className="govuk-label" htmlFor="add-tag" aria-labelledby="add-tag">Allowed enum values</label>
                                <span id="calculation-allowed-enum-values" className="govuk-hint">{allowedEnumTypeValues}</span>
                            </div>
                        }
                    </>
                }
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calculation-formula-text">Formula Text</label>
                    {isEditMode ?
                        <>
                            <input className="govuk-input govuk-!-width-two-thirds" id="calculation-formula-text" name="calculation-formula-text"
                                type="text"
                                value={formulaText} placeholder="Enter formula text" onChange={handleFormulaTextChange} />
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calculation-formula-text" className="govuk-hint">{formulaText}</span>
                        </div>
                    }
                </div>
                <div className={`govuk-form-group ${errors.filter(e =>
                    e.fieldName === "calculation-value-format").length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label className="govuk-label" htmlFor="calculation-value-format">Value Format</label>
                    {isEditMode ?
                        <>
                            {errors.map(error => error.fieldName === "calculation-value-format" &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            )}
                            <span id="calculation-value-format-hint" className="govuk-hint">The way the value should show</span>
                            <select className="govuk-select" id="calculation-value-format" name="calculation-value-format" value={valueFormat}
                                onChange={handleValueFormatChange}>
                                {renderValueFormatOptions()}
                            </select>
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calculation-value-format" className="govuk-hint">{valueFormat}</span>
                        </div>
                    }
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calculation-aggregation-type">Aggregation Type</label>
                    {isEditMode ?
                        <>
                            <select className="govuk-select"
                                id="calculation-aggregation-type"
                                name="calculation-aggregation-type"
                                value={aggregationType}
                                onChange={handleAggregationChange}>
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
                        </>
                        :
                        <div className="govuk-form-group govuk-!-margin-bottom-6">
                            <span id="calculation-aggregation-type" className="govuk-hint">{aggregationType}</span>
                        </div>
                    }
                </div>
                {aggregationType === AggregrationType.GroupRate &&
                    <>
                        <div className={`govuk-form-group ${errors.filter(e =>
                            e.fieldName === "group-rate-numerator").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="group-rate-numerator">Numerator</label>
                            {isEditMode ?
                                <>
                                    {errors.map(error => error.fieldName === "group-rate-numerator" &&
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                                    )}
                                    <select className="govuk-select" id="group-rate-numerator" name="group-rate-numerator" value={numerator}
                                        onChange={handleNumeratorChange}>
                                        <option value="0">Please select</option>
                                        {calcs && calcs
                                            .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                                c.aggregationType === AggregrationType.Sum &&
                                                c.templateCalculationId !== denominator)
                                            .map(c => <option key={c.templateCalculationId}
                                                value={c.templateCalculationId}>{`${c.name} (${c.templateCalculationId})`}</option>)}
                                    </select>
                                </>
                                :
                                <div className="govuk-form-group govuk-!-margin-bottom-6">
                                    <span id="group-rate-numerator" className="govuk-hint">{numerator}</span>
                                </div>
                            }
                        </div>
                        <div className={`govuk-form-group ${errors.filter(e =>
                            e.fieldName === "group-rate-denominator").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="group-rate-denominator">Denominator</label>
                            {isEditMode ?
                                <>
                                    {errors.map(error => error.fieldName === "group-rate-denominator" &&
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                                    )}
                                    <select className="govuk-select" id="group-rate-denominator" name="group-rate-denominator" value={denominator}
                                        onChange={handleDenominatorChange}>
                                        <option value="0">Please select</option>
                                        {calcs && calcs
                                            .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                                c.aggregationType === AggregrationType.Sum &&
                                                c.templateCalculationId !== numerator)
                                            .map(c => <option key={c.templateCalculationId}
                                                value={c.templateCalculationId}>{`${c.name} (${c.templateCalculationId})`}</option>)}
                                    </select>
                                </>
                                :
                                <div className="govuk-form-group govuk-!-margin-bottom-6">
                                    <span id="group-rate-denominator" className="govuk-hint">{denominator}</span>
                                </div>
                            }
                        </div>
                    </>
                }
                {aggregationType === AggregrationType.PercentageChangeBetweenAandB &&
                    <>
                        <div className={`govuk-form-group ${errors.filter(e =>
                            e.fieldName === "percentage-change-calculation-a").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="percentage-change-calculation-a">Calculation A</label>
                            {isEditMode ?
                                <>
                                    {errors.map(error => error.fieldName === "percentage-change-calculation-a" &&
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                                    )}
                                    <select className="govuk-select"
                                        id="percentage-change-calculation-a"
                                        value={calculationA}
                                        onChange={handleCalculationAChange}>
                                        <option value="">Please select</option>
                                        {calcs && calcs
                                            .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                                c.templateCalculationId !== calculationB)
                                            .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{c.name}</option>)}
                                    </select>
                                </>
                                :
                                <div className="govuk-form-group govuk-!-margin-bottom-6">
                                    <span id="percentage-change-calculation-a" className="govuk-hint">{calculationA}</span>
                                </div>
                            }
                        </div>
                        <div className={`govuk-form-group ${errors.filter(e =>
                            e.fieldName === "percentage-change-calculation-b").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="percentage-change-calculation-b">Calculation B</label>
                            {isEditMode ?
                                <>
                                    {errors.map(error => error.fieldName === "percentage-change-calculation-b" &&
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                                    )}
                                    <select className="govuk-select"
                                        id="percentage-change-calculation-b"
                                        value={calculationB}
                                        onChange={handleCalculationBChange}>
                                        <option value="">Please select</option>
                                        {calcs && calcs
                                            .filter(c => c.templateCalculationId !== node.templateCalculationId &&
                                                c.templateCalculationId !== calculationA)
                                            .map(c => <option key={c.templateCalculationId} value={c.templateCalculationId}>{c.name}</option>)}
                                    </select>
                                </>
                                :
                                <div className="govuk-form-group govuk-!-margin-bottom-6">
                                    <span id="percentage-change-calculation-b" className="govuk-hint">{calculationB}</span>
                                </div>
                            }
                        </div>
                        <div className={`govuk-form-group ${errors.filter(e =>
                            e.fieldName === "percentage-change-calculation-aggregation-type").length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="percentage-change-calculation-aggregation-type">Calculation Aggregation Type</label>
                            {isEditMode ?
                                <>
                                    {errors.map(error => error.fieldName === "percentage-change-calculation-aggregation-type" &&
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                                        </span>
                                    )}
                                    <select className="govuk-select"
                                        id="percentage-change-calculation-aggregation-type"
                                        value={calculationAggregationType} onChange={handleCalculationAggregationTypeChange}>
                                        <option value={CalculationAggregationType.Average}>Average</option>
                                        <option value={CalculationAggregationType.Sum}>Sum</option>
                                    </select>
                                </>
                                :
                                <div className="govuk-form-group govuk-!-margin-bottom-6">
                                    <span id="percentage-change-calculation-aggregation-type" className="govuk-hint">{calculationAggregationType}</span>
                                </div>
                            }
                        </div>
                    </>
                }
                {isEditMode ?
                    <>
                        <button className="govuk-button" id="save-button" data-module="govuk-button" onClick={handleSubmit}>
                            Save and continue
                        </button>
                        {!isClone &&
                            <>
                                <div className="govuk-form-group">
                                    <select className="govuk-select" id="calc-clones" name="calc-clones" value={cloneId} onChange={handleCloneChange}>
                                        <option value=''>Select a calculation</option>
                                        {calcs && calcs
                                            .filter(c => c.templateCalculationId !== node.templateCalculationId)
                                            .map(c => <option key={c.templateCalculationId} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button className="govuk-button" data-module="govuk-button" onClick={handleCloneClick}>
                                    Clone
                            </button>
                            </>}
                        {allowDelete &&
                            <>
                                <div className="govuk-warning-text">
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        {isClone ? 'NB: This will delete this clone instance only.' : 'Be careful. This will delete all child nodes and clones.'}
                                    </strong>
                                </div>
                                <div className="govuk-form-group">
                                    {!confirmDelete &&
                                        <button className="govuk-button govuk-button--warning" onClick={handleDelete} data-testid="delete-button">
                                            Delete calculation
                                        </button>}
                                    {confirmDelete &&
                                        <>
                                            <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" onClick={handleConfirmDelete}>Confirm
                                            delete
                                    </button>
                                            <button className="govuk-button govuk-button--secondary" onClick={handleCancelDelete}>Cancel</button>
                                        </>}
                                </div>
                            </>}
                    </>
                    :
                    <button className="govuk-button" onClick={handleCancel}>Close</button>
                }
            </fieldset>
        </div>
    );
}