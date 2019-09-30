import * as React from "react"
import {Breadcrumbs} from "./Breadcrumbs";

interface IBannerTypes {
    bannerType:string;
}

export class Banner extends React.Component<IBannerTypes,{}>{
    render(){
        if(this.props.bannerType === "Left")
        {
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
                <section className="banner-container">
                    <div className="container">
                        <div className="row">
                            <div className="col-xs-9">
                               <Breadcrumbs>
                                   {this.props.children}
                               </Breadcrumbs>
                            </div>
                            <div className="col-xs-3">
                                <div className="banner-container-right">
                                </div>

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

        if(this.props.bannerType === "Whole")
        {
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
        if(this.props.bannerType === "FormLeft")
        {
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

        return <div/>
    }
}