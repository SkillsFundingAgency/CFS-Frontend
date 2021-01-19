import React, {useLayoutEffect, useRef, useState} from "react";
import {useErrors} from "../../hooks/useErrors";
import {CharacterRestrictions} from "../../types/CharacterRestrictions";
import {ErrorMessage} from "../../types/ErrorMessage";

export function RadioSearch(props: {
    text: string;
    selectedSearchType: string | undefined;
    timeout: number;
    radioId: string,
    radioName: string,
    searchType: string,
    minimumChars: number,
    characterRestrictions: CharacterRestrictions
    callback: any
}) {
    const [searchQuery, setSearchQuery] = useState({
        searchName: props.radioName,
        searchValue: ""
    });
    const didMount = useRef(false);

    const {errors, addError, clearErrorMessages} = useErrors();

    useLayoutEffect(() => {
        if (didMount.current) {
            if (searchQuery.searchValue.length >= props.minimumChars || searchQuery.searchValue.length === 0) {
                const timeout = setTimeout(() => props.callback(searchQuery.searchName, searchQuery.searchValue), props.timeout ?? 900);
                return () => clearTimeout(timeout);
            }
        } else {
            didMount.current = true;
        }
    }, [searchQuery]);

    function updateSearch(name: string, value: string) {
        let searchValid = true;
        if (props.characterRestrictions === CharacterRestrictions.NumericOnly) {
            let regEx = new RegExp("[^0-9]");
            if (regEx.test(value)) {
                addError("Numeric characters only", "Only numbers allowed");
                searchValid = false;
            }else{
                clearErrorMessages();
            }
        }else if(props.characterRestrictions === CharacterRestrictions.AlphaOnly) {
            let regEx = new RegExp("[^0-9]");
            if (!regEx.test(value)) {
                addError("Alpha characters only", "Only letters allowed");
                searchValid = false;
            }else{
                clearErrorMessages();
            }
        }

        if(searchValid) {
            setSearchQuery(() => {
                return {
                    searchName: name,
                    searchValue: value
                }
            });
        }
    }

    function setSearch(name: string) {
        props.callback(name, null);
    }

    return <div className={"govuk-radios__item"}>
        <input type="radio" className={"govuk-radios__input"}
               id={props.radioId}
               name={props.radioName} onChange={() => setSearch(props.searchType)}/>
        <label className={"govuk-radios__label"} htmlFor={props.radioId}>{props.text}</label>
        <div className="govuk-inset-text" hidden={props.selectedSearchType !== props.searchType}>
            <input className={"govuk-input" + (errors.length > 0 ? " govuk-input--error" : "")} type={"text"}
                   onChange={(e) => updateSearch(props.searchType, e.target.value)}/>
            {(errors as ErrorMessage[]).map((err, index) => <span key={index} className={"govuk-error-message"}>{err.message}</span>)}
        </div>
    </div>
}