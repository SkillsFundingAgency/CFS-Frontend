import React from "react";

export interface InputSearchProps {
    suggestions: string[],
    hidden?: boolean,
    disabled?: boolean,
    includePager?: boolean,
    callback: any,
    id:string
}

export function InputSearch(props: InputSearchProps){

    function checkSuggestion(suggestion:string)
    {
        if(props.suggestions.find(x => x === suggestion))
        {
            props.callback(suggestion);
        }
    }
    return <>
        <input id={props.id} role={`${props.id}-input-search`} type="text" list={`${props.id}-suggestions`} className={"govuk-input"} onChange={(e) => checkSuggestion(e.currentTarget.value)}>
        </input>
        <datalist id={`${props.id}-suggestions`} className={"govuk-input"}>
            {props.suggestions.map((suggestion, index)  => <option key={index} value={suggestion} />)}
        </datalist>
    </>
}