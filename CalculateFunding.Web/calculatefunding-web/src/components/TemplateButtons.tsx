import React from "react"
import {Link} from 'react-router-dom';
import {TemplateStatus} from '../types/TemplateBuilderDefinitions';

export interface ITemplateButtonsProps {
    isEditMode: boolean,
    canEditTemplate: boolean,
    canApproveTemplate: boolean,
    hasTemplateContent: boolean,
    unsavedChanges: boolean,
    templateId: string,
    templateStatus: string,
    templateVersion: number,
    cameFromVersionList: boolean,
    isCurrentVersion: boolean,
    handleSave: () => void,
    handlePublish: () => void,
}

export const TemplateButtons: React.FC<ITemplateButtonsProps> =
    ({
         isEditMode,
         canEditTemplate,
         canApproveTemplate,
         templateId,
         templateStatus,
         templateVersion,
         cameFromVersionList,
         hasTemplateContent,
         unsavedChanges,
         isCurrentVersion,
         handleSave,
         handlePublish
     }) => {
        return (
            <>
                {!unsavedChanges && hasTemplateContent &&
                    <div>
                <a href={`/api/templates/build/${templateId}/export?version=${templateVersion}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   download className="govuk-button govuk-button--secondary  govuk-!-margin-left-1"
                   data-module="govuk-button"
                   data-testid='export-button'>
                    Export template
                </a>
                    </div>}
                {isEditMode && canEditTemplate &&
                <button className="govuk-button govuk-!-margin-right-1" data-testid='save-button'
                        disabled={!unsavedChanges} onClick={handleSave}>Save
                </button>}
                {canApproveTemplate && templateStatus !== TemplateStatus.Published &&
                <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='publish-button'
                        disabled={unsavedChanges} onClick={handlePublish}>Continue to publish
                </button>}
                {canEditTemplate && !isCurrentVersion &&
                <button className="govuk-button govuk-!-margin-right-1" data-testid='restore-button'
                        onClick={() => alert("Coming soon...")}>Restore as current version
                </button>}
                {cameFromVersionList &&
                <Link to={`/Templates/${templateId}/Versions`} id="back-button"
                      className="govuk-button govuk-button--secondary"
                      data-module="govuk-button">
                    Back
                </Link>
                }
                {!cameFromVersionList &&
                <Link id="cancel-create-template" to="/Templates/List"
                      className="govuk-button govuk-button--secondary"
                      data-module="govuk-button">
                    Back
                </Link>
                }
            </>
        );
    }