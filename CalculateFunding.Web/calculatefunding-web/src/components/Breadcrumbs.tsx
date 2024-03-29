import * as React from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

export interface BreadcrumbProps {
  name: string;
  url?: string;
  legacy?: boolean;
  goBack?: boolean;
}

export function Breadcrumbs(props: { children: any }) {
  return (
    <nav id="breadcrumbs" aria-label="Breadcrumbs" className="govuk-breadcrumbs govuk-!-margin-bottom-5">
      <ol className="govuk-breadcrumbs__list" aria-label="breadcrumb-list">{props.children}</ol>
    </nav>
  );
}

export function Breadcrumb(props: BreadcrumbProps) {
  const history = useHistory();
  if (props.legacy) {
    return (
      <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
        <a href={props.url} className="govuk-breadcrumbs__link">
          {props.name}
        </a>
      </li>
    );
  }
  if (props.goBack) {
    return (
      <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
        <a href="#" className="govuk-breadcrumbs__link" onClick={history.goBack}>
          {props.name}
        </a>
      </li>
    );
  }
  if (props.url === undefined) {
    return (
      <li className="govuk-breadcrumbs__list-item" aria-current="page" data-testid="breadcrumb">
        {props.name}
      </li>
    );
  } else {
    return (
      <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
        <Link to={props.url} className="govuk-breadcrumbs__link">
          {props.name}
        </Link>
      </li>
    );
  }
}
