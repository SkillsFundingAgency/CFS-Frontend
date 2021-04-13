import * as React from "react";
import {useEffect, useState} from "react";

export function AccordianPanel(props: {
    id: string, expanded: boolean, title: string, subtitle: string, boldSubtitle: string,
    autoExpand: boolean, children: React.ReactNode
}) {
    const [panelExpanded, setPanelExpanded] = useState(props.expanded);

    useEffect(() => {
        setPanelExpanded(props.autoExpand);
    }, [props.autoExpand]);

    useEffect(() => {
        setPanelExpanded(props.expanded);
    }, [props.expanded]);

    return (
        <div className={"govuk-accordion__section" + (panelExpanded ? " govuk-accordion__section--expanded" : "")}
            id={props.id} role="region" data-testid="accordian-panel">
            <div className="govuk-accordion__section-header">
                <h2 className="govuk-accordion__section-heading">
                    <button type="button" id={"accordion-default-heading-" + props.id}
                        className="govuk-accordion__section-button" onClick={() => setPanelExpanded(!panelExpanded)}>
                        {props.title}
                    </button>
                    <span className="govuk-accordion__icon" aria-hidden={!panelExpanded}
                        onClick={() => setPanelExpanded(!panelExpanded)} /></h2>
                <p className="govuk-body">{props.subtitle}{props.boldSubtitle}
                </p>
            </div>
            {props.children}
        </div>
    );
}