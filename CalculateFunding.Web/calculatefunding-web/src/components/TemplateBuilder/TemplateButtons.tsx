import React, {useState, useEffect} from "react"
import {Link} from 'react-router-dom';
import {TemplateStatus} from '../../types/TemplateBuilderDefinitions';

export interface ITemplateButtonsProps {
    isEditMode: boolean,
    canEditTemplate: boolean,
    canApproveTemplate: boolean,
    canCreateTemplate: boolean,
    hasTemplateContent: boolean,
    unsavedChanges: boolean,
    templateId: string,
    templateStatus: string,
    templateVersion: number,
    isCurrentVersion: boolean,
    isSaving: boolean,
    isFullScreen: boolean,
    handleSave: () => void,
    handleRestore: (templateVersion: number) => void,
    handlePublish: () => void
}

const saveButtonFullScreenStyle: React.CSSProperties = {
    zIndex: 10,
    width: "68px",
    bottom: 10,
    left: 10,
    position: "fixed",
}

export const TemplateButtons: React.FC<ITemplateButtonsProps> =
    ({
         isEditMode,
         canEditTemplate,
         canApproveTemplate,
         canCreateTemplate,
         templateId,
         templateStatus,
         templateVersion,
         hasTemplateContent,
         unsavedChanges,
         isCurrentVersion,
         isSaving,
         isFullScreen,
         handleSave,
         handleRestore,
         handlePublish,
     }) => {
        const [confirmRestore, setConfirmRestore] = useState<boolean>(false);

        useEffect(() => {
            setConfirmRestore(false);
        }, [isSaving]);

        const onConfirmRestore = () => {
            setConfirmRestore(true);
        }

        const onCancelRestore = () => {
            setConfirmRestore(false);
        }

        const onRestore = async () => {
            handleRestore(templateVersion);
        }

        return (
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    {isEditMode && canEditTemplate && !confirmRestore &&
                    <button className="govuk-button govuk-!-margin-right-1" data-testid='save-button'
                            disabled={!unsavedChanges || isSaving} onClick={handleSave} style={isFullScreen ? saveButtonFullScreenStyle : {}}>Save
                    </button>}
                    {isEditMode && canApproveTemplate && templateStatus !== TemplateStatus.Published && !confirmRestore &&
                    <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='publish-button'
                            disabled={unsavedChanges} onClick={handlePublish}>Continue to publish
                    </button>}
                    {canEditTemplate && !isCurrentVersion &&
                    <>
                        {!confirmRestore &&
                        <button className="govuk-button govuk-!-margin-right-1" data-testid='restore-button'
                                disabled={isSaving} onClick={onConfirmRestore}>Restore as current version
                        </button>}
                        {confirmRestore && !isSaving &&
                        <>
                            <button className="govuk-button govuk-button--warning govuk-!-margin-right-1" data-testid='confirm-restore-button'
                                    onClick={onRestore}>Confirm restore
                            </button>
                            <button className="govuk-button govuk-button--secondary govuk-!-margin-right-1" data-testid='cancel-restore'
                                    onClick={onCancelRestore}>Cancel restore
                            </button>
                        </>}
                    </>}
                    {hasTemplateContent && canCreateTemplate && !unsavedChanges &&
                    <Link to={`/Templates/${templateId}/Clone/${templateVersion}`}
                          className="govuk-button right-align govuk-!-margin-left-1 govuk-!-margin-right-0"
                          data-testid='clone-button'>
                        Clone template
                    </Link>}
                    {!unsavedChanges && hasTemplateContent &&
                    <a href={`/api/templates/build/${templateId}/export?version=${templateVersion}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       download className="govuk-button govuk-button--secondary govuk-!-margin-left-1 right-align govuk-!-margin-right-0"
                       data-module="govuk-button"
                       data-testid='export-button'>
                        Export template
                    </a>}
                </div>
            </div>
        );
    }