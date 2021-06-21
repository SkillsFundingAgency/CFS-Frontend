import '../styles/CollapsibleSteps.scss';
import * as React from "react";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {DateTimeFormatter} from "./DateTimeFormatter";
import {FundingStructureItemViewModel} from "../types/FundingStructureItem";
import {PublishStatus} from "../types/PublishStatusModel";
import {convertCamelCaseToSpaceDelimited} from "../helpers/stringHelper";

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
    expanded: boolean;
    hasChildren: boolean;
    customRef?: React.MutableRefObject<null>;
    lastUpdatedDate?: Date;
    callback: any;
    calculationErrorMessage?: string;
    providerId?: string;
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

    const hasError: boolean = props.calculationErrorMessage === undefined ||
        props.calculationErrorMessage === null ? false : props.calculationErrorMessage.length > 0;

    return (
        <ul>
            <li ref={props.customRef}
                key={"step" + listKey}
                className="collapsible-step step-is-shown">
                <div key={listKey + "header"}
                    className={`collapsible-step-header-container collapsible-step-header-with-calculation-value
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
                        <span className="collapsible-step-header-title">
                            {props.title}
                        </span>
                        <span className={`collapsible-step-header-description 
                            ${hasError ? "govuk-form-group--error" : ""}`}>
                            {props.link !== "" ? <Link to={props.link} className="govuk-link">{props.description}</Link> : <span>{props.description}</span>}
                            {hasError ?
                                <span className="govuk-error-container govuk-error-message">
                                    <span className="govuk-visually-hidden">Error:</span>{props.calculationErrorMessage}
                                </span> : null}
                        </span>
                        <span className="collapsible-step-header-status">
                            {hasError ? <span className="govuk-error-message">Error</span> : props.status}
                        </span>
                        <span className="collapsible-step-header-value-container">
                            <span>
                                <span className="collapsible-step-header-value-type">
                                    {props.calculationType ? convertCamelCaseToSpaceDelimited(props.calculationType) : ""}
                                </span>
                                <span className="collapsible-step-header-value">
                                    {props.value && props.value.length > 0 ? (props.value) : (props.providerId ? "Excluded" : "") }
                                </span>
                            </span>
                        </span>
                        <span className="collapsible-step-header-updated-date">
                            <DateTimeFormatter date={props.lastUpdatedDate as Date} />
                        </span>
                        <span className="collapsible-step-panel-button" hidden={!props.hasChildren} onClick={updateExpandedStatus}>
                            <label className={expanded ? "govuk-collapsiblepanel-heading-collapser" : "govuk-collapsiblepanel-heading-expander"} />
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

export function setCollapsibleStepsAllStepsStatus(fundingLines: FundingStructureItemViewModel[]) {
    const collapsibleStepsAllStepsStatus: ICollapsibleStepsAllStepsStatus = {
        openAllSteps: true,
        closeAllSteps: true
    }
    fundingLines.map(
        function searchFundingLines(fundingStructureItem: FundingStructureItemViewModel) {
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