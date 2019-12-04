import * as React from "react"
import {Breadcrumbs} from "./Breadcrumbs";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

interface IBannerTypes {
    bannerType: string;
    breadcrumbs: IBreadcrumbs[];
    title: string;
    subtitle: string;
}

export class UserDetails extends React.Component<{}, {}> {
    render() {
               return  <div className="user-container">
                   <i className="material-icons circle-icon">person</i>
                   <span id="userName">TEST</span>
               </div>
    }
}