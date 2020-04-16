import React from "react";
import {Section} from "../types/Sections";

export function Header(props: {location:Section}) {

    const windowLocation = window.location.href;
    let environment = "";

    if (windowLocation.includes("https://dv.")) {
        environment = "(Development)";
    }
    if (windowLocation.includes("http://localhost")) {
        environment = "(Development)";
    }
    if (windowLocation.includes("https://localhost")) {
        environment = "(Development)";
    }
    if (windowLocation.includes("https://te.")) {
        environment = "(Test)";
    }
    if (windowLocation.includes("https://pp.")) {
        environment = "(Pre-Production)";
    }

    return <>
        <header className="govuk-header " role="banner" data-module="govuk-header">
            <div className="govuk-header__container govuk-width-container">
                <div className="govuk-header__logo">
                    <a href="/app" className="govuk-header__link govuk-header__link--homepage">
        <span className="govuk-header__logotype">
          <svg role="presentation" focusable="false" className="govuk-header__logotype-crown"
               xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 97" height="30" width="36">
            <img src="/assets/images/govuk-logotype-crown.png" className="govuk-header__logotype-crown-fallback-image"
                 width="36" height="32" alt={"govuk logo"}/>
          </svg>
          <span className="govuk-header__logotype-text">
            GOV.UK
          </span>
        </span>
                    </a>
                </div>
                <div className="govuk-header__content">
                    <span className="govuk-header__product-name">
                        Calculate funding service {environment}
                    </span>
                    <button type="button" className="govuk-header__menu-button govuk-js-header-toggle"
                            aria-controls="navigation" aria-label="Show or hide Top Level Navigation">Menu
                    </button>
                    <nav>
                        <ul id="navigation" className="govuk-header__navigation " aria-label="Top Level Navigation">
                            <li className={"govuk-header__navigation-item" + (props.location == Section.Home ? " govuk-header__navigation-item--active" : "")}>
                                <a className="govuk-header__link" href="/app">
                                    Home
                                </a>
                            </li>
                            <li className={"govuk-header__navigation-item" + (props.location == Section.Specifications ? " govuk-header__navigation-item--active" : "")}>
                                <a className="govuk-header__link" href="/app/SpecificationsList">
                                    Specifications
                                </a>
                            </li>
                            <li className={"govuk-header__navigation-item" + (props.location == Section.Datasets ? " govuk-header__navigation-item--active" : "")}>
                                <a className="govuk-header__link" href="/datasets">
                                    Manage data
                                </a>
                            </li>
                            {/*<li className={"govuk-header__navigation-item" + (props.location == Section.Tests ? " govuk-header__navigation-item--active" : "")}>*/}
                            {/*    <a className="govuk-header__link"*/}
                            {/*       href="/scenarios">*/}
                            {/*        Quality assurance tests*/}
                            {/*    </a>*/}
                            {/*</li>*/}
                            <li className={"govuk-header__navigation-item" + (props.location == Section.Results ? " govuk-header__navigation-item--active" : "")}>
                                <a className="govuk-header__link" href="/app/results">
                                    View results
                                </a>
                            </li>
                            <li className={"govuk-header__navigation-item" + (props.location == Section.Approvals ? " govuk-header__navigation-item--active" : "")}>
                                <a className="govuk-header__link" href="/approvals">
                                    Funding approvals
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
        <div className="govuk-width-container">
            <div className="govuk-phase-banner">
                <p className="govuk-phase-banner__content">
                    <strong className="govuk-tag govuk-phase-banner__content__tag">
                        beta
                    </strong>
                    <span className="govuk-phase-banner__text">
      This is a new service – your <a className="govuk-link" href="/get-in-touch">feedback</a> will help us to improve it.
    </span>
                </p>
                <hr/>
            </div>
        </div>
    </>
}
