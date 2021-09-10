import * as React from "react";
import { useEffect, useState } from "react";

import { Tag, TagTypes } from "./Tag";

export function AccordionPanel(props: {
  id: string;
  expanded: boolean;
  title: string;
  subtitle: string;
  boldSubtitle: string;
  autoExpand: boolean;
  tagVisible?: boolean;
  tagText?: string;
  tagType?: TagTypes;
  children: React.ReactNode;
}) {
  const [panelExpanded, setPanelExpanded] = useState(props.expanded);

  useEffect(() => {
    setPanelExpanded(props.autoExpand);
  }, [props.autoExpand]);

  useEffect(() => {
    setPanelExpanded(props.expanded);
  }, [props.expanded]);

  return (
    <div
      className={"govuk-accordion__section" + (panelExpanded ? " govuk-accordion__section--expanded" : "")}
      id={props.id}
      role="region"
      data-testid="accordion-panel"
    >
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <button
            type="button"
            id={"accordion-default-heading-" + props.id}
            className="govuk-accordion__section-button"
            onClick={() => setPanelExpanded(!panelExpanded)}
          >
            {props.title}
          </button>
          <span
            className="govuk-accordion__icon"
            aria-hidden={!panelExpanded}
            onClick={() => setPanelExpanded(!panelExpanded)}
          />
        </h2>
        <p className="govuk-body">
          {props.subtitle}
          {props.boldSubtitle}
        </p>
        {props.tagVisible && (
          <Tag
            text={props.tagText ? props.tagText : ""}
            type={props.tagType ? props.tagType : TagTypes.default}
          />
        )}
      </div>
      {props.children}
    </div>
  );
}
