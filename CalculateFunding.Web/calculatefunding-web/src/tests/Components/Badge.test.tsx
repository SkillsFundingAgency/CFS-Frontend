import { render, screen } from "@testing-library/react";
import React from "react";

import { Badge } from "../../components/Badge";

describe("<Badge> ", () => {
  it("shows the correct number of errors", () => {
    render(<Badge errorCount={100} />);
    expect(screen.getByText(100));
  });
});
