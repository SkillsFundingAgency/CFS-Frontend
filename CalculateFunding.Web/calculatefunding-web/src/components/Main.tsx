import React from "react";
import {Footer} from "./Footer";
import {Section} from "../types/Sections";
import {TopHeader} from "./TopHeader";
import {SubHeader} from "./SubHeader";

export interface MainProps {
    location: Section,
    className?: string,
    children: any
}

export function Main({location, className, children}: MainProps) {
    return (
        <>
            <TopHeader location={location}/>
            <div className="govuk-width-container">
                <SubHeader showSecondaryNav={true}/>
                <main className={`govuk-main-wrapper govuk-main-wrapper--auto-spacing ${className}`} id="main-content" role="main">
                    {children}
                </main>
            </div>
            <Footer/>
        </>
    );
}