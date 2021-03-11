import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Footer} from "../../components/Footer";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {AutoComplete} from "../../components/AutoComplete";
import {getFundingStreamsService} from "../../services/policyService";
import {FundingStream} from "../../types/viewFundingTypes";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import {BackAnchor} from "../../components/BackAnchor";

export function ViewProvidersFundingStreamSelection() {
    const {errors, addError} = useErrors();
    const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream | undefined>();
    const [isFormValid, setIsFormValid] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    useEffectOnce(() => {
        async function loadFundingStreams() {
            try {
                setIsLoading(true);
                const result = await getFundingStreamsService(false);
                setFundingStreams(result.data);
            } catch (err) {
                addError({error: err, description: `An error occurred while loading funding streams.`});
            } finally {
                setIsLoading(false);
            }
        }

        loadFundingStreams();
    });

    function updateFundingStreamSelection(e: string) {
        const result = fundingStreams.filter(x => x.name === e)[0];
        if (result) {
            setSelectedFundingStream(result);
            setIsFormValid(true);
        } else {
            setSelectedFundingStream(undefined);
        }
    }

    function submit() {
        if (selectedFundingStream) {
            history.push(`/viewresults/ViewProvidersByFundingStream/${selectedFundingStream.id}`);
        } else {
            setIsFormValid(false);
        }
    }

    function goBack() {
        history.goBack();
    }

    return <div>
        <Header location={Section.Results} />
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"} />
                <Breadcrumb name={"View results"} url={"/results"} />
                <Breadcrumb name={"Select funding stream"} />
            </Breadcrumbs>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors} />
                </div>
            </div>
            {isLoading &&
                <LoadingStatus title={"Loading funding streams"}
                    description={"Please wait whilst funding streams are loading"} />}
            {!isLoading &&
                <div className="govuk-main-wrapper">
                    <div className={"govuk-form-group" + (!isFormValid ? " govuk-form-group--error" : "")}>
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                                    Select funding stream
                                </h1>
                                <span className="govuk-caption-xl govuk-!-margin-bottom-6">Select the funding you wish to view providers for</span>
                            </legend>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-one-third">
                                    <label className="govuk-label">
                                        Select a funding stream
                                    </label>
                                    {isLoading ?
                                        <div className="loader-inline">
                                            <LoadingFieldStatus title={"loading funding streams"} />
                                        </div>
                                        :
                                        <AutoComplete suggestions={fundingStreams.map(fs => fs.name)}
                                            callback={updateFundingStreamSelection}
                                            disabled={isLoading} />
                                    }
                                    {!isFormValid &&
                                        <span className="govuk-error-message govuk-!-margin-bottom-1">
                                            <span data-testid="validation-error" className="govuk-visually-hidden">Error:</span> Select a funding stream
                                        </span>}
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                            <button className="govuk-button"
                                type="button"
                                aria-label="Continue"
                                onClick={submit}>
                                Continue
                            </button>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-third">
                            <BackAnchor name="Back" callback={goBack} />
                        </div>
                    </div>
                </div>
            }
        </div>
        <Footer />
    </div>
}