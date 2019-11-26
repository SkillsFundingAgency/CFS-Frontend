import * as React from "react"
import {Component} from "react";
import {Header} from "../components/Header";
import {Footer} from "../components/Footer";
import {Banner} from "../components/Banner";
import {IBreadcrumbs} from "../types/IBreadcrumbs";

export interface IHomeProps {
}

export class Home extends Component<IHomeProps, {}> {
    userIsAuthenticated() {
        // console.log("Fetching stuff")
        fetch("/api/account/IsAuthenticated", {
            method: 'GET'
        })
            .then(function (response) {
                let username = document.getElementById("username");

                if (username != null) {
                    username.innerText = "";
                }

            });

        document.title = "Calculate Funding";
    }


    componentDidMount() {
        this.userIsAuthenticated();
    }

    render() {

        let breadcrumbs: IBreadcrumbs[] = [
            {
                url: "/",
                name: "Calculate Funding"
            }];

        return <div>
            <Header/>
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Calculate funding" subtitle="Calculate funding, quality assure the results or approve funding."/>
            <main role="main">
                <div className="container" id="root">
                    <div className="homepage-section-container">
                        <div className="row">
                            <div className="col-xs-12 col-sm-4">
                                <div className="homepage-section-title">
                                    <a href="/specs" className="heading-medium">Specifications</a>
                                </div>
                                <div>Create and manage the specifications used to calculate funding.</div>
                            </div>
                            <div className="col-xs-12 col-sm-4">
                                <div className="homepage-section-title">
                                    <a href="/datasets" className="heading-medium">Manage data</a>
                                </div>
                                <div>Manage data source files or map them to datasets for a specification.</div>
                            </div>
                            <div className="col-xs-12 col-sm-4">
                                <div className="homepage-section-title">
                                    <a href="/scenarios" className="heading-medium">Quality assurance tests</a>
                                </div>
                                <div>Design tests to check calculations and data.</div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-4">
                                <div className="homepage-section-title">
                                    <a href="/results" className="heading-medium">View results</a>
                                </div>
                                <div>View results for providers, calculations and quality assurance tests.</div>
                            </div>
                            <div className="col-xs-12 col-sm-4">
                                <div className="homepage-section-title">
                                    <a href="/approvals" className="heading-medium">Funding approvals</a>
                                </div>
                                <div>Approve funding for providers and view how it's been calculated.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>

        </div>
    }
}