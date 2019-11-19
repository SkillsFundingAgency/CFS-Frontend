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
        fetch("https://localhost:59842/account/IsAuthenticated", {
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
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <main role="main">
                <div className="container" id="root">
                </div>
            </main>
            <Footer/>

        </div>
    }
}