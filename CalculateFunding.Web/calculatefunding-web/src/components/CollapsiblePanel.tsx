import * as React from "react";
import { useState } from "react";

interface ICollapsiblePanelProps {
  title: string;
  expanded: boolean;
}

export const CollapsiblePanel: React.FC<ICollapsiblePanelProps> = (props) => {
  const [expanded, setExpanded] = useState(props.expanded);

  return (
    <div className="govuk-collapsiblepanel">
      <div className="govuk-collapsiblepanel-heading" onClick={() => setExpanded(!expanded)}>
        {props.title}
        <label
          className={
            expanded ? "govuk-collapsiblepanel-heading-collapser" : "govuk-collapsiblepanel-heading-expander"
          }
        ></label>
      </div>
      <div className={expanded ? "govuk-collapsiblepanel-body" : "govuk-collapsiblepanel-body-collapsed"}>
        {props.children}
      </div>
    </div>
  );
};
