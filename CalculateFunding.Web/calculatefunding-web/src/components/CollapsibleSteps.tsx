import * as React from "react";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {DateFormatter} from "./DateFormatter";
import {FundingStructureItem} from "../types/FundingStructureItem";
import {PublishStatus} from "../types/PublishStatusModel";
import {PublishedProviderError} from "../types/PublishedProviderError";

interface ICollapsibleStepsProps {
    uniqueKey: string;
    step: string;
    title: string;
    description: string;
    status: PublishStatus | undefined;
    link: string;
    value?: string;
    fundingLineCode?: string;
    calculationType?: string;
    errors?: PublishedProviderError[];
    expanded: boolean;
    hasChildren: boolean;
    customRef?: React.MutableRefObject<null>;
    lastUpdatedDate?: Date;
    callback: any;
}

export interface ICollapsibleStepsAllStepsStatus {
    openAllSteps: boolean;
    closeAllSteps: boolean;
}

export function CollapsibleSteps(props: React.PropsWithChildren<ICollapsibleStepsProps>) {
    const [expanded, setExpanded] = useState(props.expanded);
    const listKey = props.uniqueKey;
    const expandRef = React.useRef(false);
    useEffect(() => {
        if (!expandRef.current) {
            setExpanded(props.expanded);
        }

    }, [props.expanded]);

    function updateExpandedStatus() {
        setExpanded(!expanded);
        props.callback(!expanded, props.description);
    }

    return (
        <ul>
            <li ref={props.customRef} 
                key={"step" + listKey} 
                className="collapsible-step step-is-shown">
                <div key={listKey + "header"}
                     className={`collapsible-step-header-container 
                     ${props.value != null && props.value !== "" ? " collapsible-step-header-with-calculation-value" : ""}
                     ${props.lastUpdatedDate != null ? " collapsible-step-header-with-updated-date" : ""}`}>
                    <h2 className={props.step === "1" ? "govuk-heading-s first-step-title" : "govuk-heading-s"}>
                        <span className="collapsible-step-circle collapsible-step-circle-number" hidden={props.step === ""}>
                            <span className="collapsible-step-circle-inner">
                                <span className="collapsible-step-circle-background">
                                  <span className="collapsible-step-circle-step-label visuallyhidden">Step</span>
                                    {props.step}
                                    <span className="collapsible-step-circle-step-colon visuallyhidden"
                                          aria-hidden="true">:</span>
                                </span>
                            </span>
                        </span>
                        {props.fundingLineCode && props.errors &&
                        props.errors.filter(e => e.fundingLineCode === props.fundingLineCode)
                            .map((err, index) =>
                                <span key={`${props.uniqueKey}-error-${index}`} className="govuk-error-message govuk-!-margin-top-2">
                                    <span className="govuk-visually-hidden">Error:</span>
                                    {err}
                                </span>
                            )}
                        <span className="collapsible-step-header-title">
                            {props.title}
                        </span>
                        <span className="collapsible-step-header-description">
                            {props.link !== "" ? <Link to={props.link} className="govuk-link">{props.description}</Link> : <span>{props.description}</span>}
                        </span>
                        <span className="collapsible-step-header-status">
                            {props.status}
                        </span>
                        <span className="collapsible-step-header-value-container">
                            {props.value != null && props.value !== "" ?
                                <span>
                                        <span className="collapsible-step-header-value-type">
                                            {props.calculationType}
                                        </span>
                                        <span className="collapsible-step-header-value">
                                            {props.value}
                                        </span>
                                    </span>
                                : null
                            }
                        </span>
                        <span className="collapsible-step-header-updated-date">
                            <DateFormatter date={props.lastUpdatedDate} utc={true}/>
                        </span>
                        <span className="collapsible-step-panel-button" hidden={!props.hasChildren} onClick={updateExpandedStatus}>
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

export function setCollapsibleStepsAllStepsStatus(fundingLines: FundingStructureItem[]) {
    const collapsibleStepsAllStepsStatus: ICollapsibleStepsAllStepsStatus = {
        openAllSteps: true,
        closeAllSteps: true
    }
    fundingLines.map(
        function searchFundingLines(fundingStructureItem: FundingStructureItem) {
            if (!fundingStructureItem.expanded && fundingStructureItem.fundingStructureItems != null) {
                collapsibleStepsAllStepsStatus.openAllSteps = false;
            }
            if (fundingStructureItem.expanded && fundingStructureItem.fundingStructureItems != null) {
                collapsibleStepsAllStepsStatus.closeAllSteps = false;
            }
            if (fundingStructureItem.fundingStructureItems) {
                fundingStructureItem.fundingStructureItems.map(searchFundingLines);
            }
        }
    );

    return collapsibleStepsAllStepsStatus;
}