import * as React from 'react';
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import {Footer} from "../components/Footer";
import {ApproveStatusButton} from "../components/ApproveStatusButton";
import {Navigation, NavigationLevel} from "../components/Navigation";
import {IFundingStructureItem, FundingStructureType} from "../types/FundingStructureItem";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Specification} from "../types/viewFundingTypes";

export interface IFundingLineStructureProps {
    getFundingLineStructure: any;
    getSpecificationById: any;
    changeFundingLineState: any;
    fundingLineStructureResult: IFundingStructureItem[];
    specificationResult: Specification;
    fundingLineStatusResult: string;
}

export default class FundingLineStructurePage extends React.Component<IFundingLineStructureProps, {}> {
    componentDidMount(): void {
        this.props.getSpecificationById();
        document.title = "Funding Line Structure - Calculate Funding";
    }

    render() {
        let breadcrumbs: IBreadcrumbs[] = [
            {
                url: "/",
                name: "Calculate Funding"
            },
            {
                url: "/app/approvals",
                name: "Specifications"
            },
            {
                url: null,
                name: this.props.specificationResult ? (this.props.specificationResult.name) : ('')
            }];
        let fundingLines;
        if (this.props.fundingLineStructureResult != null) {
            fundingLines = this.props.fundingLineStructureResult.map(f => {
                let calculationId = <span>{f.name}</span>;
                if (f.calculationId != null) {
                    calculationId = <a className={"govuk-link"} href={"/calcs/editTemplateCalculation/" + f.calculationId}>{f.name}</a>;
                }
                return <tr
                    className={"govuk-table__row " + (f.level === 1 ? ('govuk-!-font-weight-bold') : (''))}>
                    <td className="govuk-table__cell">{f.level}</td>
                    <td className="govuk-table__cell">{FundingStructureType[f.type]}</td>
                    <td className="govuk-table__cell">{calculationId}</td>
                </tr>
            });
        }
        let banner = <span/>;
        let specId = "";
        if (this.props.specificationResult != null) {
            specId = this.props.specificationResult.id;
            let fundingStreams = this.props.specificationResult.fundingStreams;
            let fundingStreamNames = fundingStreams.map(f =>
                <p className="govuk-!-font-weight-regular">{f.name}</p>
            );
            if (fundingStreams.length > 0 && this.props.fundingLineStructureResult.length === 0) {
                this.props.getFundingLineStructure(specId, fundingStreams[0].id);
            }
            let specName = this.props.specificationResult.name;
            let fundingPeriod = this.props.specificationResult.fundingPeriod.name;
            let editSpecificationUrl = "/specs/editspecification/" + specId + "?returnPage=ManagePolicies";
            let createCalculationUrl = "/calcs/createadditionalcalculation/" + specId;
            let editDatasetUrl = "/datasets/AssignDatasetSchema/" + specId;

            banner =
                <Banner bannerType='WholeBlue' breadcrumbs={breadcrumbs} title="" subtitle="">
                    <div className="govuk-body banner-link-container">
                        <div className="banner-link-left-container">
                            <p className="govuk-!-font-weight-bold">Specification name:</p>
                            <h1 className="govuk-heading-xl">{specName}</h1>
                            <p className="govuk-!-font-weight-bold">Funding period:</p>
                            <p className="govuk-!-font-weight-regular">{fundingPeriod}</p>
                            <p className="govuk-!-font-weight-bold">Funding streams:</p>
                            {fundingStreamNames}
                        </div>
                        <div className="banner-link-right-container">
                            <div>
                                <a className="govuk-!-font-weight-regular" href={editSpecificationUrl}>Edit specification</a>
                            </div>
                            <div>
                                <a className="govuk-!-font-weight-regular" href={createCalculationUrl}>Create additional calculation</a>
                            </div>
                            <div>
                                <a className="govuk-!-font-weight-regular" href={editDatasetUrl}>Create dataset</a>
                            </div>
                        </div>
                    </div>
                </Banner>;
        }

        let fundingLineStatus = this.props.specificationResult.approvalStatus;
        if (this.props.fundingLineStatusResult !== null && this.props.fundingLineStatusResult !== "")
            fundingLineStatus = this.props.fundingLineStatusResult;

        return <div>
            <Header/>
            <Navigation currentNavigationLevel={NavigationLevel.Specification}/>
            {banner}
            <main className='govuk-main-wrapper govuk-main-wrapper--l govuk-width-container'>

                <div className="govuk-tabs" data-module="govuk-tabs">
                    <h2 className="govuk-tabs__title">
                        Contents
                    </h2>
                    <ul className="govuk-tabs__list">
                        <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                            <a className="govuk-tabs__tab" href="#past-day">
                                Funding Line Structure
                            </a>
                        </li>
                        <li className="govuk-tabs__list-item">
                            <a className="govuk-tabs__tab" href={"/calcs/additionalcalculations/" + specId}
                               role="tab" aria-selected="true">Additional calculations</a>
                        </li>
                        <li className="govuk-tabs__list-item">
                            <a className="govuk-tabs__tab" href={"/datasets/listdatasetschemas/" + specId}
                               role="tab" aria-selected="false">
                                    <span className="provider-datasets-warning-tab">
                                        <span>Datasets</span>
                                    </span>
                            </a>
                        </li>
                        <li className="govuk-tabs__list-item">
                            <a className="govuk-tabs__tab" href={"/specs/releasetimetable/" + specId} role="tab"
                               aria-selected="true">Release timetable</a>
                        </li>
                        <li className="nav-item funding-line-status-container">
                            <ApproveStatusButton id={this.props.specificationResult.id}
                                                 status={fundingLineStatus}
                                                 callback={this.props.changeFundingLineState}/>
                        </li>
                    </ul>
                    <section className="govuk-tabs__panel" id="past-day">
                        <table className="govuk-table funding-lines-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">Level</th>
                                <th scope="col" className="govuk-table__header">Calculation Type</th>
                                <th scope="col" className="govuk-table__header"></th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                                {fundingLines}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
            <Footer/>
        </div>;
    }
}

