import React, { useState } from "react";
import { FundingLine, FundingLineType, AggregrationType, FundingLineUpdateModel } from '../types/TemplateBuilderDefinitions';
import '../styles/FundingLineItem.scss';

export interface FundingLineItemProps {
    node: FundingLine,
    updateNode: (p: FundingLineUpdateModel, dsKey: number) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string, isRootNode: boolean, dsKey: number) => Promise<void>,
    dsKey: number,
}

export function FundingLineItem({ node, updateNode, openSideBar, deleteNode, dsKey }: FundingLineItemProps) {
    const [name, setName] = useState<string>(node.name);
    const [type, setType] = useState<FundingLineType>(node.type);
    const [code, setCode] = useState<string>(node.fundingLineCode);
    const [aggregationType, setAggregationType] = useState<AggregrationType | undefined>(node.aggregationType);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(FundingLineType[e.target.value as keyof typeof FundingLineType]);
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
    }

    const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAggregationType(AggregrationType[e.target.value as keyof typeof AggregrationType]);
    }

    const handleDelete = () => {
        setConfirmDelete(true);
    }

    const handleCancelDelete = () => {
        setConfirmDelete(false);
    }

    const handleConfirmDelete = async () => {
        await deleteNode(node.id, node.isRootNode, dsKey);
        openSideBar(false);
    }

    const handleSubmit = () => {
        var updatedNode: FundingLineUpdateModel = {
            id: node.id,
            name: name,
            type: type,
            fundingLineCode: code,
            aggregationType: aggregationType
        };

        updateNode(updatedNode, dsKey);
        openSideBar(false);
    }

    return (
        <div>
            <h2 className="govuk-heading-l">Edit Funding Line</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-name">Name</label>
                    <span id="fl-name-hint" className="govuk-hint">The name of the funding line (e.g. 'Total Funding Line')</span>
                    <input className="govuk-input" id="fl-name" name="fl-name" type="text" value={name} onChange={handleNameChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-type">Type</label>
                    <select className="govuk-select" id="fl-type" name="fl-type" value={type} onChange={handleTypeChange} >
                        <option value={FundingLineType.Payment}>Payment</option>
                        <option value={FundingLineType.Information}>Information</option>
                    </select>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-code">Funding Line Code</label>
                    <span id="fl-code-hint" className="govuk-hint">The funding line code (e.g. PSG-0001)</span>
                    <input className="govuk-input govuk-!-width-two-thirds" id="fl-code" name="fl-code" type="text" value={code} onChange={handleCodeChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-aggregation-type">Aggregation Type</label>
                    <select className="govuk-select" id="fl-aggregation-type" name="fl-aggregation-type" value={aggregationType} onChange={handleAggregationChange} >
                        <option value={AggregrationType.None}>None</option>
                        <option value={AggregrationType.Sum}>Sum</option>
                        <option value={AggregrationType.Average}>Average</option>
                    </select>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-templateline-id">Template Line Id</label>
                    <input className="govuk-input govuk-input--width-2" id="fl-templateline-id" name="fl-templateline-id" disabled={true} type="text" value={node.templateLineId} />
                </div>
                <div className="govuk-form-group">
                    <button className="govuk-button" data-module="govuk-button" onClick={handleSubmit} >
                        Save and continue
                </button>
                </div>
                <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-warning-text__assistive">Warning</span>
                        Be careful. This will delete all child nodes.
                    </strong>
                </div>
                <div className="govuk-form-group">
                    {!confirmDelete && <button className="govuk-button govuk-button--warning" onClick={handleDelete} data-testid={`node-${node.id}-delete`}>Delete funding line</button>}
                    {confirmDelete && <><button className="govuk-button govuk-button--warning govuk-!-margin-right-1" onClick={handleConfirmDelete} data-testid={`node-${node.id}-confirm-delete`}>Confirm delete</button>
                        <button className="govuk-button govuk-button--secondary" onClick={handleCancelDelete} >Cancel</button></>}
                </div>
            </fieldset>
        </div>
    );
}