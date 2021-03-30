import React from "react";
import '../styles/Badge.scss';

export function Badge(props:{errorCount: number}){
    return props.errorCount !== undefined ? <span className="notification-badge">{props.errorCount}</span> : <></>
}