import * as React from "react"

interface INavigationLevel {
    currentNavigationLevel: NavigationLevel;
}

export enum NavigationLevel {
    Home,
    Specification,
    ManageData,
    QualityTests,
    ViewResult,
    FundingApproval
}

export class Navigation extends React.Component<INavigationLevel,{}>{
    render(){
        const activeStyle = "navbar-item-overlay navbar-item-overlay-active";
        const normalStyle = "navbar-item-overlay";

        return <nav className="navbar navbar-default">
            <div className="container navbar-container">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                            data-target="#cfs-navbar-collapse" aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>
                <div className="collapse navbar-collapse navbar-container" id="cfs-navbar-collapse">
                    <ul className="nav navbar-nav">
                        <li>
                            <div className="navbar-item-container">
                                <a href="/">Home</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.Home ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="navbar-item-container">
                                <a href="/specs">Specifications</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.Specification ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="navbar-item-container">
                                <a href="/datasets">Manage Data</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.ManageData ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="navbar-item-container">
                                <a href="/scenarios">Quality assurance tests</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.QualityTests ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="navbar-item-container">
                                <a href="/results">View results</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.ViewResult ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="navbar-item-container">
                                <a href="/app/viewfunding">Funding approvals</a>
                                <div className={this.props.currentNavigationLevel === NavigationLevel.FundingApproval ? (activeStyle) : (normalStyle)}>
                                    <img alt="Selected" src="/assets/images/navbar_selected.png"/>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    }
}