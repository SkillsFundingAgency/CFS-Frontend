import React, {useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {
    createSpecificationService,
    getFundingPeriodsByFundingStreamIdService,
    getFundingStreamsService
} from "../../services/specificationService";
import {FundingPeriod} from "../../types/viewFundingTypes";
import {getProviderByFundingStreamIdService} from "../../services/providerVersionService";
import {CoreProviderSummary} from "../../types/CoreProviderSummary";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Banner} from "../../components/Banner";
import {CreateSpecificationViewModel} from "../../types/Specifications/CreateSpecificationViewModel";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ErrorSummary} from "../../components/ErrorSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Section} from "../../types/Sections";

export function CreateSpecification() {
    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View specifications",
            url: "/app/SpecificationsList"
        },
        {
            name: "Create specification",
            url: null
        }
    ];

    const [fundingStreamData, setFundingStreamData] = useState<string[]>([]);
    const [fundingPeriodData, setFundingPeriodData] = useState<FundingPeriod[]>([]);
    const [coreProviderData, setCoreProviderData] = useState<CoreProviderSummary[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("");
    const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>("");
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [formValid, setFormValid] = useState({
        formSubmitted: false,
        formValid: false
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffectOnce(() => {
        const getStreams = async () => {
            const streamResult = await getFundingStreamsService();
            setFundingStreamData(streamResult.data);
        };
        getStreams().then(result => {
            return true;
        });
    });

    function populateFundingPeriods(fundingStream: string) {
        if (fundingStream !== "") {
            const getFundingPeriods = async () => {
                const periodResult = await getFundingPeriodsByFundingStreamIdService(fundingStream);
                setFundingPeriodData(periodResult.data)
            };
            getFundingPeriods().then(result => {
                return true;
            });
        }
    }

    function populateCoreProviders(fundingPeriod: string) {
        if (fundingPeriod !== "") {
            const getCoreProviders = async () => {
                const coreProviderResult = await getProviderByFundingStreamIdService(fundingPeriod);
                setCoreProviderData(coreProviderResult.data)
            };
            getCoreProviders().then(result => {
                return true;
            });
        }
    }

    function saveSpecificationName(e: React.ChangeEvent<HTMLInputElement>) {
        const specificationName = e.target.value;
        setSelectedName(specificationName);
    }

    function selectFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingStreamId = e.target.value;
        setSelectedFundingStream(fundingStreamId);
        populateFundingPeriods(fundingStreamId);
        populateCoreProviders(fundingStreamId);
    }

    function selectFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        const fundingPeriodId = e.target.value;
        setSelectedFundingPeriod(fundingPeriodId);
    }

    function selectCoreProvider(e: React.ChangeEvent<HTMLSelectElement>) {
        const coreProviderId = e.target.value;
        setSelectedProviderVersionId(coreProviderId);
    }

    function saveDescriptionName(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const specificationDescription = e.target.value;
        setSelectedDescription(specificationDescription);
    }

    function submitSaveSpecification() {
        if (selectedName !== "" && selectedFundingStream !== "" && selectedFundingPeriod !== "" && selectedProviderVersionId !== "" && selectedDescription !== "") {
            setFormValid({formValid: true, formSubmitted: true});
            setIsLoading(true);
            let createSpecificationViewModel: CreateSpecificationViewModel = {
                description: selectedDescription,
                fundingPeriodId: selectedFundingPeriod,
                fundingStreamId: selectedFundingStream,
                name: selectedName,
                providerVersionId: selectedProviderVersionId
            };

            const createSpecification = async () => {
                const createSpecificationResult = await createSpecificationService(createSpecificationViewModel);
                return createSpecificationResult;
            };

            createSpecification().then((result) => {

                if (result.status === 200) {
                    let response = result.data as SpecificationSummary;
                    window.location.href = `/app/ViewSpecification/${response.id}`
                } else {
                    setIsLoading(false);
                }
            }).catch(() => {
                setIsLoading(false);
            });
        } else {
            setFormValid({formSubmitted: true, formValid: false})
        }
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-main-wrapper">
                <LoadingStatus title={"Creating Subscription"}
                               subTitle={"Please wait whilst we create the specification"}
                               description={"This can take a few minutes"} id={"create-specification"}
                               hidden={!isLoading}/>
                <fieldset className="govuk-fieldset" id="create-specification-fieldset" hidden={isLoading}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Create specification
                        </h1>
                    </legend>
                    <div className="govuk-form-group"
                         hidden={(!formValid.formValid && !formValid.formSubmitted) || (formValid.formValid && formValid.formSubmitted)}>
                        <ErrorSummary title="Form not valid" error="Please complete all fields" suggestion=""/>
                    </div>
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="address-line-1">
                            Specification name
                        </label>
                        <input className="govuk-input" id="address-line-1" name="address-line-1" type="text"
                               onChange={(e) => saveSpecificationName(e)}/>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding streams
                        </label>
                        <select className="govuk-select" id="sort" name="sort" onChange={(e) => selectFundingStream(e)}>
                            <option value="-1">Select funding Stream</option>
                            {fundingStreamData.map((fs, index) => <option key={index} value={fs}>{fs}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding period
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={fundingPeriodData.length === 0} onChange={(e) => selectFundingPeriod(e)}>
                            <option value="-1">Select funding period</option>
                            {fundingPeriodData.map((fp, index) => <option key={index} value={fp.id}>{fp.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Core provider data
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={coreProviderData.length === 0} onChange={(e) => selectCoreProvider(e)}>
                            <option value="-1">Select core provider</option>
                            {coreProviderData.map((cp, index) => <option key={index}
                                                                         value={cp.providerVersionId}>{cp.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            Can you provide more detail?
                        </label>
                        <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8}
                                  aria-describedby="more-detail-hint"
                                  onChange={(e) => saveDescriptionName(e)}></textarea>
                    </div>
                    <div className="govuk-form-group">
                        <button id="submit-specification-button" className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                                onClick={submitSaveSpecification}>
                            Save and continue
                        </button>
                        <a id="cancel-create-specification" href="/app/SpecificationsList" className="govuk-button govuk-button--secondary"
                           data-module="govuk-button">
                            Cancel
                        </a>
                    </div>
                </fieldset>
            </div>
        </div>
        <Footer/>
    </div>
}