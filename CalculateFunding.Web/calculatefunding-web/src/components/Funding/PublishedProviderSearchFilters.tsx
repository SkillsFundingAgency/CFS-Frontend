import {LoadingStatus} from "../LoadingStatus";
import {CollapsiblePanel} from "../CollapsiblePanel";
import {CollapsibleSearchBox} from "../CollapsibleSearchBox";
import React from "react";
import {PublishProviderSearchResult} from "../../types/PublishedProvider/PublishProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {FacetValue} from "../../types/Facet";
import {NoData} from "../NoData";


export interface IPublishedProviderSearchFiltersProps {
    isLoadingResults: boolean,
    publishedProviderResults: PublishProviderSearchResult,
    specificationSummary: SpecificationSummary,
    localAuthorities: FacetValue[],
    providerTypes: FacetValue[],
    providerSubTypes: FacetValue[],
    statuses: FacetValue[],
    handleFilterByText: any,
    handleFilterByLocalAuthority: any,
    handleFilterByProviderType: any,
    handleFilterByProviderSubType: any,
    handleFilterByStatus: any
}

export function PublishedProviderSearchFilters(props: IPublishedProviderSearchFiltersProps) {

    const hasInitialLoad = props.publishedProviderResults.facets.length > 0;
    const hasFilters = props.statuses.length > 0;
    return (
        <div className="govuk-grid-column-one-third">
            {!hasInitialLoad &&
                <LoadingStatus title={`Loading filters`} testid='loadingFilters'/>
            }
            {hasInitialLoad && hasFilters &&
            <>
                <CollapsiblePanel title={"Search"} expanded={true}>
                    <fieldset className="govuk-fieldset" aria-describedby="how-contacted-conditional-hint">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading">
                            <h4 className="govuk-heading-s">Search</h4>
                        </legend>
                        <span id="how-contacted-conditional-hint" className="govuk-hint sidebar-search-span">
                                Select one option.
                            </span>
                        <CollapsibleSearchBox searchTerm={""} callback={props.handleFilterByText}/>
                    </fieldset>
                </CollapsiblePanel>
                <CollapsiblePanel title={"Filter by provider type"} expanded={props.providerTypes.length > 0}>
                    <fieldset className="govuk-fieldset">
                        <div className="govuk-form-group">
                            <label className="govuk-label">Search</label>
                        </div>
                        <div className="govuk-checkboxes">
                            {props.providerTypes.map((s, index) =>
                                <div key={index} className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input"
                                           id={`providerType-${s.name}`}
                                           name={`providerType-${s.name}`}
                                           type="checkbox" value={s.name}
                                           onChange={props.handleFilterByProviderType}/>
                                    <label className="govuk-label govuk-checkboxes__label"
                                           htmlFor={`providerType-${s.name}`}>
                                        {s.name}
                                    </label>
                                </div>)
                            }
                        </div>
                    </fieldset>
                </CollapsiblePanel>
                <CollapsiblePanel title={"Filter by provider sub type"} expanded={props.providerSubTypes.length > 0}>
                    <fieldset className="govuk-fieldset">
                        <div className="govuk-form-group">
                            <label className="govuk-label">Search</label>
                        </div>
                        <div className="govuk-checkboxes">
                            {props.providerSubTypes.map((s, index) =>
                                <div key={index} className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input"
                                           id={`providerType-${s.name}`}
                                           name={`providerType-${s.name}`}
                                           type="checkbox" value={s.name}
                                           onChange={props.handleFilterByProviderSubType}/>
                                    <label className="govuk-label govuk-checkboxes__label"
                                           htmlFor={`providerType-${s.name}`}>
                                        {s.name}
                                    </label>
                                </div>)
                            }
                        </div>
                    </fieldset>
                </CollapsiblePanel>
                <CollapsiblePanel title={"Filter by status"} expanded={props.statuses.length > 0}>
                    <fieldset className="govuk-fieldset">
                        <div className="govuk-checkboxes">
                            {props.statuses.map((s, index) =>
                                <div key={index} className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input"
                                           id={`fundingPeriods-${s.name}`}
                                           name={`fundingPeriods-${s.name}`}
                                           type="checkbox" value={s.name}
                                           onChange={props.handleFilterByStatus}/>
                                    <label className="govuk-label govuk-checkboxes__label"
                                           htmlFor={`fundingPeriods-${s.name}`}>
                                        {s.name}
                                    </label>
                                </div>)
                            }
                        </div>
                    </fieldset>
                </CollapsiblePanel>
                <CollapsiblePanel title={"Filter by local authority"} expanded={props.localAuthorities.length > 0}>
                    <fieldset className="govuk-fieldset">
                        <div className="govuk-checkboxes">
                            {props.localAuthorities.map((s, index) =>
                                <div key={index} className="govuk-checkboxes__item">
                                    <input className="govuk-checkboxes__input"
                                           id={`localAuthority-${s.name}`}
                                           name={`localAuthority-${s.name}`}
                                           type="checkbox" value={s.name}
                                           onChange={props.handleFilterByLocalAuthority}/>
                                    <label className="govuk-label govuk-checkboxes__label"
                                           htmlFor={`localAuthority-${s.name}`}>
                                        {s.name}
                                    </label>
                                </div>)
                            }
                        </div>
                    </fieldset>
                </CollapsiblePanel>
            </>
            }
        </div>
    );
}