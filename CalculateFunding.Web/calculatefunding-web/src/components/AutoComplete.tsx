import React, {useEffect, useState} from "react";
import "../styles/AutoComplete.scss";

export enum AutoCompleteMode {
    Standard,
    PrefixedId, // id needs to be prefixed and suffixed with __, e.g. __1__
}

export interface AutoCompleteProps {
    suggestions: string[],
    hidden?: boolean,
    disabled?: boolean,
    includePager?: boolean,
    callback: any,
    mode?: AutoCompleteMode,
}

export function AutoComplete({suggestions, hidden, disabled, includePager, callback, mode = AutoCompleteMode.Standard}: AutoCompleteProps) {

    function hideSuggestions(event: any) {
        if (event.target.className !== "autocomplete-option" && event.target.id !== "input-auto-complete") {
            setAutoCompleteState(prevState => {
                return {...prevState, showSuggestions: false}
            });
        }
    }

    const [autoCompleteState, setAutoCompleteState] = useState({
        suggestions: suggestions,
        filteredSuggestions: [] as string[],
        showSuggestions: false,
        userInput: "",
        hidden: hidden,
        disabled: disabled
    });

    const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);

    useEffect(() => {
        window.addEventListener('click', hideSuggestions, false);
        return () => {
            window.removeEventListener('click', hideSuggestions, false);
        }
    }, []);

    useEffect(() => {
        setAutoCompleteState(prevState => {
            return {...prevState, suggestions: suggestions}
        });
    }, [suggestions]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCurrentSearchIndex(0);
        const userInput = e.currentTarget.value;
        if (e.currentTarget.value.length === 0) {
            setAutoCompleteState(prevState => {
                return {...prevState, showSuggestions: false, userInput: userInput}
            });
            callback("");
        } else {
            setAutoCompleteState(prevState => {
                return {...prevState, showSuggestions: true, userInput: userInput}
            });
        }

        setSuggestions(userInput);
    }

    function onClickInput(e: React.MouseEvent<HTMLInputElement>) {
        const userSelect = e.currentTarget.value;
        setAutoCompleteState(prevState => {
            return {...prevState, showSuggestions: !autoCompleteState.showSuggestions}
        });
        setSuggestions(userSelect);
    }

    function setSuggestions(e: string) {
        const filteredSuggestionsArray = autoCompleteState.suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().includes(e.toLowerCase())
        );
        setAutoCompleteState(prevState => {
            return {...prevState, filteredSuggestions: filteredSuggestionsArray}
        });
    }

    function listClick(e: React.MouseEvent<HTMLLIElement>) {
        const userSelected = e.currentTarget.innerText;
        const id = e.currentTarget.dataset.id;
        searchItem(userSelected, id);
    }

    function searchItem(value: string, id?: string) {
        setSuggestions(value);
        setAutoCompleteState(prevState => {
            return {...prevState, showSuggestions: false, userInput: value}
        });
        callback(id);
    }

    function getValue(rawValue: string) {
        if (mode === AutoCompleteMode.PrefixedId && rawValue.startsWith("__")) {
            const value = rawValue.split("__");
            return value[2];
        }
        return rawValue;
    }

    function getId(rawValue: string) {
        if (mode === AutoCompleteMode.PrefixedId && rawValue.startsWith("__")) {
            const value = rawValue.split("__");
            return value[1];
        }
        return rawValue;
    }

    const goBackSearch = () => {
        if (currentSearchIndex <= 0) return;
        const newSearchIndex = currentSearchIndex - 1;
        setCurrentSearchIndex(newSearchIndex);
        updateSearchItem(newSearchIndex);
    };

    const goForwardSearch = () => {
        if (currentSearchIndex >= autoCompleteState.filteredSuggestions.length - 1) return;
        const newSearchIndex = currentSearchIndex + 1;
        setCurrentSearchIndex(newSearchIndex);
        updateSearchItem(newSearchIndex);
    }

    const updateSearchItem = (index: number) => {
        const filteredItem: string = autoCompleteState.filteredSuggestions[index];
        callback(getId(filteredItem));
    }

    return (
        <>
            {includePager && <label className="govuk-label" htmlFor="textarea">
                Search
                {autoCompleteState.filteredSuggestions.length > 0 && autoCompleteState.userInput.length > 0 &&
                    <span className="govuk-caption-s govuk-!-margin-left-1 tb-search">
                        <button onClick={goBackSearch}>◂</button> {currentSearchIndex + 1} of {autoCompleteState.filteredSuggestions.length} <button onClick={goForwardSearch}>▸</button>
                    </span>}
            </label>}
            <div className="govuk-form-group" hidden={hidden}>
                <input className="govuk-input" id="input-auto-complete"
                    type="text" disabled={autoCompleteState.disabled} autoComplete={"off"}
                    onChange={onChange} onClick={onClickInput} value={autoCompleteState.userInput} />
                <ul hidden={!autoCompleteState.showSuggestions} className="govuk-list autocomplete">
                    {autoCompleteState.filteredSuggestions.map((fs, index) => {
                        const value = getValue(fs);
                        const id = getId(fs);
                        return <li className="autocomplete-option"
                            key={index} value={value} data-id={id} data-testid={id} onClick={listClick}>
                            {value}
                        </li>
                    }
                    )}
                </ul>
            </div>
        </>
    );
}

