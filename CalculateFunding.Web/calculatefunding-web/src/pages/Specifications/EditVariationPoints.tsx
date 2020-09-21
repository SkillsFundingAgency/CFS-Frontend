import React, {useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {
    getProfileVariationPointersService,
    getSpecificationSummaryService, setProfileVariationPointersService
} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {ProfilingInstallments} from "../../types/Profiling";
import {LoadingStatus} from "../../components/LoadingStatus";
import {
    GetProfilePatternsService
} from "../../services/profilingService";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
export interface EditVariationPointsRouteProps {
    specificationId: string;
}
export function EditVariationPoints({match}: RouteComponentProps<EditVariationPointsRouteProps>) {
    const specificationId = match.params.specificationId;
    const specificationSummaryInitialState =
        {
            name: "",
            id: "",
            approvalStatus: "",
            isSelectedForFunding: false,
            description: "",
            providerVersionId: "",
            fundingStreams: [{
                id: "",
                name: ""
            }],
            fundingPeriod: {
                id: "",
                name: ""
            }
        };
    const profileVariationPointerInitialState = [{
        fundingStreamId: "",
        fundingLineId: "",
        periodType: "",
        typeValue: "",
        year: 0,
        occurrence: 0,
    }];
    const profilingInstallmentsInitialState: ProfilingInstallments[] = [];
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>(specificationSummaryInitialState);
    const [profileVariationPointers, setProfileVariationPointers] = useState<ProfileVariationPointer[]>(profileVariationPointerInitialState);
    const [profileVariationPointersFutureInstallment, setProfileVariationPointersFutureInstallment] = useState<ProfileVariationPointer[]>([]);
    const [profilingInstallments, setProfilingInstallments] = useState<ProfilingInstallments[]>(profilingInstallmentsInitialState);
    const [isLoading, setIsLoading] = useState(false);

    let history = useHistory();

    function SetFutureInstallment(e: React.ChangeEvent<HTMLSelectElement>) {
        if (e.target.value !== null && e.target.value !== "-1") {
            const profileVariationIndex = parseInt(e.target.value.split('-')[0]);
            const installmentIndex = parseInt(e.target.value.split('-')[1]);
            if (!isNaN(profileVariationIndex) && !isNaN(installmentIndex)) {
                const updateProfileVariation = JSON.parse(JSON.stringify(profileVariationPointers));
                updateProfileVariation[profileVariationIndex].typeValue = profilingInstallments[installmentIndex].installmentMonth;
                updateProfileVariation[profileVariationIndex].year = profilingInstallments[installmentIndex].installmentYear;
                updateProfileVariation[profileVariationIndex].occurrence = profilingInstallments[installmentIndex].installmentNumber;
                setProfileVariationPointersFutureInstallment(updateProfileVariation);
            } else if (!isNaN(profileVariationIndex) && isNaN(installmentIndex)) {
                const updateProfileVariation = JSON.parse(JSON.stringify(profileVariationPointers));
                updateProfileVariation[profileVariationIndex].typeValue = profileVariationPointers[profileVariationIndex].typeValue;
                updateProfileVariation[profileVariationIndex].year = profileVariationPointers[profileVariationIndex].year;
                updateProfileVariation[profileVariationIndex].occurrence = profileVariationPointers[profileVariationIndex].occurrence;
                setProfileVariationPointersFutureInstallment(updateProfileVariation);
            }
        }
    }

    function SetProfileVariationPointers() {
        if (profileVariationPointersFutureInstallment.length > 0) {
            setIsLoading(true);
            const updateProfileVariationPointers = async () => {
                return setProfileVariationPointersService(specificationId, profileVariationPointersFutureInstallment);
            };
            updateProfileVariationPointers().then((result) => {
                if (result.status === 200) {
                    history.push(`/app/ViewSpecification/${specificationId}`);
                } else {
                    setIsLoading(false);
                }
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }

    useEffectOnce(() => {
        setIsLoading(true);
        const getSpecification = async () => {
            return getSpecificationSummaryService(specificationId);
        };
        getSpecification().then((specificationResult) => {
            if (specificationResult.status === 200) {
                const spec = specificationResult.data as SpecificationSummary;
                setSpecificationSummary(spec);
                const getProfileVariationPointers = async () => {
                    return getProfileVariationPointersService(specificationId);
                };
                getProfileVariationPointers().then((profileVariationPointersResult) => {
                    if (profileVariationPointersResult.status === 200)
                    {
                        setProfileVariationPointers(profileVariationPointersResult.data as ProfileVariationPointer[])
                        const getInstallments = async () => {
                            return GetProfilePatternsService(
                                spec.fundingStreams[0].id,
                                spec.fundingPeriod.id);
                        };
                        getInstallments().then((installmentsResult) => {
                            const installments = installmentsResult.data as ProfilingInstallments[];
                            if (installments !== null && installments.length > 0) {
                                setProfilingInstallments(installments);
                                setIsLoading(false);
                            }
                            else
                                setIsLoading(false);
                        });
                    }
                    else
                        setIsLoading(false);
                });
            }
            else
            {
                setIsLoading(false);
            }
        });
    });
    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationId}`}/>
                <Breadcrumb name={"Edit specification"} />
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <LoadingStatus title={"Loading installment variation"} hidden={!isLoading}/>
                <fieldset className="govuk-fieldset" hidden={isLoading}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">
                            Variation occurence
                        </h1>
                    </legend>
                    {
                        (profilingInstallments != null &&  profilingInstallments.length > 0) ?
                            <div className="govuk-form-group">
                                <div className="govuk-grid-column-two-thirds">
                                    <div className="govuk-form-group">
                                        <table className="govuk-table">
                                            <caption className="govuk-table__caption">Installment variation</caption>
                                            <thead className="govuk-table__head">
                                            <tr className="govuk-table__row">
                                                <th scope="col" className="govuk-table__header app-custom-class">Funding line
                                                </th>
                                                <th scope="col" className="govuk-table__header app-custom-class">Current
                                                    installment
                                                </th>
                                                <th scope="col" className="govuk-table__header app-custom-class">Future
                                                    installment
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="govuk-table__body">
                                            {
                                                profileVariationPointers.map((f, profileVariationIndex) => {
                                                    return (
                                                        <tr key={profileVariationIndex} className="govuk-table__row">
                                                            <th scope="row" className="govuk-table__header">{f.fundingLineId}</th>
                                                            <td className="govuk-table__cell">
                                                                {f.typeValue} {f.year} <br/>
                                                                Installment {f.occurrence}
                                                            </td>
                                                            <td className="govuk-table__cell">
                                                                <div className="govuk-form-group">
                                                                    <select className="govuk-select" onChange={(e) => SetFutureInstallment(e)}>
                                                                        <option value={`${profileVariationIndex}--1`}></option>
                                                                        {
                                                                            profilingInstallments.map((installment, installmentIndex) =>
                                                                            <option key={installmentIndex} value={`${profileVariationIndex}-${installmentIndex}`}>
                                                                                {installment.installmentMonth} {installment.installmentYear} installment {installment.installmentNumber}
                                                                            </option>
                                                                        )}
                                                                    </select>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="govuk-form-group">
                                        <button className="govuk-button govuk-!-margin-right-1"
                                                data-module="govuk-button"
                                                onClick={SetProfileVariationPointers}>
                                            Save and continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                            :null
                    }
                </fieldset>
            </div>
        </div>
        <Footer/>
    </div>
}
