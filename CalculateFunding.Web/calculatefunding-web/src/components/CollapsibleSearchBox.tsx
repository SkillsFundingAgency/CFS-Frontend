import * as React from "react";
import { useState } from "react";

export function CollapsibleSearchBox(props: {
  searchTerm: string;
  callback: (searchField: string, searchTerm: string) => void;
}) {
  const callback = props.callback;
  const [expandedProvider, setExpandedProvider] = useState(true);
  const [expandedUKPRN, setExpandedUKPRN] = useState(false);
  const [expandedUPIN, setExpandedUPIN] = useState(false);
  const [expandedURN, setExpandedURN] = useState(false);

  function expandSearchProvider() {
    setExpandedUKPRN(false);
    setExpandedUPIN(false);
    setExpandedProvider(true);
    setExpandedURN(false);
  }
  function expandSearchUKPRN() {
    setExpandedUKPRN(true);
    setExpandedUPIN(false);
    setExpandedProvider(false);
    setExpandedURN(false);
  }
  function expandSearchUPIN() {
    setExpandedUKPRN(false);
    setExpandedUPIN(true);
    setExpandedProvider(false);
    setExpandedURN(false);
  }
  function expandSearchURN() {
    setExpandedUKPRN(false);
    setExpandedUPIN(false);
    setExpandedProvider(false);
    setExpandedURN(true);
  }

  return (
    <div
      className="govuk-radios govuk-radios--small govuk-radios--conditional sidebar-overflow-visible"
      data-module="govuk-radios"
    >
      <div className="govuk-radios__item">
        <input
          onChange={expandSearchProvider}
          className="govuk-radios__input"
          id="search-options-providers"
          name="search-options"
          type="radio"
          checked={expandedProvider}
          aria-controls="conditional-search-options-provider"
          aria-expanded="false"
        ></input>
        <label
          onClick={expandSearchProvider}
          className="govuk-label govuk-radios__label"
          htmlFor="search-options-providers"
        >
          Provider name
        </label>
      </div>
      {expandedProvider && (
        <div className={"govuk-radios__conditional"}>
          <div className="govuk-form-group">
            <input
              className="govuk-input sidebar-search-input"
              id={"providerName"}
              data-testid={"providerName"}
              type="text"
              onChange={(e) => callback("providerName", e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="govuk-radios__item">
        <input
          onChange={expandSearchUKPRN}
          className="govuk-radios__input"
          id="search-options-UKPRN"
          name="search-options"
          type="radio"
          checked={expandedUKPRN}
          aria-controls="conditional-search-options-UKPRN"
          aria-expanded="true"
        ></input>
        <label
          onClick={expandSearchUKPRN}
          className="govuk-label govuk-radios__label"
          htmlFor="search-options-UKPRN"
        >
          UKPRN
        </label>
      </div>
      {expandedUKPRN && (
        <div className={"govuk-radios__conditional"}>
          <div className="govuk-form-group">
            <input
              className="govuk-input sidebar-search-input"
              id={"ukprn"}
              data-testid={"ukprn"}
              type="number"
              onChange={(e) => callback("ukprn", e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="govuk-radios__item">
        <input
          onChange={expandSearchUPIN}
          className="govuk-radios__input"
          id="search-options-UPIN"
          name="search-options"
          type="radio"
          checked={expandedUPIN}
          aria-controls="conditional-search-options-UPIN"
          aria-expanded="false"
        ></input>
        <label
          onClick={expandSearchUPIN}
          className="govuk-label govuk-radios__label"
          htmlFor="search-options-UPIN"
        >
          UPIN
        </label>
      </div>
      {expandedUPIN && (
        <div className={"govuk-radios__conditional"}>
          <div className="govuk-form-group">
            <input
              className="govuk-input sidebar-search-input"
              id={"upin"}
              data-testid={"upin"}
              type="number"
              onChange={(e) => callback("upin", e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="govuk-radios__item">
        <input
          onChange={expandSearchURN}
          className="govuk-radios__input"
          id="search-options-URN"
          name="search-options"
          type="radio"
          checked={expandedURN}
          aria-controls="conditional-search-options-URN"
          aria-expanded="false"
        ></input>
        <label
          onClick={expandSearchURN}
          className="govuk-label govuk-radios__label"
          htmlFor="search-options-URN"
        >
          URN
        </label>
      </div>
      {expandedURN && (
        <div className={"govuk-radios__conditional"}>
          <div className="govuk-form-group">
            <input
              className="govuk-input sidebar-search-input"
              id={"urn"}
              data-testid={"urn"}
              type="number"
              onChange={(e) => callback("urn", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
