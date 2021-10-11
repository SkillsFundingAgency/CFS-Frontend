import { render, screen } from "@testing-library/react";
import React from "react";

import { Tag, TagTypes } from "../../components/Tag";

describe("<Tag>", () => {
  it("should have correct text", () => {
    render(<Tag type={TagTypes.default} text={"default"} />);
    expect(screen.getByText("default"));
  });

  it("should have correct colour", () => {
    render(<Tag text={"Color Check"} type={TagTypes.red} />);
    const textEl = screen.getByText("Color Check") as HTMLElement;
    expect(textEl).toBeInTheDocument();
    expect(textEl.getAttribute("class")).not.toHaveLength(0);
    expect(textEl.getAttribute("class")?.includes("govuk-tag--red"));
  });
});
