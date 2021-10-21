import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PermissionsCategories } from "../../../types/Permission";
import { buildPermissions } from "../../fakes/testFactories";
import * as MyPermissionsTests from "./MyPermissions.shared";

describe("<MyPermissions/>", () => {
  describe("given there is an admin user for the selected funding stream ", () => {
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

    it("admin username is rendered", async () => {
      const combobox = screen.getByRole("combobox", { name: /Select funding stream/i });
      expect(within(combobox).getByRole("option", { name: /Direct School Grant/ })).toBeInTheDocument();

      userEvent.selectOptions(combobox, "DSG");

      expect(await screen.findByText("Admin User")).toBeInTheDocument();
    });
  });

  describe("given there is no admin user for the selected funding stream ", () => {
    beforeEach(() => {
      MyPermissionsTests.hasNoAdminUsers();
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

    it("admin username is not rendered", async () => {
      const { getAdminUsersForFundingStream } = require("../../../services/userService");
      const combobox = screen.getByRole("combobox", { name: /Select funding stream/i });
      expect(within(combobox).getByRole("option", { name: /Direct School Grant/ })).toBeInTheDocument();

      userEvent.selectOptions(combobox, "DSG");

      expect(getAdminUsersForFundingStream).toBeCalled();

      await waitFor(() => expect(screen.queryByText("Admin User")).not.toBeInTheDocument());
    });
  });

  describe("when no permissions defined at all", () => {
    beforeEach(() => {
      MyPermissionsTests.useSelectorSpy.mockReturnValue([]);
      MyPermissionsTests.renderPage();
    });

    afterAll(() => {
      MyPermissionsTests.useSelectorSpy.mockClear();
    });

    it("renders default warning", async () => {
      expect(screen.getByText(/You have read only access for all funding streams/)).toBeInTheDocument();
    });
  });

  describe("when permissions defined but all disabled", () => {
    beforeEach(() => {
      const permissions = [
        buildPermissions({
          fundingStreamId: "DSG",
          fundingStreamName: "Direct School Grant",
          setAllPermsEnabled: false,
        }),
      ];
      MyPermissionsTests.useSelectorSpy.mockReturnValue(permissions);

      MyPermissionsTests.renderPage();
    });

    afterAll(() => {
      MyPermissionsTests.useSelectorSpy.mockClear();
    });

    it("does not render default warning", async () => {
      expect(screen.queryByText(/You have read only access for all funding streams/)).not.toBeInTheDocument();
    });

    it("renders funding stream selections correctly", async () => {
      const combobox = screen.getByRole("combobox", { name: /Select funding stream/i });
      expect(within(combobox).getByRole("option", { name: /Direct School Grant/ })).toBeInTheDocument();

      userEvent.selectOptions(combobox, "DSG");

      expect(
        Object.keys(PermissionsCategories).map((cat) => {
          screen.getByRole("table", { name: cat });
        })
      );
      expect(
        screen.getByRole("heading", {
          name: /You have these permissions for the Direct School Grant funding stream in the Calculate Funding Service/,
        })
      );
      const yesCells = screen.queryAllByRole("cell", { name: /Yes/ });
      expect(yesCells).toHaveLength(0);
      const noCells = screen.queryAllByRole("cell", { name: /No/ });
      expect(noCells.length).toBeGreaterThanOrEqual(1);
    });
  });
});
