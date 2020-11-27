import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {getFundingStreamIdsWithSpecsService} from "../../services/specificationService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Footer} from "../../components/Footer";

export function ViewProvidersFundingStreamSelection() {
    const [fundingStreams, setFundingStreams] = useState<string[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [isFormValid, setIsFormValid] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    useEffectOnce(() => {
        setIsLoading(true);
        getFundingStreamIdsWithSpecsService().then((result) => {
            setIsLoading(false);
            setFundingStreams(result.data);
        })
    });

    function changeFundingStream(e: React.ChangeEvent<HTMLInputElement>) {
        const fundingStream = e.target.value;
        setSelectedFundingStream(fundingStream)
    }

    function submit() {
        if (selectedFundingStream !== "")
        {
            history.push(`/viewresults/ViewProvidersByFundingStream/${selectedFundingStream}`);
        }
        setIsFormValid(false);
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
              <Breadcrumb name={"Calculate funding"} url={"/"} />
              <Breadcrumb name={"View results"} url={"/results"} />
              <Breadcrumb name={"Select funding stream"} />
            </Breadcrumbs>
            <LoadingStatus title={"Loading funding streams"}
                           hidden={!isLoading}
                           description={"Please wait whilst funding streams are loading"}/>
            {
                !isLoading ?
                    <div hidden={isLoading} className="govuk-main-wrapper">
                        <div hidden={isFormValid} className="govuk-error-summary" aria-labelledby="error-summary-title"
                             role="alert"
                             data-module="govuk-error-summary">
                            <h2 className="govuk-error-summary__title" id="error-summary-title">
                                There is a problem
                            </h2>
                            <div className="govuk-error-summary__body">
                                <ul className="govuk-list govuk-error-summary__list">
                                    <li>
                                        <a href={"#funding-stream-selection"}>Select the funding stream you wish to view
                                            providers for</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className={"govuk-form-group" + (!isFormValid ? " govuk-form-group--error" : "")}>
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading">
                                        Select funding stream
                                    </h1>
                                    <span
                                        className="govuk-caption-m">Select the funding you wish to view providers for.</span>
                                    {
                                        (!isFormValid) ?
                                            <span className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span>
                                        Select the funding stream you wish to view providers for
                                    </span>
                                            : null
                                    }
                                </legend>
                                <div className="govuk-radios" id={"funding-stream-selection"}>
                                    {
                                        fundingStreams.map((fs, index) => <div key={index} className="govuk-radios__item">
                                                <input className="govuk-radios__input" name="funding-streams"
                                                       type="radio" value={fs} onChange={changeFundingStream}/>
                                                <label className="govuk-label govuk-radios__label">
                                                    {fs}
                                                </label>
                                            </div>
                                        )}
                                </div>
                            </fieldset>
                        </div>
                        <button className="govuk-button"
                                type="button"
                                aria-label="Continue"
                                onClick={submit}>
                            Continue
                        </button>
                    </div>
                    : null
            }
        </div>
        <Footer/>
    </div>
}