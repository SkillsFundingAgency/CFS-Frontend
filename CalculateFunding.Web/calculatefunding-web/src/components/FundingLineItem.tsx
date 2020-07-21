import React, { useState } from "react";
import { FundingLine, FundingLineType, FundingLineUpdateModel } from '../types/TemplateBuilderDefinitions';
import '../styles/FundingLineItem.scss';

export interface FundingLineItemProps {
    node: FundingLine,
    updateNode: (p: FundingLineUpdateModel) => void,
    openSideBar: (open: boolean) => void,
    deleteNode: (id: string) => Promise<void>
}

export function FundingLineItem({ node, updateNode, openSideBar, deleteNode }: FundingLineItemProps) {
    const [name, setName] = useState<string>(node.name);
    const [type, setType] = useState<FundingLineType>(node.type);
    const [code, setCode] = useState<string | undefined>(node.fundingLineCode);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = FundingLineType[e.target.value as keyof typeof FundingLineType];
        if (newType === FundingLineType.Payment && code === null) {
            setCode('');
        }
        setType(newType);
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
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
        var updatedNode: FundingLineUpdateModel = {
            id: node.id,
            kind: node.kind,
            name: name,
            type: type,
            fundingLineCode: type === FundingLineType.Payment ? code : undefined
        };

        updateNode(updatedNode);
        openSideBar(false);
    }

    const isNameValid = name.length > 0;
    const isFormValid = isNameValid;

    return (
        <div>
            <h2 className="govuk-heading-l">Edit Funding Line</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div className={`govuk-form-group ${isNameValid ? "" : "govuk-form-group--error"}`}>
                    <label className="govuk-label" htmlFor="fl-name">Name</label>
                    <span id="fl-name-hint" className="govuk-hint">The name of the funding line (e.g. 'Total Funding Line')</span>
                    {!isNameValid && <span id="name-error" className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> Name must be not be blank
                    </span>}
                    <input className="govuk-input" id="fl-name" name="fl-name" type="text" value={name} onChange={handleNameChange} />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-type">Type</label>
                    <select className="govuk-select" id="fl-type" name="fl-type" value={type} onChange={handleTypeChange} >
                        <option value={FundingLineType.Payment}>Payment</option>
                        <option value={FundingLineType.Information}>Information</option>
                    </select>
                </div>
                {type === FundingLineType.Payment &&
                    <>
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="fl-code">Funding Line Code</label>
                            <span id="fl-code-hint" className="govuk-hint">The funding line code (e.g. PSG-0001)</span>
                            <input className="govuk-input govuk-!-width-two-thirds" id="fl-code" name="fl-code" type="text" value={code} onChange={handleCodeChange} />
                        </div>
                    </>
                }
                <div className="govuk-form-group">
                    <button className="govuk-button" data-module="govuk-button" onClick={handleSubmit} disabled={!isFormValid}>
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