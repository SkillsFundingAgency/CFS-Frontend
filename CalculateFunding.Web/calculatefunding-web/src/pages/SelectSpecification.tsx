import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import * as React from "react";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {Footer} from "../components/Footer";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../states/AppState";
import {SelectSpecificationState} from "../states/SelectSpecificationState";
import {useEffect} from "react";
import {
    getFundingPeriodsByFundingStreamId,
    getFundingStreams,
    getSpecificationsByFundingPeriodAndStreamId
} from "../actions/SelectSpecificationActions";
import {useState} from "react";

export interface SelectSpecificationProps {
    fundingStreams: string[];
}

export function SelectSpecification(props: SelectSpecificationProps) {
    const dispatch = useDispatch();
    const [selectedFundingStreamId, setSelectedFundingStreamId] = useState('');
    const [selectedSpecificationId, setSpecificationId] = useState('');

    let selectSpecification: SelectSpecificationState = useSelector((state: AppState) => state.selectSpecification);

    document.title = "Select Specification - Calculate Funding";

    if (selectSpecification.fundingStreams.length === 0)
        dispatch(getFundingStreams());

    useEffect(() => {
        dispatch(getFundingPeriodsByFundingStreamId(selectedFundingStreamId));
    }, [selectedFundingStreamId]);

    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View results",
            url: "/app/results"
        },
        {
            name: "Select specification",
            url: null
        }
    ];

    function updateFundingPeriods(event: React.ChangeEvent<HTMLSelectElement>) {
        const filter = event.target.value;
        setSelectedFundingStreamId(filter);
        dispatch(getFundingPeriodsByFundingStreamId(filter));
    }

    function updateSpecifications(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedFundingPeriodId = event.target.value;
        dispatch(getSpecificationsByFundingPeriodAndStreamId(selectedFundingStreamId, selectedFundingPeriodId));
    }

    function setSpecification(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpecificationId(event.target.value);
    }

    return <div>
        <Header/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h2 className="govuk-heading-l">Select specification</h2>
                    <span className="govuk-caption-m">You can select the specification and funding period.</span>
                </div>
            </div>
            <div className="govuk-main-wrapper govuk-main-wrapper--l">
                <fieldset className="govuk-fieldset">
                    <div className="govuk-form-group">
                        <label htmlFor="select-funding-stream" className="govuk-label">Select funding stream:</label>
                        <select id="select-funding-stream" className="govuk-select"
                                disabled={selectSpecification.fundingStreams.length === 0}
                                onChange={(e) => {
                            updateFundingPeriods(e)
                        }}>
                            <option>Please select a funding stream</option>
                            {selectSpecification.fundingStreams.map(fs =>
                                <option key={fs} value={fs}>{fs}</option>
                            )}
                        </select>
                    </div>
                </fieldset>
                <fieldset className="govuk-fieldset">
                    <div className="govuk-form-group">
                        <label htmlFor="select-provider" className="govuk-label">Select funding
                            period:</label>
                        <select id="select-provider" className="govuk-select" placeholder="Please select"
                                disabled={selectSpecification.fundingPeriods.length === 0}
                                onChange={(e) => {
                                    updateSpecifications(e)
                                }}>
                            <option>Please select a funding period</option>
                            {selectSpecification.fundingPeriods.map(fp =>
                                <option key={fp.id} value={fp.id}>{fp.name}</option>
                            )}
                        </select>
                    </div>
                </fieldset>
                <fieldset className="govuk-fieldset">
                    <div className="govuk-form-group">
                        <label htmlFor="select-provider" className="govuk-label">Select specification:</label>
                        <select id="select-provider" className="govuk-select" placeholder="Please select"
                                disabled={selectSpecification.specifications.length === 0}
                                onChange={(e) => {
                                    setSpecification(e)
                                }}>
                            <option key={''} value={''}>Please select a specification</option>
                            {selectSpecification.specifications.map(fp =>
                                <option key={fp.id} value={fp.id}>{fp.name}</option>
                            )}
                        </select>
                    </div>
                </fieldset>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <a href={selectedSpecificationId === ''? `#` : `/app/ViewSpecificationResults/${selectedSpecificationId}`} role="button"
                           className={`govuk-button govuk-button ${selectedSpecificationId === ''? "govuk-button--disabled":"govuk-button govuk-button"}`}
                           data-module="govuk-button">
                            Continue
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}