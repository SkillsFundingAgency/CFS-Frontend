import * as React from 'react';
import {Component} from "react";

export class Breadcrumbs extends Component<{}, {}> {

    render() {
        return <div className="govuk-breadcrumbs">
            <ol className="govuk-breadcrumbs__list">
                {this.props.children}
            </ol>
        </div>
    }
}