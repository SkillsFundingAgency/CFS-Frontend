import { render, screen } from "@testing-library/react";
import React from "react";

import { TableResults } from "../../components/TableResults";

describe("<TableResults /> ", () => {
  it("renders correctly", () => {
    render(<TableResults totalResults={100} startItemNumber={1} endItemNumber={10} />);
    expect(screen.getByText("Showing 1 - 10 of 100 results")).toBeInTheDocument();
  });

  it("has the correct styling rule", () => {
    const { container } = render(<TableResults totalResults={100} startItemNumber={1} endItemNumber={10} />);
    expect(container.querySelector(".pagination__summary")).toBeInTheDocument();
  });
});
