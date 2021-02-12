import React, {useEffect, useState} from "react";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {
    getProfileVariationPointersService,
    getSpecificationSummaryService,
    setProfileVariationPointersService
} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FundingLineProfileVariationPointer, ProfileVariationPointer} from "../../types/Specifications/ProfileVariationPointer";
import {ProfilingInstallments} from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import {LoadingStatus} from "../../components/LoadingStatus";
import {
    getProfilePatternsForFundingLine
} from "../../services/profilingService";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";

export interface EditVariationPointsRouteProps {
    specificationId: string;
    fundingLineId: string;
}

export function EditVariationPoints({match}: RouteComponentProps<EditVariationPointsRouteProps>) {
    const specificationId = match.params.specificationId;
    const fundingLineId = match.params.fundingLineId;

    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
    const [currentProfileVariationPointer, setCurrentProfileVariationPointer] = useState<FundingLineProfileVariationPointer>();
    const [futureProfilingInstallments, setFutureProfilingInstallments] = useState<ProfilingInstallments[]>([]);
    const [selectedInstallment, setSelectedInstallment] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const {errors, addError, clearErrorMessages} = useErrors();

    const history = useHistory();

    useEffect(() => {
        const loadProfileVariationPointerData = async () => {
            try {
                clearErrorMessages();
                setIsLoading(true);

                const spec = (await getSpecificationSummaryService(specificationId)).data as SpecificationSummary;
                setSpecificationSummary(spec);

                const profileVariationPointers = (
                    await getProfileVariationPointersService(specificationId)).data as FundingLineProfileVariationPointer[];
                const currentPointer = profileVariationPointers.find(p => p.fundingLineId === fundingLineId);
                setCurrentProfileVariationPointer(currentPointer);

                const installments = (await getProfilePatternsForFundingLine(
                    spec.fundingStreams[0].id,
                    spec.fundingPeriod.id,
                    fundingLineId)).data as ProfilingInstallments[];

                if (installments && installments.length > 0) {
                    if (currentPointer && currentPointer.profileVariationPointer !== null) {
                        const currentYear = currentPointer.profileVariationPointer.year;
                        const currentMonthNumber = getMonthNumber(currentPointer.profileVariationPointer.typeValue);
                        const currentInstallmentNumber = currentPointer.profileVariationPointer.occurrence;
                        const futureInstallments = installments.filter(i =>
                            i.installmentYear > currentYear
                            || (i.installmentYear === currentYear
                                && getMonthNumber(i.installmentMonth) > currentMonthNumber)
                            || (i.installmentYear === currentYear
                                && getMonthNumber(i.installmentMonth) === currentMonthNumber
                                && i.installmentNumber > currentInstallmentNumber)
                        );

                        if (futureInstallments && futureInstallments.length > 0) {
                            setFutureProfilingInstallments(futureInstallments);
                        }
                    } else {
                        setFutureProfilingInstallments(installments);
                    }
                }
            } catch (err) {
                addError({error: err, description: `Error while retrieving profile variation pointers`});
            } finally {
                setIsLoading(false);
            }
        }
        if (specificationId && specificationId.length > 0) {
            loadProfileVariationPointerData();
        }
    }, [specificationId, fundingLineId]);

    function getMonthNumber(monthName: string) {
        return ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
            .indexOf(monthName.toLowerCase()) + 1;
    }

    function setFutureInstallment(e: React.ChangeEvent<HTMLSelectElement>) {
        const newValue = e.target.value;
        setSelectedInstallment(newValue);
    }

    async function setProfileVariationPointers() {
        try {
            if (selectedInstallment.length > 0 && specificationSummary && futureProfilingInstallments) {
                setIsSaving(true);
                const installmentParts = selectedInstallment.split("-");
                const profileVariationPointersFutureInstallment: ProfileVariationPointer[] = [{
                    fundingLineId: fundingLineId,
                    fundingStreamId: specificationSummary.fundingStreams[0].id,
                    typeValue: installmentParts[1],
                    periodType: currentProfileVariationPointer?.profileVariationPointer?.periodType ??
                        futureProfilingInstallments[0].periodType,
                    year: parseInt(installmentParts[0], 10),
                    occurrence: parseInt(installmentParts[2], 10)
                }];
                const updateProfileVariationPointersResponse = await setProfileVariationPointersService(
                    specificationId, profileVariationPointersFutureInstallment);
                if (updateProfileVariationPointersResponse.status === 200) {
                    setIsSaving(false);
                    history.push(`/ViewSpecification/${specificationId}`);
                } else {
                    throw 'An invalid response was received. Try refreshing the page.'
                }
            }
        } catch (err) {
            setIsSaving(false);
            addError({error: err, description: `Error while updating profile variation pointer`});
        }
    }

    return (
        <div>
            <Header location={Section.Specifications} />
            {isLoading || isSaving ? <LoadingStatus title={`${isLoading ? "Loading" : "Saving"} installment variation`} /> : null}
            {!isLoading && !isSaving &&
                <div className="govuk-width-container">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"} />
                        <Breadcrumb name={"View specifications"} url={"/SpecificationsList"} />
                        <Breadcrumb name={specificationSummary ? specificationSummary.name : ""} url={`/ViewSpecification/${specificationId}`} />
                        <Breadcrumb name={"Edit specification"} />
                    </Breadcrumbs>
                    <MultipleErrorSummary errors={errors} />
                    <div className="govuk-main-wrapper">
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading">
                                    Variation occurrence
                                </h1>
                            </legend>
                            {(currentProfileVariationPointer && futureProfilingInstallments) ?
                                <div className="govuk-form-group">
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group">
                                            <table className="govuk-table">
                                                <caption className="govuk-table__caption">Installment variation</caption>
                                                <thead className="govuk-table__head">
                                                    <tr className="govuk-table__row">
                                                        <th scope="col" className="govuk-table__header app-custom-class">
                                                            Funding line
                                                    </th>
                                                        <th scope="col" className="govuk-table__header app-custom-class">
                                                            Current installment
                                                    </th>
                                                        <th scope="col" className="govuk-table__header app-custom-class">
                                                            Future installment
                                                    </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="govuk-table__body">
                                                    <tr className="govuk-table__row">
                                                        <th scope="row" className="govuk-table__header">{currentProfileVariationPointer.fundingLineId}</th>
                                                        <td className="govuk-table__cell">
                                                            {currentProfileVariationPointer.profileVariationPointer === null ? "Initial allocation" : <span>
                                                                {`${currentProfileVariationPointer.profileVariationPointer.typeValue} ${currentProfileVariationPointer.profileVariationPointer.year}`} <br />
                                                                {`Installment ${currentProfileVariationPointer.profileVariationPointer.occurrence}`}
                                                            </span>}
                                                        </td>
                                                        <td className="govuk-table__cell">
                                                            <div className="govuk-form-group">
                                                                {futureProfilingInstallments.length > 0 ?
                                                                    <select className="govuk-select" value={selectedInstallment} onChange={setFutureInstallment} data-testid="select">
                                                                        <option value=""></option>
                                                                        {futureProfilingInstallments
                                                                            .map((installment, installmentIndex) =>
                                                                                <option key={`installment-${installmentIndex}`} value={`${installment.installmentYear}-${installment.installmentMonth}-${installment.installmentNumber}`}>
                                                                                    {installment.installmentMonth} {installment.installmentYear} installment {installment.installmentNumber}
                                                                                </option>
                                                                            )}
                                                                    </select> : <span className="govuk-body">None available</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {futureProfilingInstallments.length > 0 ? <div className="govuk-form-group">
                                            <button className="govuk-button govuk-!-margin-right-1"
                                                data-module="govuk-button"
                                                onClick={setProfileVariationPointers}>
                                                Save and continue
                                        </button>
                                        </div> : null}
                                    </div>
                                </div>
                                : null
                            }
                        </fieldset>
                    </div>
                </div>}
            <Footer />
        </div>
    );
}
