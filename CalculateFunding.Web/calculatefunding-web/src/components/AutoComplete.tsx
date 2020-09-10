import React, {useEffect, useState} from "react";

export function AutoComplete(props: { suggestions: string[], hidden?: boolean, disabled?:boolean, callback: any }) {

    window.onclick = (event: any) => {
        if(event.target.className !== "autocomplete-option" && event.target.id !== "input-auto-complete"){
            setAutoCompleteState(prevState => {
                return {...prevState, showSuggestions: false}
            });
        }
    }

    const [autoCompleteState, setAutoCompleteState] = useState({
        suggestions: props.suggestions,
        filteredSuggestions: [] as string[],
        showSuggestions: false,
        userInput: "",
        hidden: props.hidden,
        disabled: props.disabled
    });

    useEffect(() => {
        setAutoCompleteState(prevState => {
            return {...prevState, suggestions: props.suggestions}
        });
    }, [props.suggestions]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const userInput = e.currentTarget.value;
        e.currentTarget.value.length === 0 ? setAutoCompleteState(prevState => {
            props.callback("");
            return {...prevState, showSuggestions: false, userInput: userInput}
        }) : setAutoCompleteState(prevState => {
            return {...prevState, showSuggestions: true, userInput: userInput}
        });

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
        setSuggestions(userSelected);
        setAutoCompleteState(prevState => {
            return {...prevState, showSuggestions: false, userInput: userSelected}
        });
        props.callback(userSelected);
    }

    return (
        <div className="govuk-form-group" hidden={props.hidden}>
            <input className="govuk-input" id="input-auto-complete"
                   type="text" disabled={autoCompleteState.disabled} autoComplete={"off"}
                   onChange={onChange} onClick={onClickInput} value={autoCompleteState.userInput}/>
            <ul hidden={!autoCompleteState.showSuggestions} className="govuk-list autocomplete">
                {autoCompleteState.filteredSuggestions.map((fs, index) => <li className="autocomplete-option"
                                                                              key={index} value={fs}
                                                                              onClick={(e) => listClick(e)}>
                    {fs}
                </li>)}
            </ul>
        </div>
    );
}

