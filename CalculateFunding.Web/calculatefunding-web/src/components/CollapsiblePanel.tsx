import * as React from "react";
import { useState } from "react";

interface CollapsiblePanelProps {
  title: string;
  isExpanded?: boolean;
  isCollapsible?: boolean;
  facetCount?: number;
  showFacetCount?: boolean;
  children: any;
}

export const CollapsiblePanel = ({
  isExpanded = true,
  title,
  isCollapsible = false,
  facetCount = 0,
  showFacetCount = false,
  children,
}: CollapsiblePanelProps) => {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="govuk-collapsiblepanel">
      {isCollapsible ? (
        <div className="govuk-collapsiblepanel-heading" onClick={() => setExpanded(!expanded)}>
          <label
            className={
              expanded
                ? "govuk-collapsiblepanel-heading-collapser"
                : "govuk-collapsiblepanel-heading-expander"
            }
          >
            {title}
          </label>
          {showFacetCount && <div className="govuk-caption-m">{facetCount} Selected</div>}
        </div>
      ) : (
        <div className="govuk-collapsiblepanel-heading">
          <label>{title}</label>
        </div>
      )}
      {expanded && <div className={"govuk-collapsiblepanel-body"}>{children}</div>}
    </div>
  );
};
