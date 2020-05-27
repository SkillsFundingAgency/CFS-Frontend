import React, { useState } from "react";
import { Calculation, CalculationType, ValueFormatType, CalculationUpdateModel, AggregrationType, GroupRate, PercentageChangeBetweenAandB } from '../types/TemplateBuilderDefinitions';
import "../styles/CalculationItem.scss";

export interface CalculationItemProps {
    node: Calculation,
    updateNode: (p: CalculationUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>
}

export function CalculationItem({ node, updateNode, openSideBar, deleteNode }: CalculationItemProps) {
    const [name, setName] = useState<string>(node.name);
    const [type, setType] = useState<CalculationType>(node.type);
    const [allowedEnumTypeValues, setAllowedEnumTypeValues] = useState<string | undefined>(node.allowedEnumTypeValues);
    const [groupRate, setGroupRate] = useState<GroupRate | undefined>(node.groupRate);
    const [percentageChangeBetweenAandB, setPercentageChangeBetweenAandB] = useState<PercentageChangeBetweenAandB | undefined>(node.percentageChangeBetweenAandB);
    const [formulaText, setFormulaText] = useState<string>(node.formulaText);
    const [valueFormat, setValueFormat] = useState<ValueFormatType>(node.valueFormat);
    const [aggregationType, setAggregationType] = useState<AggregrationType>(node.aggregationType);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(CalculationType[e.target.value as keyof typeof CalculationType]);
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

    const handleAllowedEnumTypeValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllowedEnumTypeValues(e.target.value);
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

    const handleSubmit = () => {
        var updatedNode: CalculationUpdateModel = {
            id: node.id,
            kind: node.kind,
            name: name,
            type: type,
            formulaText: formulaText,
            valueFormat: valueFormat,
            aggregationType: aggregationType,
            allowedEnumTypeValues: type !== CalculationType.Enum ? "" : allowedEnumTypeValues,
            groupRate: groupRate,
            percentageChangeBetweenAandB: percentageChangeBetweenAandB
        };

        updateNode(updatedNode);
        openSideBar(false);
    }

    return (
        <>
            <h2 className="govuk-heading-l">Edit Calculation</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-name">Name</label>
                    <span id="calculation-name-hint" className="govuk-hint">The name of the calculation</span>
                    <input className="govuk-input" id="calc-name" name="calc-name" type="text" value={name} onChange={handleNameChange} />
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
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="calc-enum-values">Allowed Enum Values</label>
                        <span id="calculation-enum-values-hint" className="govuk-hint">E.g. Option 1, Option2, Option3</span>
                        <input className="govuk-input" id="calc-formula-text" name="calc-enum-values" type="text" value={allowedEnumTypeValues ? allowedEnumTypeValues : ""} onChange={handleAllowedEnumTypeValuesChange} />
                    </div>
                }
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-formula-text">Formula Text</label>
                    <input className="govuk-input govuk-!-width-two-thirds" id="calc-formula-text" name="calc-formula-text" type="text" value={formulaText} onChange={handleFormulaTextChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-value-format">Value Format</label>
                    <span id="calculation-name-hint" className="govuk-hint">The way the value should show</span>
                    <select className="govuk-select" id="calc-value-format" name="calc-value-format" value={valueFormat} onChange={handleValueFormatChange} >
                        <option value={ValueFormatType.Number}>Number</option>
                        <option value={ValueFormatType.Percentage}>Percentage</option>
                        <option value={ValueFormatType.Currency}>Currency</option>
                    </select>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="calc-aggregation-type">Aggregation Type</label>
                    <select className="govuk-select" id="calc-aggregation-type" name="calc-aggregation-type" value={aggregationType} onChange={handleAggregationChange} >
                        <option value={AggregrationType.None}>None</option>
                        <option value={AggregrationType.Average}>Average</option>
                        <option value={AggregrationType.Sum}>Sum</option>
                        <option value={AggregrationType.GroupRate}>GroupRate</option>
                        <option value={AggregrationType.PercentageChangeBetweenAandB}>PercentageChangeBetweenAandB</option>
                    </select>
                </div>
                <button className="govuk-button" data-module="govuk-button" onClick={handleSubmit} >
                    Save and continue
                </button>
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