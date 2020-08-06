import React, {useState, useMemo, useEffect} from "react";
import "../styles/TagEditor.scss";
import {useEventListener} from "../hooks/useEventListener";
import {getStringArray} from "../services/templateBuilderDatasourceService";

export interface TagEditorProps {
    allowDuplicates: boolean,
    tagValuesCsv: string,
    label: string,
    duplicateErrorMessage?: string,
    showErrorMessageOnRender?: string,
    onAddNewValue: (newValue: string) => void,
    onRemoveValue: (valueToRemove: string) => void
}

export function TagEditor(
    {
        allowDuplicates,
        tagValuesCsv,
        label,
        showErrorMessageOnRender,
        duplicateErrorMessage,
        onAddNewValue,
        onRemoveValue
    }: TagEditorProps) {

    const [newTagValue, setNewTagValue] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>(showErrorMessageOnRender ? showErrorMessageOnRender : "");
    const tagsArray = useMemo(() => getStringArray(tagValuesCsv), [tagValuesCsv]);

    const keyPressHandler = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13) {
            handleAddNewTagValueClick();
        }
    };
    useEventListener('keydown', keyPressHandler);

    useEffect(() => {
        setErrorMessage(showErrorMessageOnRender ? showErrorMessageOnRender : "");
    }, [showErrorMessageOnRender]);

    const handleNewTagValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTagValue(e.target.value);
    };

    const passesValidityCheck = (): boolean => {
        const existingTagsArray = getStringArray(tagValuesCsv);
        if (!allowDuplicates && existingTagsArray && existingTagsArray.includes(newTagValue)) {
            setErrorMessage(duplicateErrorMessage ? duplicateErrorMessage : "You cannot add the same tag twice");
            return false;
        }
        return true;
    };

    const resetValidity = () => {
        setErrorMessage('');
    };

    const resetTagValue = () => {
        setNewTagValue('');
    };

    const handleAddNewTagValueClick = () => {
        resetValidity();
        if (passesValidityCheck() && newTagValue.trim().length > 0) {
            onAddNewValue(newTagValue);
            resetTagValue();
        }
    };

    const handleRemoveTagValueClick = (valueToRemove: string) => {
        onRemoveValue(valueToRemove);
    };

    return (
        <div className={`govuk-form-group ${errorMessage.length === 0 ? "" : "govuk-form-group--error"}`}>
            <label className="govuk-label" htmlFor="add-tag" aria-labelledby="add-tag">{label}</label>
            <div className="govuk-!-margin-top-2">{
                tagsArray && tagsArray.map((t, i) =>
                    <strong
                        key={`tag-${i}`}
                        data-testid="tag"
                        className="govuk-tag govuk-tag--grey govuk-!-margin-bottom-1 enum-tag"
                        onClick={() => handleRemoveTagValueClick(t)}>✕ {t}
                    </strong>)
            }
            </div>
            <br/>
            {errorMessage.length > 0 &&
            <span id="tag-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error: </span>{errorMessage}
                </span>}
            <input
                className="govuk-input govuk-!-width-two-thirds"
                id="add-tag"
                name="add-tag"
                type="text"
                value={newTagValue}
                onChange={handleNewTagValue}/>
            <button className="govuk-button govuk-!-margin-bottom-1 govuk-!-margin-left-1"
                    data-testid="add-tag-button"
                    onClick={handleAddNewTagValueClick}>
                Add
            </button>
        </div>
    );
}
