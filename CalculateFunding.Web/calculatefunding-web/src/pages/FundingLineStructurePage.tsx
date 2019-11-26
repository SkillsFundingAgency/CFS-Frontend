import * as React from 'react';
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import {Footer} from "../components/Footer";
import {IFundingStructureItem} from "../types/FundingStructureItem";
import {FundingStructureType} from "../types/FundingStructureItem";
import {Navigation} from "../components/Navigation";
import {NavigationLevel} from "../components/Navigation";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Specification} from "../types/viewFundingTypes";

export interface IFundingLineStructureProps {
    getFundingLineStructure: any;
    fundingLineStructureResult: IFundingStructureItem[];
    getSpecificationById: any;
    specificationResult: Specification;
}

export default class FundingLineStructurePage extends React.Component<IFundingLineStructureProps, {}> {
    componentDidMount(): void {
        this.props.getFundingLineStructure();
        this.props.getSpecificationById();
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
            fundingLines = this.props.fundingLineStructureResult.map(f =>
            {
                let calculationId = <span>{f.name}</span>;
                if (f.calculationId != null)
                {
                  calculationId = <a href={"/calcs/editTemplateCalculation/" + f.calculationId}>{f.name}</a>;
                }
                return <tr className={f.level === 1 ? ('funding-line-structure-level-1') : ('')}>
                    <td>{f.level}</td>
                    <td>{FundingStructureType[f.type]}</td>
                    <td>{calculationId}</td>
                </tr>
            });
        }
        let banner = <span/>;
        let whatIsSpecName = <span/>;
        let specId = "";
        if (this.props.specificationResult != null) {
            specId = this.props.specificationResult.id;
            let specName = this.props.specificationResult.name;
            {/*let specDescription = this.props.specificationResult.description;
            if (specDescription != null) {
                whatIsSpecName =
                   <div className="row">
                        <div className="col-xs-12 policy-spec-what ">
                            <p className="withjs-hide">What is {specName}</p>
                            <div className="inline-collapse-container spacing-15-bottom">
                                <div className="inline-collapse-heading withjs-show">
                                    <i className="inline-collapse-arrow"></i>
                                    <span>What is {specName}?</span>
                                </div>
                                <div className="inline-collapse-contents withjs-hide policy-spec-description">
                                    {specDescription}
                                </div>
                            </div>
                        </div>
                    </div>
            }*/
            }
            let fundingPeriod = this.props.specificationResult.fundingPeriod.name;
            let fundingStreams = this.props.specificationResult.fundingStreams.map(f =>
                <p className="hero-subtext">{f.name}</p>
            );

            let editSpecificationUrl = "/specs/editspecification/" + specId + "?returnPage=ManagePolicies";
            let createCalculationUrl = "/calcs/createadditionalcalculation/" + specId;
            let editDatasetUrl = "/datasets/AssignDatasetSchema/" + specId;

            banner =
                <Banner bannerType='WholeBlue' breadcrumbs={breadcrumbs} title="" subtitle="">
                    <div className="banner-link-container">
                        <div className="banner-link-left-container">
                            <p className="hero-text-bold">Specification name:</p>
                            <h1 className="hero-title-headed">{specName}</h1>
                            <p className="hero-text-bold">Funding period:</p>
                            <p className="hero-subtext">{fundingPeriod}</p>
                            <p className="hero-text-bold">Funding streams:</p>
                            {fundingStreams}
                        </div>
                        <div className="banner-link-right-container">
                            <div>
                                <a href={editSpecificationUrl}>Edit specification</a>
                            </div>
                            <div>
                                <a href={createCalculationUrl}>Create additional calculation</a>
                            </div>
                            <div>
                                <a href={editDatasetUrl}>Create dataset</a>
                            </div>
                        </div>
                    </div>
                </Banner>;
        }

        return <div>
            <Header/>
            <Navigation currentNavigationLevel={NavigationLevel.Specification}/>
            {banner}
            <main className='container'>
                <div className="edit-policy-container">

                    {whatIsSpecName}

                    <ul className="nav nav-tabs nav-tabs-pagenavigation spacing-15-bottom" id="managePoliciesTabs"
                        role="tablist">
                        <li className="nav-item active">
                            <a id="nav-policy-tab" href={"/specs/fundinglinestructure/" + specId}
                               role="tab" aria-selected="false">Funding Line Structure</a>
                        </li>
                        <li className="nav-item">
                            <a id="nav-policy-tab" href={"/calcs/additionalcalculations/" + specId}
                               role="tab" aria-selected="true">Additional calculations</a>
                        </li>
                        <li className="nav-item">
                            <a id="nav-dataset-tab" href={"/datasets/listdatasetschemas/" + specId}
                               role="tab" aria-selected="false">
                                    <span className="provider-datasets-warning-tab">
                                        <span>Datasets</span>
                                    </span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a id="nav-policy-tab" href={"/specs/releasetimetable/" + specId} role="tab"
                               aria-selected="true">Release timetable</a>
                        </li>
                    </ul>
                    <div className="row">
                        <div className="col-xs-12">
                            <table className="cf funding-lines-table" id="funding-lines-table">
                                <thead>
                                <tr>
                                    <th className="sticky-header">Level</th>
                                    <th className="sticky-header">Calculation Type</th>
                                    <th className="sticky-header"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {fundingLines}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>;
    }
}

