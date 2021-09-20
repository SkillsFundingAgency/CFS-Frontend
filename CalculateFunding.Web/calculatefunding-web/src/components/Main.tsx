import React from "react";

import { Section } from "../types/Sections";
import { Footer } from "./Footer";
import { SubHeader } from "./SubHeader";
import { TopHeader } from "./TopHeader";

export interface MainProps {
  location: Section;
  className?: string;
  children: any;
}

export function Main({ location, className, children }: MainProps): JSX.Element {
  return (
    <>
      <TopHeader location={location} />
      <div className="govuk-width-container">
        <SubHeader />
        <main
          className={`govuk-main-wrapper govuk-main-wrapper--auto-spacing ${className ? className : ""}`}
          id="main-content"
          data-testid="main-content"
          role="main"
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
