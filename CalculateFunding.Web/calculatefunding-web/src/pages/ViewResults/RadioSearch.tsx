import React, {useLayoutEffect, useRef, useState} from "react";

export function RadioSearch(props: {
    text: string;
    selectedSearchType: string | undefined;
    timeout: number;
    radioId: string,
    radioName: string,
    searchType: string,
    minimumChars: number
    callback: any
}) {
    const [searchQuery, setSearchQuery] = useState({
        searchName:props.radioName,
        searchValue:""
    });
    const didMount = useRef(false);

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

    function updateSearch(name:string, value:string){
        setSearchQuery(() => {
            return {
                searchName: name,
                searchValue: value
            }
        });
    }

    function setSearch(name:string)
    {
        props.callback(name, null);
    }

    return <div className={"govuk-radios__item"}>
        <input type="radio" className={"govuk-radios__input"} id={props.radioId}
               name={props.radioName} onChange={() => setSearch(props.searchType)}/>
        <label className={"govuk-radios__label"} htmlFor={props.radioId}>{props.text}</label>
        <div className="govuk-inset-text" hidden={props.selectedSearchType !== props.searchType}>
            <input className={"govuk-input"} type={"text"}
                   onChange={(e) => updateSearch(props.searchType, e.target.value)}/>
        </div>
    </div>
}