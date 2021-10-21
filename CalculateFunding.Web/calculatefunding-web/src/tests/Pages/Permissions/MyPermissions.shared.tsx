import { render } from "@testing-library/react";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router";

const hasAdminUser = () => {
  jest.mock("../../../services/userService", () => {
    const service = jest.requireActual("../../../services/userService");
    return {
      ...service,
      getAdminUsersForFundingStream: jest.fn(() =>
        Promise.resolve({
          status: 200,
          data: [
            {
              username: "Admin User",
              hasConfirmedSkills: false,
            },
          ],
        })
      ),
    };
  });
};
const hasNoAdminUsers = () => {
  jest.mock("../../../services/userService", () => {
    const service = jest.requireActual("../../../services/userService");
    return {
      ...service,
      getAdminUsersForFundingStream: jest.fn(() =>
        Promise.resolve({
          status: 200,
          data: [],
        })
      ),
    };
  });
};

const renderPage = () => {
  const { MyPermissions } = require("../../../pages/Permissions/MyPermissions");
  return render(
    <MemoryRouter initialEntries={["/Permissions/MyPermissions"]}>
      <Switch>
        <Route path="/Permissions/MyPermissions" component={MyPermissions} />
      </Switch>
    </MemoryRouter>
  );
};

const useSelectorSpy = jest.spyOn(redux, "useSelector");

export { renderPage, hasAdminUser, hasNoAdminUsers, useSelectorSpy };
