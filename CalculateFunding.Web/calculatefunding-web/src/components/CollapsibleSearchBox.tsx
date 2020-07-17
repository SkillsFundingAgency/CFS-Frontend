import * as React from "react";
import {useState} from "react";

export function CollapsibleSearchBox(props: { searchTerm: string, callback:any }) {
    const callback = props.callback;
    const [expandedProvider, setExpandedProvider] = useState(true);
    const [expandedUKPRN, setExpandedUKPRN] = useState(false);
    const [expandedUPIN, setExpandedUPIN] = useState(false);

    function expandSearchProvider() {
        setExpandedUKPRN(false);
        setExpandedUPIN(false);
        setExpandedProvider(true);
    }
    function expandSearchUKPRN() {
        setExpandedUKPRN(true);
        setExpandedUPIN(false);
        setExpandedProvider(false);
    }
    function expandSearchUPIN() {
        setExpandedUKPRN(false);
        setExpandedUPIN(true);
        setExpandedProvider(false);
    }

    return (
        <div
            className="govuk-radios govuk-radios--small govuk-radios--conditional sidebar-overflow-visible"
            data-module="govuk-radios">
            <div className="govuk-radios__item">
                <input onClick={expandSearchProvider}
                       className="govuk-radios__input" id="search-options-providers"
                       name="search-options" type="radio" checked={expandedProvider}
                       aria-controls="conditional-search-options-provider" aria-expanded="false">

                </input>
                <label onClick={expandSearchProvider} className="govuk-label govuk-radios__label"
                       htmlFor="search-options-providers">
                    Provider
                </label>
            </div>
            <div className={`govuk-radios__conditional ${!expandedProvider? "govuk-radios__conditional--hidden" : ""}`}
                 id="conditional-search-options-provider">
                <div className="govuk-form-group">
                    <input className="govuk-input sidebar-search-input"
                           type="text" onChange={(e) => callback(e.target.value)} />
                </div>
            </div>
            <div className="govuk-radios__item">
                <input onClick={expandSearchUKPRN} className="govuk-radios__input" id="search-options-UKPRN"
                       name="search-options" type="radio" checked={expandedUKPRN}
                       aria-controls="conditional-search-options-UKPRN"
                       aria-expanded="true">

                </input>
                <label onClick={expandSearchUKPRN} className="govuk-label govuk-radios__label"
                       htmlFor="search-options-UKPRN">
                    UKPRN
                </label>
            </div>
            <div className={`govuk-radios__conditional ${!expandedUKPRN? "govuk-radios__conditional--hidden" : ""}`}
                 id="conditional-search-options-UKPRN">
                <div className="govuk-form-group">
                    <input className="govuk-input sidebar-search-input"
                           type="text" onChange={(e) => callback(e.target.value)} />
                </div>

            </div>
            <div className="govuk-radios__item">
                <input onClick={expandSearchUPIN} className="govuk-radios__input" id="search-options-UPIN"
                       name="search-options" type="radio" checked={expandedUPIN}
                       aria-controls="conditional-search-options-UPIN"
                       aria-expanded="false">

                </input>
                <label onClick={expandSearchUPIN} className="govuk-label govuk-radios__label"
                       htmlFor="search-options-UPIN">
                    UPIN
                </label>
            </div>
            <div className={`govuk-radios__conditional ${!expandedUPIN? "govuk-radios__conditional--hidden" : ""}`}
                 id="conditional-search-options-UPIN">
                <div className="govuk-form-group">
                    <input className="govuk-input sidebar-search-input"
                           type="text" onChange={(e) => callback(e.target.value)} />
                </div>
            </div>
        </div>
    );
};