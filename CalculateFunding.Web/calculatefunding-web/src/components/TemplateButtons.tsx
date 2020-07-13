import React, {useState, useEffect} from "react"
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
    isCurrentVersion: boolean,
    isSaving: boolean,
    handleSave: () => void,
    handleRestore: (templateVersion: number) => void,
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
         hasTemplateContent,
         unsavedChanges,
         isCurrentVersion,
         isSaving,
         handleSave,
         handleRestore,
         handlePublish
     }) => {
        const [confirmRestore, setConfirmRestore] = useState<boolean>(false);

        useEffect(() => {
            setConfirmRestore(false);
        }, [isSaving]);

        const handleConfirmRestore = () => {
            setConfirmRestore(true);
        }

        const handleCancelRestore = () => {
            setConfirmRestore(false);
        }

        const handleRestoreTemplate = async () => {
            handleRestore(templateVersion);
        }

        return (
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                {isEditMode && canEditTemplate && !confirmRestore &&
                <button className="govuk-button govuk-!-margin-right-1" data-testid='save-button'
                        disabled={!unsavedChanges || isSaving} onClick={handleSave}>Save
                </button>}
                {isEditMode && canApproveTemplate && templateStatus !== TemplateStatus.Published && !confirmRestore &&
                <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='publish-button'
                        disabled={unsavedChanges} onClick={handlePublish}>Continue to publish
                </button>}
                {canEditTemplate && !isCurrentVersion &&
                <>
                    {!confirmRestore &&
                    <button className="govuk-button govuk-!-margin-right-1" data-testid='restore-button'
                            disabled={isSaving} onClick={handleConfirmRestore}>Restore as current version
                    </button>}
                    {confirmRestore && !isSaving &&
                    <>
                        <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='confirm-restore-button'
                                onClick={handleRestoreTemplate}>Confirm restore
                        </button>
                        <button className="govuk-button govuk-button--secondary govuk-!-margin-right-1" data-testid='cancel-restore'
                                onClick={handleCancelRestore}>Cancel restore
                        </button>
                    </>}
                </>}
                {!unsavedChanges && hasTemplateContent &&
                <a href={`/api/templates/build/${templateId}/export?version=${templateVersion}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   download className="govuk-button govuk-button--secondary  govuk-!-margin-left-1 right-align govuk-!-margin-right-0"
                   data-module="govuk-button"
                   data-testid='export-button'>
                    Export template 
                </a>}
            </div>
            </div>
        );
    }