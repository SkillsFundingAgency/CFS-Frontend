import {render, screen, waitFor, within} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {MyPermissions} from "../../../pages/Permissions/MyPermissions";
import * as redux from "react-redux";
import {buildPermissions} from "../../fakes/testFactories";
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";

describe("<MyPermissions/>", () => {

    describe("given there is an admin user for the selected funding stream ", () => {
        beforeEach(() => {
            hasAdminUser();
            const permissions = [buildPermissions({
                fundingStreamId: "DSG",
                fundingStreamName: "Direct School Grant",
                setAllPermsEnabled: false,
                actions: [p => p.canCreateSpecification = true]
            })];
            useSelectorSpy.mockReturnValue(permissions);

            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("admin username is rendered", async () => {
            const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
            expect(within(combobox).getByRole("option", {name: /Direct School Grant/})).toBeInTheDocument();

            userEvent.selectOptions(combobox, "DSG");

            expect(await screen.findByText("Admin User")).toBeInTheDocument();
        });
    });

    describe("given there is no admin user for the selected funding stream ", () => {
        beforeEach(() => {
            hasNoAdminUsers();
            const permissions = [buildPermissions({
                fundingStreamId: "DSG",
                fundingStreamName: "Direct School Grant",
                setAllPermsEnabled: false,
                actions: [p => p.canCreateSpecification = true]
            })];
            useSelectorSpy.mockReturnValue(permissions);

            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("admin username is not rendered", async () => {
            const {getAdminUsersForFundingStream} = require('../../../services/userService');
            const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
            expect(within(combobox).getByRole("option", {name: /Direct School Grant/})).toBeInTheDocument();

            userEvent.selectOptions(combobox, "DSG");

            expect(getAdminUsersForFundingStream).toBeCalled();

            await waitFor(() => expect(screen.queryByText("Admin User")).not.toBeInTheDocument());
        });
    });

    describe("when no permissions defined at all", () => {
        beforeEach(() => {
            useSelectorSpy.mockReturnValue([]);
            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("renders default warning", async () => {
            expect(screen.getByText(/You have read only access for all funding streams/)).toBeInTheDocument();
        });
    });

    describe("when permissions defined but all disabled", () => {
        beforeEach(() => {
            const permissions = [buildPermissions({
                fundingStreamId: "DSG",
                fundingStreamName: "Direct School Grant",
                setAllPermsEnabled: false
            })];
            useSelectorSpy.mockReturnValue(permissions);

            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("does not render default warning", async () => {
            expect(screen.queryByText(/You have read only access for all funding streams/)).not.toBeInTheDocument();
        });

        it("renders funding stream selections correctly", async () => {
            const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
            expect(within(combobox).getByRole("option", {name: /Direct School Grant/})).toBeInTheDocument();

            userEvent.selectOptions(combobox, "DSG");

            expect(await screen.findByRole("table", {name: /Calculate Funding Service permissions/}));
            expect(screen.getByRole("heading", {name: /You have these permissions for the Direct School Grant funding stream in the Calculate Funding Service/}));
            const yesCells = screen.queryAllByRole("cell", {name: /Yes/});
            expect(yesCells).toHaveLength(0);
            const noCells = screen.queryAllByRole("cell", {name: /No/});
            expect(noCells.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("when permissions defined and user has one permission enabled", () => {
        beforeEach(() => {
            hasAdminUser();
            const permissions = [buildPermissions({
                fundingStreamId: "DSG",
                fundingStreamName: "Direct School Grant",
                setAllPermsEnabled: false,
                actions: [p => p.canCreateSpecification = true]
            })];
            useSelectorSpy.mockReturnValue(permissions);

            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("does not render default warning", async () => {
            expect(screen.queryByText(/You have read only access for all funding streams/)).not.toBeInTheDocument();
        });

        it("renders funding stream selections", async () => {
            const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
            expect(within(combobox).getByRole("option", {name: /Direct School Grant/})).toBeInTheDocument();

            userEvent.selectOptions(combobox, "DSG");

            expect(await screen.findByRole("table", {name: /Calculate Funding Service permissions/}));
            expect(screen.getByRole("heading", {name: /You have these permissions for the Direct School Grant funding stream in the Calculate Funding Service/}));
            const rowHeader = screen.getByRole("rowheader", {name: /Can create specifications/});
            const row = rowHeader.closest("tr") as HTMLTableRowElement;
            expect(within(row).getByRole("cell", {name: /Yes/})).toBeInTheDocument();

            const yesCells = screen.queryAllByRole("cell", {name: /Yes/});
            expect(yesCells).toHaveLength(1);
            const noCells = screen.queryAllByRole("cell", {name: /No/});
            expect(noCells.length).toBeGreaterThanOrEqual(1);
        });
    });

});

const hasAdminUser = () => {
    jest.mock("../../../services/userService", () => {
        const service = jest.requireActual("../../../services/userService");
        return {
            ...service,
            getAdminUsersForFundingStream: jest.fn(() => Promise.resolve({
                status: 200,
                data: [
                    {
                        username: "Admin User",
                        hasConfirmedSkills: false
                    }
                ]
            }))
        }
    });
}
const hasNoAdminUsers = () => {
    jest.mock("../../../services/userService", () => {
        const service = jest.requireActual("../../../services/userService");
        return {
            ...service,
            getAdminUsersForFundingStream: jest.fn(() => Promise.resolve({
                status: 200,
                data: []
            }))
        }
    });
}

const renderPage = () => {
    const {MyPermissions} = require('../../../pages/Permissions/MyPermissions')
    return render(<MemoryRouter initialEntries={['/Permissions/MyPermissions']}>
        <Switch>
            <Route path="/Permissions/MyPermissions"
                   component={MyPermissions}/>
        </Switch>
    </MemoryRouter>)
}

const useSelectorSpy = jest.spyOn(redux, 'useSelector');