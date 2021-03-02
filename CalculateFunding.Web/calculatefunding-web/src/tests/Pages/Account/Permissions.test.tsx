import {render, screen, within} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {QueryClient, QueryClientProvider} from "react-query";
import React from "react";
import {Permissions} from "../../../pages/Account/Permissions";
import * as redux from "react-redux";
import {buildPermissions} from "../../fakes/testFactories";
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";

const renderPage = () => {
    const {Permissions} = require("../../../pages/Account/Permissions");
    return render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                <Permissions/>
            </QueryClientProvider>
        </MemoryRouter>);
};
const useSelectorSpy = jest.spyOn(redux, 'useSelector');


describe("<Permissions/>", () => {
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
            const permissions = [buildPermissions({fundingStreamId: "DSG", fundingStreamName: "Direct School Grant", setAllPermsEnabled: false})];
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

            expect(screen.getByRole("table", {name: /Calculate Funding Service permissions/}));
            expect(screen.getByRole("heading", {name: /You have these permissions for the Direct School Grant funding stream in the Calculate Funding Service/}));
            const yesCells = screen.queryAllByRole("cell", {name: /Yes/});
            expect(yesCells).toHaveLength(0);
            const noCells = screen.queryAllByRole("cell", {name: /No/});
            expect(noCells.length).toBeGreaterThanOrEqual(1);
        });
    });
    
    describe("when permissions defined and user has one permission enabled", () => {
        beforeEach(() => {
            const permissions = [buildPermissions({fundingStreamId: "DSG", fundingStreamName: "Direct School Grant", setAllPermsEnabled: false, actions: [p => p.canCreateSpecification = true]})];
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
        });

        it("renders funding stream selections", async () => {
            const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
            expect(within(combobox).getByRole("option", {name: /Direct School Grant/})).toBeInTheDocument();
            
            userEvent.selectOptions(combobox, "DSG");
            
            expect(screen.getByRole("table", {name: /Calculate Funding Service permissions/}));
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