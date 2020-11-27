import {CollapsiblePanel} from "../CollapsiblePanel";
import {CollapsibleSearchBox} from "../CollapsibleSearchBox";
import React, {useEffect, useState} from "react";
import {Facet, FacetValue} from "../../types/Facet";
import {PublishedProviderSearchFacet, PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {useDispatch, useSelector} from "react-redux";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {IStoreState} from "../../reducers/rootReducer";
import {updateFundingSearch} from "../../actions/FundingSearchSelectionActions";

export interface IPublishedProviderSearchFiltersProps {
    facets: Facet[],
    numberOfProvidersWithErrors: number
}

export function PublishedProviderSearchFilters(props: IPublishedProviderSearchFiltersProps) {
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const [statusFacets, setStatusFacets] = useState<FacetValue[]>([]);
    const [providerTypeFacets, setProviderTypeFacets] = useState<FacetValue[]>([]);
    const [providerSubTypeFacets, setProviderSubTypeFacets] = useState<FacetValue[]>([]);
    const [localAuthorityFacets, setLocalAuthorityFacets] = useState<FacetValue[]>([]);
    const [filterWithErrors, setFilterWithErrors] = useState<boolean>(state.searchCriteria && state.searchCriteria.hasErrors ? state.searchCriteria.hasErrors : false);
    const [filterWithoutErrors, setFilterWithoutErrors] = useState<boolean>(state.searchCriteria && state.searchCriteria.hasErrors ? !state.searchCriteria.hasErrors : false);
    const dispatch = useDispatch();

    useEffect(() => {
            props.facets.forEach((facet) => {
                switch (facet.name) {
                    case PublishedProviderSearchFacet.ProviderType:
                        setProviderTypeFacets(facet.facetValues);
                        break;
                    case PublishedProviderSearchFacet.ProviderSubType:
                        setProviderSubTypeFacets(facet.facetValues);
                        break;
                    case PublishedProviderSearchFacet.LocalAuthority:
                        setLocalAuthorityFacets(facet.facetValues);
                        break;
                    case PublishedProviderSearchFacet.FundingStatus:
                        setStatusFacets(facet.facetValues);
                        break;
                }
            });
    }, [props.facets]);


    function changeLocalAuthorityFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = (state.searchCriteria as PublishedProviderSearchRequest).localAuthority;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        dispatch(updateFundingSearch({...state.searchCriteria, localAuthority: filterUpdate, pageNumber: 1}));
    }

    function changeStatusFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = (state.searchCriteria as PublishedProviderSearchRequest).status;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        dispatch(updateFundingSearch({...state.searchCriteria, status: filterUpdate, pageNumber: 1}));
    }

    function changeProviderTypeFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = (state.searchCriteria as PublishedProviderSearchRequest).providerType;
        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        dispatch(updateFundingSearch({...state.searchCriteria, providerType: filterUpdate, pageNumber: 1}));
    }

    function changeProviderSubTypeFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const filterUpdate = (state.searchCriteria as PublishedProviderSearchRequest).providerSubType;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        dispatch(updateFundingSearch({...state.searchCriteria, providerSubType: filterUpdate, pageNumber: 1}));
    }

    function changeSearchTextFilter(searchField: string, searchTerm: string) {
        if ((searchTerm.length === 0 && (state.searchCriteria as PublishedProviderSearchRequest).searchTerm.length !== 0) || searchTerm.length > 2) {
            const searchFields: string[] = [];
            if (searchField != null && searchField !== "") {
                searchFields.push(searchField);
            }
            dispatch(updateFundingSearch({...state.searchCriteria, searchTerm: searchTerm, searchFields: searchFields, pageNumber: 1}));
        }
    }

    function changeErrorFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const withErrors = e.target.value === "with-errors" ? e.target.checked : filterWithErrors;
        const withoutErrors = e.target.value === "without-errors" ? e.target.checked : filterWithoutErrors;
        dispatch(updateFundingSearch({...(state.searchCriteria as PublishedProviderSearchRequest), hasErrors: withErrors === withoutErrors ? undefined : withErrors, pageNumber: 1}));
        setFilterWithoutErrors(withoutErrors);
        setFilterWithErrors(withErrors);
    }

    return <>
        <CollapsiblePanel title={"Search"} expanded={true}>
            <fieldset className="govuk-fieldset" aria-describedby="how-contacted-conditional-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading">
                    <h4 className="govuk-heading-s">Search</h4>
                </legend>
                <span id="how-contacted-conditional-hint" className="govuk-hint sidebar-search-span">
                    Select one option.
                </span>
                <CollapsibleSearchBox searchTerm={""} callback={changeSearchTextFilter}/>
            </fieldset>
        </CollapsiblePanel>
        <CollapsiblePanel title={"Filter by provider type"} expanded={providerTypeFacets.length > 0}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-form-group">
                    <label className="govuk-label">Search</label>
                </div>
                <div className="govuk-checkboxes">
                    {providerTypeFacets.map((s, index) =>
                        <div key={index} className="govuk-checkboxes__item">
                            <input className="govuk-checkboxes__input"
                                   id={`providerType-${s.name}`}
                                   name={`providerType-${s.name}`}
                                   type="checkbox" value={s.name}
                                   onChange={changeProviderTypeFilter}/>
                            <label className="govuk-label govuk-checkboxes__label"
                                   htmlFor={`providerType-${s.name}`}>
                                {s.name}
                            </label>
                        </div>)
                    }
                </div>
            </fieldset>
        </CollapsiblePanel>
        <CollapsiblePanel title={"Filter by provider sub type"} expanded={providerSubTypeFacets.length > 0}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-form-group">
                    <label className="govuk-label">Search</label>
                </div>
                <div className="govuk-checkboxes">
                    {providerSubTypeFacets.map((s, index) =>
                        <div key={index} className="govuk-checkboxes__item">
                            <input className="govuk-checkboxes__input"
                                   id={`providerType-${s.name}`}
                                   name={`providerType-${s.name}`}
                                   type="checkbox" value={s.name}
                                   onChange={changeProviderSubTypeFilter}/>
                            <label className="govuk-label govuk-checkboxes__label"
                                   htmlFor={`providerType-${s.name}`}>
                                {s.name}
                            </label>
                        </div>)
                    }
                </div>
            </fieldset>
        </CollapsiblePanel>
        <CollapsiblePanel title={"Filter by status"} expanded={statusFacets.length > 0}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes">
                    {statusFacets.map((s, index) =>
                        <div key={index} className="govuk-checkboxes__item">
                            <input className="govuk-checkboxes__input"
                                   id={`fundingPeriods-${s.name}`}
                                   name={`fundingPeriods-${s.name}`}
                                   type="checkbox" value={s.name}
                                   onChange={changeStatusFilter}/>
                            <label className="govuk-label govuk-checkboxes__label"
                                   htmlFor={`fundingPeriods-${s.name}`}>
                                {s.name}
                            </label>
                        </div>)
                    }
                </div>
            </fieldset>
        </CollapsiblePanel>
        <CollapsiblePanel title={"Filter by local authority"} expanded={localAuthorityFacets.length > 0}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes">
                    {localAuthorityFacets.map((s, index) =>
                        <div key={index} className="govuk-checkboxes__item">
                            <input className="govuk-checkboxes__input"
                                   id={`localAuthority-${s.name}`}
                                   name={`localAuthority-${s.name}`}
                                   type="checkbox" value={s.name}
                                   onChange={changeLocalAuthorityFilter}/>
                            <label className="govuk-label govuk-checkboxes__label"
                                   htmlFor={`localAuthority-${s.name}`}>
                                {s.name}
                            </label>
                        </div>)
                    }
                </div>
            </fieldset>
        </CollapsiblePanel>
        <CollapsiblePanel title={"Filter by error status"} expanded={props.numberOfProvidersWithErrors > 0}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes govuk-checkboxes--small filterbyCheckbox">
                    <div key="1" className="govuk-checkboxes__item">
                        <input className="govuk-checkboxes__input"
                               id="with-errors"
                               name="with-errors"
                               type="checkbox" value="with-errors"
                               onChange={changeErrorFilter}/>
                        <label className="govuk-label govuk-checkboxes__label"
                               htmlFor="with-errors">
                            With errors
                        </label>
                    </div>
                    <div key="2" className="govuk-checkboxes__item">
                        <input className="govuk-checkboxes__input"
                               id="without-errors"
                               name="without-errors"
                               type="checkbox" value="without-errors"
                               onChange={changeErrorFilter}/>
                        <label className="govuk-label govuk-checkboxes__label"
                               htmlFor="without-errors">
                            Without errors
                        </label>
                    </div>
                </div>
            </fieldset>
        </CollapsiblePanel>
    </>
}