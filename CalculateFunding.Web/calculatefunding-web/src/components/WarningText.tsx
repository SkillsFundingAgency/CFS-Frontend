import React from "react";

export interface WarningTextProps {
    text: string, 
    hidden?: boolean,
    className?: string,
}

export function WarningText({ text, className, hidden = false }: WarningTextProps) {
    
    return (
        <div className={`govuk-warning-text ${className || ''}`} hidden={hidden}>
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            <span>{text}</span>
        </strong>
    </div>)
}