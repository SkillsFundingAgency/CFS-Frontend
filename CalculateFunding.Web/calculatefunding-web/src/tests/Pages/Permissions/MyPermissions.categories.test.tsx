import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PermissionsCategories } from "../../../types/Permission";
import { buildPermissions } from "../../fakes/testFactories";
import * as MyPermissionsTests from "./MyPermissions.shared";

describe("when permissions defined and user has one permission enabled", () => {
  beforeEach(() => {
    MyPermissionsTests.hasAdminUser();
    const permissions = [
      buildPermissions({
        fundingStreamId: "DSG",
        fundingStreamName: "Direct School Grant",
        setAllPermsEnabled: false,
        actions: [(p) => (p.canCreateSpecification = true)],
      }),
    ];
    MyPermissionsTests.useSelectorSpy.mockReturnValue(permissions);

    MyPermissionsTests.renderPage();
  });

  afterAll(() => {
    MyPermissionsTests.useSelectorSpy.mockClear();
  });

  it("renders funding stream selections", async () => {
    // renderPage();

    const combobox = await screen.findByRole("combobox", { name: /Select funding stream/i });
    expect(within(combobox).getByRole("option", { name: /Direct School Grant/ })).toBeInTheDocument();

    userEvent.selectOptions(combobox, "DSG");

    expect(
      screen.getByRole("heading", {
        name: /You have these permissions for the Direct School Grant funding stream in the Calculate Funding Service/,
      })
    );
    expect(
      await waitFor(() =>
        Object.keys(PermissionsCategories).map((cat) => {
          screen.getByRole("table", { name: cat });
        })
      )
    );
  });
});
