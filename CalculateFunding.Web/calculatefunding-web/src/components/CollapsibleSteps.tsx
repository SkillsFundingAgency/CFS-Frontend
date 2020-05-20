import * as React from "react";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
interface ICollapsibleStepsProps {
    uniqueKey: string;
    step: string;
    title: string;
    description: string;
    status: string;
    link: string;
    expanded: boolean;
    hasChildren: boolean;
    customRef: React.MutableRefObject<null>;
}

export function CollapsibleSteps (props: React.PropsWithChildren<ICollapsibleStepsProps>) {
    const [expanded, setExpanded] = useState(props.expanded);
    const listKey = props.uniqueKey;
    const expandRef = React.useRef(false);
    useEffect(() => {
        if(!expandRef.current) {
            setExpanded(props.expanded);
        }
    }, [props.expanded]);

    let description = <span>{props.description}</span>;
    if (props.link !== "") {
        description = <Link to={props.link} className="govuk-link">{props.description}</Link>;
    }

    return (
        <ul>
        <li ref={props.customRef} key={"step" + listKey} className="collapsible-step step-is-shown">
            <div key={listKey + "header"} className="collapsible-step-header-container">
                <h2 className={props.step === "1" ? "govuk-heading-s first-step-title" : "govuk-heading-s"}>
                    <span className="collapsible-step-circle collapsible-step-circle-number" hidden={props.step === ""}>
                        <span className="collapsible-step-circle-inner">
                            <span className="collapsible-step-circle-background">
                              <span
                                  className="collapsible-step-circle-step-label visuallyhidden">Step</span> {props.step}<span
                                className="collapsible-step-circle-step-colon visuallyhidden"
                                aria-hidden="true">:</span>
                            </span>
                        </span>
                    </span>
                    <span className="collapsible-step-header-title">
                        {props.title}
                    </span>
                    <span className="collapsible-step-header-description">
                        {description}
                    </span>
                    <span className="collapsible-step-header-status">
                        {props.status}
                    </span>
                    <span className="collapsible-step-panel-button" hidden={!props.hasChildren} onClick={() => setExpanded(!expanded)}>
                        <label className={expanded ? "govuk-collapsiblepanel-heading-collapser" : "govuk-collapsiblepanel-heading-expander"}/>
                    </span>
                </h2>
            </div>
            <div key={listKey + "panel"} className={expanded ? "collapsible-step-panel" : "collapsible-step-panel collapsible-step-hidden-panel"}>
                {props.children}
            </div>
        </li>
        </ul>
    );
}