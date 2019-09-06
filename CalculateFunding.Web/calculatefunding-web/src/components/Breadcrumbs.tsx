
import * as React from 'react';
import {Component} from "react";

export class Breadcrumbs extends Component<{},{}>{
    render(){
        return <div className="breadcrumbs">
            <ol>
                {this.props.children}
            </ol>
        </div>
    }
}