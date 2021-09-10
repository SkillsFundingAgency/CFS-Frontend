import { queryByTestId, render, screen } from "@testing-library/react";
import React from "react";

import { AccordionPanel } from "../../components/AccordionPanel";

describe("<AccordianPanel />", () => {
  it(" renders a panel", () => {
    const { container } = render(
      <AccordionPanel
        autoExpand={true}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={false}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(container.querySelector(".govuk-accordion__section")).toBeInTheDocument();
  });

  it(" has an auto expanded panel", () => {
    const { container } = render(
      <AccordionPanel
        autoExpand={true}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={true}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(container.querySelector(".govuk-accordion__section--expanded")).toBeInTheDocument();
  });

  it(" has a manually expanded panel", () => {
    const { container } = render(
      <AccordionPanel
        autoExpand={false}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={true}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(container.querySelector(".govuk-accordion__section--expanded")).toBeInTheDocument();
  });

  it(" has the correct title", () => {
    render(
      <AccordionPanel
        autoExpand={false}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={true}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(screen.getByText(/Test Title/)).toBeInTheDocument();
  });

  it(" has the correct sub title", () => {
    render(
      <AccordionPanel
        autoExpand={false}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={true}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(screen.getByText(/Test Subtitle/)).toBeInTheDocument();
  });

  it(" has the correct bold sub title", () => {
    render(
      <AccordionPanel
        autoExpand={false}
        id="testPanel"
        children={null}
        boldSubtitle="Bold Test Subtitle"
        expanded={true}
        subtitle="Test Subtitle"
        title="Test Title"
      />
    );

    expect(screen.getByText(/Bold Test Subtitle/)).toBeInTheDocument();
  });
});
