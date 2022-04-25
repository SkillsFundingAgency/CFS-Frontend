import "../../styles/FundingLineItem.scss";

import React, { useState } from "react";

import { ErrorMessage } from "../../types/ErrorMessage";
import { FundingLine, FundingLineType, FundingLineUpdateModel } from "../../types/TemplateBuilderDefinitions";

export interface FundingLineItemProps {
    node: FundingLine;
    updateNode?: (p: FundingLineUpdateModel) => void;
    isEditMode: boolean;
    openSideBar: (open: boolean) => void;
    deleteNode?: (id: string) => Promise<void>;
    isTemplateLineIdInUse?: (templateLineId: number) => boolean;
    isFundingLineNameInUse?: (name: string) => boolean;
    refreshNextId?: () => void;
    allowDelete?: boolean;
}

export function FundingLineItem({
                                    node,
                                    updateNode,
                                    isEditMode,
                                    openSideBar,
                                    deleteNode,
                                    isTemplateLineIdInUse,
                                    isFundingLineNameInUse,
                                    refreshNextId,
                                    allowDelete,
                                }: FundingLineItemProps) {
    const [fundingLineName, setFundingLineName] = useState<string>(node.name);
    const [fundingLineType, setFundingLineType] = useState<FundingLineType>(node.type);
    const [fundingLineCode, setFundingLineCode] = useState<string | undefined>(node.fundingLineCode);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [fundingLineId, setFundingLineId] = useState<string>(node.templateLineId.toString());
    const [errors, setErrors] = useState<ErrorMessage[]>([]);

    const isClone = node.id.includes(":");

    function IsSameAsInitialName(name: string) {
        return node.name === name;
    }

    const validateName = (name: string, newType?:string) => {
        if (!isFundingLineNameInUse) {
            return;
        }
        const fieldName = "fl-name";
        clearErrorMessages(fieldName);

        if (IsSameAsInitialName(name)) {
            return;
        }
        const nameTrimmed = name.trim();

        if (nameTrimmed.length === 0) {
            addErrorMessage("Name must not be blank", fieldName);
        }

        if (nameTrimmed.length > 100 && (newType === FundingLineType.Payment || (fundingLineType === FundingLineType.Payment && newType === undefined))) {
            addErrorMessage("Funding line name may not exceed 100 characters in length for payment type lines", fieldName);
            return;
        }

        if (isFundingLineNameInUse(nameTrimmed)) {
            addErrorMessage("This name is already in use by another Funding Line", fieldName);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        validateName(newName);
        setFundingLineName(newName);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        clearErrorMessages("fl-code");
        const newType = FundingLineType[e.target.value as keyof typeof FundingLineType];
        if (newType === FundingLineType.Payment && fundingLineCode === null) {
            setFundingLineCode("");
        }
        setFundingLineType(newType);
        validateCode(fundingLineCode, newType);
        validateName(fundingLineName, newType);
    };

    const handleFundingLineCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCode = e.target.value;
        setFundingLineCode(newCode);
        validateCode(newCode, fundingLineType);
    };

    const validateCode = (code: string | undefined, type: string) => {
        const fieldName = "fl-code";
        clearErrorMessages(fieldName);

        if (type === FundingLineType.Payment && (!code || code.trim().length === 0)) {
            addErrorMessage("Code must be not be blank for Payment type funding lines", fieldName);
        }
    };

    function IsSameAsInitialId(fundingLineId: string) {
        return node.templateLineId.toString() === fundingLineId;
    }

    const validateFundingLineId = (id: string) => {
        const fieldName = "funding-line-id";
        clearErrorMessages(fieldName);

        if (IsSameAsInitialId(id) || !isTemplateLineIdInUse) {
            return;
        }

        if (id.trim().length === 0) {
            addErrorMessage("Funding Line ID must not be blank", fieldName);
        } else {
            const regExp = /^[0-9\b]+$/;
            if (!regExp.test(id)) {
                addErrorMessage("This Funding Line ID is invalid. Use a number.", fieldName);
            } else {
                const newIdAsNumber = parseInt(id, 10);
                if (isTemplateLineIdInUse(newIdAsNumber)) {
                    addErrorMessage("This Funding Line ID is already in use.", fieldName);
                }
            }
        }
    };

    const handleFundingLineIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrorMessages();
        const newFundingLineId = e.target.value.trim();
        setFundingLineId(newFundingLineId);
        validateFundingLineId(newFundingLineId);
    };

    const handleCancel = () => {
        openSideBar(false);
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

    const handleSubmit = async () => {
        if (errors.length > 0 || !updateNode || !refreshNextId) {
            return;
        }

        validateName(fundingLineName.trim());
        validateFundingLineId(fundingLineId.trim());

        if (errors.length > 0 || !updateNode || !refreshNextId) {
            return;
        }

        const updatedNode: FundingLineUpdateModel = {
            id: node.id,
            kind: node.kind,
            name: fundingLineName.trim(),
            templateLineId: parseInt(fundingLineId.trim(), 10),
            type: fundingLineType,
            fundingLineCode: fundingLineType === FundingLineType.Payment ? fundingLineCode : undefined,
        };

        await updateNode(updatedNode);
        refreshNextId();
        openSideBar(false);
    };

    function addErrorMessage(errorMessage: string, fieldName: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = { id: errorCount + 1, fieldName: fieldName, message: errorMessage };
        setErrors((errors) => [...errors, error]);
    }

    function clearErrorMessages(fieldName?: string) {
        if (errors.length > 0) {
            if (fieldName === undefined) {
                setErrors([]);
            } else if (errors.some((e) => e.fieldName === fieldName)) {
                setErrors(errors.filter((e) => e.fieldName !== fieldName));
            }
        }
    }

    return (
        <div data-testid="sidebar-fundingline">
            <h2 className="govuk-heading-l">{isEditMode ? "Edit" : ""} Funding Line</h2>
            <fieldset className="govuk-fieldset" key={node.id}>
                <div
                    className={`govuk-form-group ${
                        errors.filter((e) => e.fieldName === "fl-name").length > 0 ? "govuk-form-group--error" : ""
                    }`}
                >
                    <label className="govuk-label" htmlFor="fl-name">
                        Name
                    </label>
                    {isEditMode ? (
                        <>
                            {errors.filter((e) => e.fieldName === "fl-name").length === 0 ? (
                                <span id="fl-name-hint" className="govuk-hint">
                  The name of the funding line (e.g. 'Total Funding Line')
                </span>
                            ) : (
                                errors.map(
                                    (error) =>
                                        error.fieldName === "fl-name" && (
                                            <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                        <span className="govuk-visually-hidden">Error:</span> {error.message}
                      </span>
                                        )
                                )
                            )}
                            <input
                                className="govuk-input"
                                id="fl-name"
                                name="fl-name"
                                type="text"
                                value={fundingLineName}
                                onChange={handleNameChange}
                            />
                        </>
                    ) : (
                        <span id="fl-name" className="govuk-hint">
              {fundingLineName}
            </span>
                    )}
                </div>
                <div
                    className={`govuk-form-group ${
                        errors.filter((e) => e.fieldName === "funding-line-id").length > 0
                            ? "govuk-form-group--error"
                            : ""
                    }`}
                >
                    <label className="govuk-label" htmlFor="funding-line-id">
                        Funding Line ID
                    </label>
                    {isEditMode ? (
                        <>
                            {errors.map(
                                (error) =>
                                    error.fieldName === "funding-line-id" && (
                                        <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                      <span className="govuk-visually-hidden">Error:</span> {error.message}
                    </span>
                                    )
                            )}
                            <input
                                className="govuk-input"
                                id="funding-line-id"
                                name="funding-line-id"
                                type="text"
                                value={fundingLineId}
                                onChange={handleFundingLineIdChange}
                            />
                        </>
                    ) : (
                        <span id="funding-line-id" className="govuk-hint">
              {fundingLineId}
            </span>
                    )}
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="fl-type">
                        Type
                    </label>
                    {isEditMode ? (
                        <select
                            className="govuk-select"
                            id="fl-type"
                            name="fl-type"
                            value={fundingLineType}
                            onChange={handleTypeChange}
                        >
                            <option value={FundingLineType.Payment}>Payment</option>
                            <option value={FundingLineType.Information}>Information</option>
                        </select>
                    ) : (
                        <span id="fl-type" className="govuk-hint">
              {fundingLineType}
            </span>
                    )}
                </div>
                {fundingLineType === FundingLineType.Payment && (
                    <div
                        className={`govuk-form-group ${
                            errors.filter((e) => e.fieldName === "fl-code").length > 0 ? "govuk-form-group--error" : ""
                        }`}
                    >
                        <label className="govuk-label" htmlFor="fl-code">
                            Funding Line Code
                        </label>
                        {isEditMode ? (
                            <>
                                {errors.filter((e) => e.fieldName === "fl-code").length === 0 ? (
                                    <span id="fl-code-hint" className="govuk-hint">
                    The funding line code (e.g. PSG-0001)
                  </span>
                                ) : (
                                    <>
                                        {errors.map(
                                            (error) =>
                                                error.fieldName === "fl-code" && (
                                                    <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                            <span className="govuk-visually-hidden">Error:</span> {error.message}
                          </span>
                                                )
                                        )}
                                    </>
                                )}
                                <input
                                    className="govuk-input govuk-!-width-two-thirds"
                                    id="fl-code"
                                    name="fl-code"
                                    type="text"
                                    value={fundingLineCode}
                                    onChange={handleFundingLineCodeChange}
                                />
                            </>
                        ) : (
                            <span id="fl-code" className="govuk-hint">
                {fundingLineCode}
              </span>
                        )}
                    </div>
                )}
                {isEditMode ? (
                    <>
                        <div className="govuk-form-group">
                            <button
                                className="govuk-button"
                                data-module="govuk-button"
                                onClick={handleSubmit}
                                disabled={errors.length > 0}
                            >
                                Save and continue
                            </button>
                        </div>
                        {allowDelete && (
                            <>
                                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                  </span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        {isClone
                                            ? "NB: This will delete this clone instance only."
                                            : "Be careful. This will delete all child nodes and clones."}
                                    </strong>
                                </div>
                                <div className="govuk-form-group">
                                    {confirmDelete ? (
                                        <>
                                            <button
                                                className="govuk-button govuk-button--warning govuk-!-margin-right-1"
                                                onClick={handleConfirmDelete}
                                                data-testid={`node-${node.id}-confirm-delete`}
                                            >
                                                Confirm delete
                                            </button>
                                            <button className="govuk-button govuk-button--secondary" onClick={handleCancelDelete}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="govuk-button govuk-button--warning"
                                            onClick={handleDelete}
                                            data-testid={`node-${node.id}-delete`}
                                        >
                                            Delete funding line
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <button className="govuk-button" onClick={handleCancel}>
                        Close
                    </button>
                )}
            </fieldset>
        </div>
    );
}
