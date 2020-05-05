import * as React from 'react';
import {Link} from "react-router-dom";

export function Breadcrumbs(props: { children: any }) {
    return <div className="govuk-breadcrumbs">
        <ol className="govuk-breadcrumbs__list">
            {props.children}
        </ol>
    </div>
}

export function Breadcrumb(props: { name: string, url?: string, legacy?:boolean }) {
    if(props.legacy)
    {
        return <li className="govuk-breadcrumbs__list-item">
            <a href={props.url} className="govuk-breadcrumbs__link">{props.name}</a>
        </li>
    }
    if (props.url === undefined) {
        return <li className="govuk-breadcrumbs__list-item" aria-current="page">
            {props.name}
        </li>
    } else {
        return <li className="govuk-breadcrumbs__list-item">
            <Link to={props.url} className="govuk-breadcrumbs__link">{props.name}</Link>
        </li>
    }
}