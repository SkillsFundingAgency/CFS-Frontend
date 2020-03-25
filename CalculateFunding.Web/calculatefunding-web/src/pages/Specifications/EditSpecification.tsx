import React, {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {
    getFundingPeriodsByFundingStreamIdService,
    getFundingStreamsService,
    getSpecificationSummaryService, updateSpecificationService
} from "../../services/specificationService";
import {FundingPeriod} from "../../types/viewFundingTypes";
import {getProviderByFundingStreamIdService} from "../../services/providerVersionService";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Banner} from "../../components/Banner";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ErrorSummary} from "../../components/ErrorSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {RouteComponentProps} from "react-router";
import {Section} from "../../types/Sections";
import {EditSpecificationViewModel} from "../../types/Specifications/EditSpecificationViewModel";
import {CoreProviderSummary} from "../../types/CoreProviderSummary";
import {UpdateSpecificationViewModel} from "../../types/Specifications/UpdateSpecificationViewModel";

export interface EditSpecificationRouteProps {
    specificationId: string;
}

interface EditSpecificationFundingStream {
    name: string,
    value: string
    selected: boolean
}

interface EditSpecificationFundingPeriod {
    name: string,
    value: string
    selected: boolean
}

interface EditSpecificationCoreProvider {
    name: string,
    value: string
    selected: boolean
}


interface EditSpecificationSelection {
    fundingStreams: [{
        name: string,
        selected: boolean
    }]
}

export function EditSpecification({match}: RouteComponentProps<EditSpecificationRouteProps>) {
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
            name: "Edit specification",
            url: null
        }
    ];

    const specificationId = match.params.specificationId;

    const [specificationSummary, setSpecificationSummary] = useState<EditSpecificationViewModel>({
        id: "",
        name: "",
        description: "",
        fundingPeriod: {
            name: "",
            id: ""
        },
        providerVersionId: "",
        approvalStatus: "",
        isSelectedForFunding: false,
        fundingStreams: [],
        dataDefinitionRelationshipIds: [],
        templateIds: {
            PSG: ""
        }
    });
    const [fundingStreamData, setFundingStreamData] = useState<EditSpecificationFundingStream[]>([]);
    const [fundingPeriodData, setFundingPeriodData] = useState<EditSpecificationFundingPeriod[]>([]);
    const [coreProviderData, setCoreProviderData] = useState<EditSpecificationCoreProvider[]>([]);
    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedFundingStream, setSelectedFundingStream] = useState<string>("fundingStreamDefault");
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<string>("fundingPeriodDefault");
    const [selectedProviderVersionId, setSelectedProviderVersionId] = useState<string>("");
    const [selectedDescription, setSelectedDescription] = useState<string>("");
    const [formValid, setFormValid] = useState({
        formSubmitted: false,
        formValid: false
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffectOnce(() => {
        const getSpecification = async () => {
            const specificationResult = await getSpecificationSummaryService(specificationId);
            return specificationResult;
        };

        getSpecification().then((result) => {
            const specificationResult = result.data as EditSpecificationViewModel;
            setSpecificationSummary(specificationResult);
            setSelectedDescription(specificationResult.description);
        });
    });

    useEffect(() => {
        if (specificationSummary.id !== "") {

            setSelectedName(specificationSummary.name);
            const getFundingStreams = async () => {
                const fundingStreamResult = await getFundingStreamsService();
                return fundingStreamResult;
            };
            const getFundingPeriods = async (fundingStreamId: string) => {
                const fundingPeriodResult = await getFundingPeriodsByFundingStreamIdService(fundingStreamId);
                return fundingPeriodResult;
            };

            const getCoreProviders = async (fundingStreamId: string) => {
                const coreProviderResult = await getProviderByFundingStreamIdService(fundingStreamId);
                return coreProviderResult;
            };

            getFundingStreams().then((result) => {
                const fundingStreams = result.data as string[];
                fundingStreams.forEach(fundingStreamItem => {
                    let item: EditSpecificationFundingStream = {
                        name: fundingStreamItem,
                        value: fundingStreamItem,
                        selected: fundingStreamItem === specificationSummary.fundingStreams[0].id
                    };
                    setFundingStreamData(prevState => [...prevState, item]);

                    if (item.selected) {
                        setSelectedFundingStream(item.value);

                        getFundingPeriods(item.value).then((result) => {
                            const fundingPeriods = result.data as FundingPeriod[];
                            fundingPeriods.forEach(fundingPeriodItem => {
                                let item: EditSpecificationFundingPeriod = {
                                    name: fundingPeriodItem.name,
                                    value: fundingPeriodItem.id,
                                    selected: fundingPeriodItem.id === specificationSummary.fundingPeriod.id
                                };

                                setFundingPeriodData(prevState => [...prevState, item]);
                                if (item.selected) {
                                    setSelectedFundingPeriod(item.value)
                                }
                            });
                        });

                        getCoreProviders(item.value).then((result) => {
                            const fundingPeriods = result.data as CoreProviderSummary[];
                            fundingPeriods.forEach(coreProviderItem => {
                                let item: EditSpecificationCoreProvider = {
                                    name: coreProviderItem.name,
                                    value: coreProviderItem.providerVersionId,
                                    selected: coreProviderItem.providerVersionId === specificationSummary.providerVersionId
                                };

                                setCoreProviderData(prevState => [...prevState, item]);

                                if (item.selected) {
                                    setSelectedProviderVersionId(coreProviderItem.providerVersionId);
                                }
                            });
                        });

                        setSelectedDescription(specificationSummary.description);
                    }
                });
            });


        }
    }, [specificationSummary.id]);

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

    function submitUpdateSpecification() {
        if (selectedName !== "" && selectedFundingStream !== "" && selectedFundingPeriod !== "" && selectedProviderVersionId !== "" && selectedDescription !== "") {
            setFormValid({formValid: true, formSubmitted: true});
            setIsLoading(true);
            let updateSpecificationViewModel: UpdateSpecificationViewModel = {
                description: selectedDescription,
                fundingPeriodId: selectedFundingPeriod,
                fundingStreamId: selectedFundingStream,
                name: selectedName,
                providerVersionId: selectedProviderVersionId
            };

            const updateSpecification = async () => {
                const updateSpecificationResult = await updateSpecificationService(updateSpecificationViewModel, specificationId);
                return updateSpecificationResult;
            };

            updateSpecification().then((result) => {

                if (result.status === 200) {
                    let response = result.data as SpecificationSummary;
                    window.location.href = `/app/ViewSpecification/${specificationId}`
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
                <LoadingStatus title={"Updating Specification"}
                               subTitle={"Please wait whilst we update the specification"}
                               description={"This can take a few minutes"} id={"update-specification"}
                               hidden={!isLoading}/>
                <fieldset className="govuk-fieldset" id="update-specification-fieldset" hidden={isLoading}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Edit specification
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
                               value={selectedName}
                               onChange={(e) => saveSpecificationName(e)}/>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding streams
                        </label>
                        <select className="govuk-select" id="sort" name="sort" onChange={(e) => selectFundingStream(e)}>
                            <option value="-1">Select funding Stream</option>
                            {fundingStreamData.map((fs, index) => <option key={index} value={fs.value}
                                                                          selected={fs.selected}>{fs.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Funding period
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={fundingPeriodData.length === 0}
                                onChange={(e) => selectFundingPeriod(e)}>
                            <option value="-1">Select funding period</option>
                            {fundingPeriodData.map((fp, index) => <option key={index}
                                                                          value={fp.value} selected={fp.selected}>{fp.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="sort">
                            Core provider data
                        </label>
                        <select className="govuk-select" id="sort" name="sort" disabled={coreProviderData.length === 0}
                                onChange={(e) => selectCoreProvider(e)}>
                            <option value="-1">Select core provider</option>
                            {coreProviderData.map((cp, index) => <option key={index}
                                                                         value={cp.value} selected={cp.selected}>{cp.name}</option>)}
                        </select>
                    </div>

                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor="more-detail">
                            Can you provide more detail?
                        </label>
                        <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8}
                                  aria-describedby="more-detail-hint"
                                  onChange={(e) => saveDescriptionName(e)} value={selectedDescription} />
                    </div>
                    <div className="govuk-form-group">
                        <button id="submit-specification-button" className="govuk-button govuk-!-margin-right-1"
                                data-module="govuk-button"
                                onClick={submitUpdateSpecification}>
                            Save and continue
                        </button>
                        <a id="cancel-update-specification" href={`/app/ViewSpecification/${specificationSummary.id}`}
                           className="govuk-button govuk-button--secondary"
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
