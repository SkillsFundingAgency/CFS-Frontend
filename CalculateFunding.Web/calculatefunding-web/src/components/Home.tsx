import * as React from "react"
import {Component} from "react";
import {Header} from "./Header";
import {Footer} from "./Footer";
import {Banner} from "./Banner";


export class Home extends Component<{}, {}> {
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
        return <div>
            <Header/>
            <Banner bannerType="None" />
            <main role="main">
                <div className="container" id="root">
                </div>
            </main>
            <Footer/>

        </div>
    }
}