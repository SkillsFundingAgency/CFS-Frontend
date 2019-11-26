import * as React from "react"
import {Breadcrumbs} from "./Breadcrumbs";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

interface IBannerTypes {
    bannerType: string;
    breadcrumbs: IBreadcrumbs[];
    title: string;
    subtitle: string;
}

export class Banner extends React.Component<IBannerTypes, {}> {
    render() {
        if (this.props.bannerType === "Left") {
            return <section className="banner-container">
                <div className="container">
                    <div className="row">
                        <div className="col-xs-9">
                            <Breadcrumbs>
                                {this.props.breadcrumbs.map(bread =>
                                    (bread.url != null) ?
                                        (<li key={bread.name}><a href={bread.url}>{bread.name}</a></li>) :
                                        (<li key={bread.name}>{bread.name}</li>)
                                )}
                            </Breadcrumbs>
                        </div>
                        <div className="col-xs-3">
                            <div className="banner-container-right">

                            </div>

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <h1 className="hero-title">{this.props.title}</h1>
                            <h2 className="hero-description">{this.props.subtitle}</h2>
                        </div>
                    </div>
                </div>
            </section>
        }

        if (this.props.bannerType === "Whole") {
            return <div>
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12 spacing-15">
                            <div className="govuk-beta-label">

                                <strong className="phase-tag">Beta</strong>
                                <span>
                            Complete our quick 5-question survey to <a target="_blank" rel="noopener noreferrer"
                                                                       href="https://www.smartsurvey.co.uk/s/cfsbeta/">help us improve the service</a>.

                        </span>
                            </div>

                        </div>
                    </div>
                </div>
                <section className="banner-link-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-xs-9">
                                <Breadcrumbs>
                                    {this.props.children}
                                </Breadcrumbs>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        }
        if (this.props.bannerType === "FormLeft") {
            return <div>
                <div className="container form-banner-container-beta">
                    <div className="row">
                        <div className="col-xs-12 form-banner-container-beta-col">
                            <div className="govuk-beta-label">

                                <strong className="phase-tag">Beta</strong>
                                <span>
                            Complete our quick 5-question survey to <a target="_blank" rel="noopener noreferrer"
                                                                       href="https://www.smartsurvey.co.uk/s/cfsbeta/">help us improve the service</a>.

                        </span>
                            </div>
                            <hr className="spacing-15"/>
                        </div>
                    </div>
                </div>
                <section className="form-banner-container">
                    <div className="container">
                        <div className="row">
                            <div className="col-xs-9">
                                <div className="form-banner-container-left">
                                    <Breadcrumbs>
                                        {this.props.children}
                                    </Breadcrumbs>
                                </div>
                            </div>
                            <div className="col-xs-3">
                                <div className="form-banner-container-right">
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
            </div>
        }
        if (this.props.bannerType === "WholeBlue") {
            return <section className="banner-container">
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12">
                            <Breadcrumbs>
                                {this.props.breadcrumbs.map(bread =>
                                    (bread.url != null) ?
                                        (<li key={bread.name}><a href={bread.url}>{bread.name}</a></li>) :
                                        (<li>{bread.name}</li>)
                                )}
                            </Breadcrumbs>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </section>
        }
        return <div/>
    }
}