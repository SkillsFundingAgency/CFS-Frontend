import * as React from 'react';
import {Link} from "react-router-dom";
import {useHistory} from "react-router";

export function Breadcrumbs(props: { children: any }) {
    return <div id="breadcrumbs" className="govuk-breadcrumbs govuk-!-margin-bottom-5">
        <ol className="govuk-breadcrumbs__list">
            {props.children}
        </ol>
    </div>
}

export function Breadcrumb(props: { name: string, url?: string, legacy?:boolean, goBack?:boolean }) {
    const history = useHistory();
    if(props.legacy)
    {
        return <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
            <a href={props.url} className="govuk-breadcrumbs__link">{props.name}</a>
        </li>
    }
    if(props.goBack)
    {
        return <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
            <a href="#" className="govuk-breadcrumbs__link" onClick={history.goBack}>{props.name}</a>
        </li>
    }
    if (props.url === undefined) {
        return <li className="govuk-breadcrumbs__list-item" aria-current="page" data-testid="breadcrumb">
            {props.name}
        </li>
    } else {
        return <li className="govuk-breadcrumbs__list-item" data-testid="breadcrumb">
            <Link to={props.url} className="govuk-breadcrumbs__link">{props.name}</Link>
        </li>
    }
}