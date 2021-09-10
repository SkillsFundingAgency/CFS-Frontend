import * as React from "react";

interface INavigationLevel {
  currentNavigationLevel: NavigationLevel;
}

export enum NavigationLevel {
  Home,
  Specification,
  ManageData,
  ViewResult,
  FundingApproval,
  Templates,
}

export class Navigation extends React.Component<INavigationLevel, {}> {
  render() {
    const activeStyle = "app-navigation__list-item--current";
    const normalStyle = "app-navigation__list-item ";

    return (
      <nav className="app-navigation govuk-clearfix">
        <ul className="app-navigation__list govuk-width-container">
          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.Home
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/"
              data-topnav="Get started"
            >
              Home
            </a>
          </li>

          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.Specification
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/specs"
              data-topnav="Styles"
            >
              Specifications
            </a>
          </li>

          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.ManageData
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/datasets"
              data-topnav="Components"
            >
              Manage Data
            </a>
          </li>

          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.ViewResult
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/results"
              data-topnav="Community"
            >
              View results
            </a>
          </li>
          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.FundingApproval
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/app/viewfunding"
              data-topnav="Community"
            >
              Funding approvals
            </a>
          </li>
          <li
            className={
              this.props.currentNavigationLevel === NavigationLevel.Templates
                ? normalStyle + activeStyle
                : normalStyle
            }
          >
            <a
              className="govuk-link govuk-link--no-visited-state app-navigation__link"
              href="/app/templates/List"
              data-topnav="Community"
            >
              Templates
            </a>
          </li>
        </ul>
      </nav>
    );
  }
}
