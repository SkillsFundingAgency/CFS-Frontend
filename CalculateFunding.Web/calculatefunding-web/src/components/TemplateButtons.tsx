import React from "react"
import { Link } from 'react-router-dom';
import { TemplateStatus } from '../types/TemplateBuilderDefinitions';

export interface ITemplateButtonsProps {
    isEditMode: boolean,
    canEditTemplate: boolean,
    canApproveTemplate: boolean,
    unsavedChanges: boolean,
    templateId: string,
    templateStatus: string,
    templateVersion: string | undefined,
    isCurrentVersion: boolean,
    handleSave: () => void,
    handlePublish: () => void,
}
export const TemplateButtons: React.FC<ITemplateButtonsProps> = ({
    isEditMode,
    canEditTemplate,
    canApproveTemplate,
    templateId,
    templateStatus,
    templateVersion,
    unsavedChanges,
    isCurrentVersion,
    handleSave,
    handlePublish
}) => {
    return (
        <>
            {isEditMode && canEditTemplate &&
                <button className="govuk-button govuk-!-margin-right-1" data-testid='save-button'
                    disabled={!unsavedChanges} onClick={handleSave}>Save
            </button>}
            {canApproveTemplate && templateStatus !== TemplateStatus.Published &&
                <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='publish-button'
                    disabled={unsavedChanges} onClick={handlePublish}>Continue to publish
            </button>}
            {templateVersion && canEditTemplate && !isCurrentVersion &&
                <button className="govuk-button govuk-!-margin-right-1" data-testid='restore-button'
                    onClick={() => alert("Coming soon...")}>Restore as current version
            </button>}
            {templateVersion &&
                <Link to={`/Templates/${templateId}/Versions`} id="back-button"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button">
                    Back
            </Link>
            }
            {!templateVersion &&
                <Link id="cancel-create-template" to="/Templates/List"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button">
                    Back
            </Link>
            }
        </>
    );
}