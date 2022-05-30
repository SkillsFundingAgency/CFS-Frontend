import { render, screen } from "@testing-library/react";
import React from "react";

import { TableResultsSummary } from "../../components/TableResultsSummary";

describe("<TableResultsSummary /> ", () => {
  it("renders correctly", () => {
    render(<TableResultsSummary totalResults={100} startItemNumber={1} endItemNumber={10} />);
    expect(screen.getByText("Showing 1 - 10 of 100 results")).toBeInTheDocument();
  });

  it("has the correct styling rule", () => {
    const { container } = render(
      <TableResultsSummary totalResults={100} startItemNumber={1} endItemNumber={10} />
    );
    expect(container.querySelector(".hods-pagination__summary")).toBeInTheDocument();
  });
});
