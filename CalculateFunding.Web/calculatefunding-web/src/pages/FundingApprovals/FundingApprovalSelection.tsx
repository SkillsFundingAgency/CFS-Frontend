import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {
    getFundingPeriodsByFundingStreamIdService,
    getFundingStreamsService,
    getSpecificationsByFundingPeriodAndStreamIdService
} from "../../services/specificationService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {FundingPeriod} from "../../types/viewFundingTypes";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";

export function FundingApprovalSelection() {

    const [fundingStreams, setFundingStreams] = useState<string[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("");
    const [selectedSpecification, setSelectedSpecification] = useState<string>("");
    const [fundingPeriods, setFundingPeriods] = useState<FundingPeriod[]>([]);
    const [isLoading, setIsLoading] = useState({
        fundingStreams: false,
        fundingPeriods: false,
        specification: false
    });


    useEffectOnce(() => {
        getFundingStreamsService().then((result) => {
            setFundingStreams(result.data);
        })
    });

    function populateFundingPeriod(fundingStream: string) {
        if (fundingStream === "") {
            setFundingPeriods([]);
            setSelectedSpecification("");
        } else {
            getFundingPeriodsByFundingStreamIdService(fundingStream).then((result) => {
                setFundingPeriods(result.data as FundingPeriod[])
            });
        }
    }

    function populateSpecification(fundingPeriod: string) {
        if (fundingPeriod === "") {
            setSelectedSpecification("")
        } else {
            getSpecificationsByFundingPeriodAndStreamIdService(selectedFundingStream, fundingPeriod).then((result) => {
                if (result.data.length > 0) {
                    setSelectedSpecification((result.data[0] as SpecificationSummary).id)
                }
            });
        }
    }

    function changeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStream = e.target.value;
        setSelectedFundingStream(fundingStream)
        populateFundingPeriod(fundingStream)
    }


    function changeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriod = e.target.value;
        setSelectedFundingPeriod(fundingPeriod)
        populateSpecification(fundingPeriod)
    }

    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
          <Breadcrumbs>
              <Breadcrumb name={"Calculate funding"} url={"/"} />
              <Breadcrumb name={"Funding approvals"} url={"/Approvals"} />
              <Breadcrumb name={"Select specification"} />
          </Breadcrumbs>

            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Select specification</h1>
                        <span className="govuk-caption-xl">You can select the specification and funding period.</span>
                    </div>
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="sort">
                        Funding stream
                    </label>
                    <select className="govuk-select" id="funding-streams" name="sort"
                            onChange={(e) => changeFundingStream(e)}>
                        <option></option>
                        {fundingStreams.map((fs, index) => <option key={index} value={fs}>{fs}</option>)}
                    </select>
                </div>
                <div className="govuk-form-group" hidden={fundingPeriods.length === 0}>
                    <label className="govuk-label" htmlFor="sort">
                        Funding period
                    </label>
                    <select className="govuk-select" id="funding-periods" name="sort" disabled={fundingPeriods.length === 0}
                            onChange={(e) => changeFundingPeriod(e)}>
                        <option value=""></option>
                        {fundingPeriods.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                    </select>
                </div>
                <div className="govuk-form-group" hidden={selectedSpecification === ""}>
                    <label className="govuk-label" >
                        Specification
                    </label>
                    <h3 className="govuk-heading-m">{selectedSpecification}</h3>

                    <Link to={`/approvals/FundingApprovalResults/${selectedFundingStream}/${selectedFundingPeriod}/${selectedSpecification}`}
                       className="govuk-button" data-module="govuk-button">
                        View funding
                    </Link>

                </div>
            </div>
        </div>
    </div>
}