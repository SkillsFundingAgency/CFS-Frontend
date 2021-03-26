import React, {useState} from "react";
import {Link} from "react-router-dom";
import {CalculationError} from "../../types/Calculations/CalculationError";
import {AccordianPanel} from "../AccordianPanel";

export function CalculationErrors(props: { calculationErrors: CalculationError[] | undefined }) {
    const [allExpanded, setAllExpanded] = useState<boolean>(false);

    const handleExpandClick = () => {
        setAllExpanded(!allExpanded);
    }

    return <section className="govuk-tabs__panel" id="calculation-errors">
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Calculation errors</h2>
                <p className="govuk-body">Errors found in calculations. Each error can contain many calculations.</p>
            </div>
        </div>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
                <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                    <div className="govuk-accordion__controls">
                        <button type="button" onClick={handleExpandClick} className="govuk-accordion__open-all" aria-expanded={allExpanded ? "true" : "false"}>
                            {allExpanded ? "Close" : "Open"} all<span className="govuk-visually-hidden"> sections</span>
                        </button>
                    </div>
                {props.calculationErrors?.map((_, index) =>
                    <AccordianPanel key={`panel-${_}`} id={`panel-${_}`} expanded={false}
                                    title={_.title} autoExpand={allExpanded}
                                    boldSubtitle={""} subtitle="">
                        <div id="accordion-default-content-1" className="govuk-accordion__section-content" aria-labelledby="accordion-default-heading-1">
                            <div className="govuk-grid-row" hidden={_.templateCalculations.length === 0}>
                                <div className="govuk-grid-column-two-thirds">
                                    <h3 className="govuk-heading-s">Template calculations</h3>
                                    {_.templateCalculations.map(templateCalculation =>
                                        <p className="govuk-body"><Link className="govuk-link" to={`/Specifications/EditCalculation/${templateCalculation.id}`}>{templateCalculation.name}</Link></p>
                                    )}
                                </div>
                            </div>
                            <div className="govuk-grid-row" hidden={_.additionalCalculations.length === 0}>
                                <div className="govuk-grid-column-two-thirds">
                                    <h3 className="govuk-heading-s">Additional calculations</h3>
                                    {_.additionalCalculations.map(additionalCalculation =>
                                        <p className="govuk-body"><Link className="govuk-link" to={`/Specifications/EditCalculation/${additionalCalculation.id}`}>{additionalCalculation.name}</Link></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AccordianPanel>
                )}
                </div>
            </div>
        </div>
    </section>
}