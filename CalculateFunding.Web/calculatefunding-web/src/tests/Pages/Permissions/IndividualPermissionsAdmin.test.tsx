import {buildPermissions} from "../../fakes/testFactories";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Switch} from "react-router";
import * as redux from "react-redux";
import React from "react";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import {findUsers} from "../../../services/userService";
import {UserSearchResult, UserSearchResultItem} from "../../../types/Users/UserSearchResult";
import {Permission} from "../../../types/Permission";
import {FundingStream} from "../../../types/viewFundingTypes";

describe("<IndividualPermissionsAdmin/>", () => {

    describe("given I am an admin user for a funding stream ", () => {
        beforeEach(() => {
            mockUserService();
            const permissions = [buildPermissions({
                fundingStreamId: mockFundingStream.id,
                fundingStreamName: mockFundingStream.name,
                setAllPermsEnabled: false,
                actions: [p => p.canAdministerFundingStream = true]
            })];
            useSelectorSpy.mockReturnValue(permissions);

            renderPage();
        });

        afterAll(() => {
            useSelectorSpy.mockClear();
        });

        it("does not render default warning", async () => {
            expect(screen.queryByText(/You don't have any admin permissions/)).not.toBeInTheDocument();
        });

        it("renders page title", async () => {
            const title = (await screen.findByTestId('page-title'));
            expect(title).toBeInTheDocument();
            expect(await within(title).findByRole('heading', {name: /Set and view user permissions/})).toBeInTheDocument();
            expect(await within(title).findByText(/Assign and view permissions for users of Calculate funding service/)).toBeInTheDocument();
        });

        it("renders section heading", async () => {
            expect(await screen.findByRole('heading', {name: /Set and view user permissions/})).toBeInTheDocument();
        });

        describe("when I select a user", () => {

            beforeEach(() => {
                const userSearchbox = screen.getByTestId("input-auto-complete");

                userEvent.type(userSearchbox, mockUser.name);
                fireEvent.change(userSearchbox, {target: {value: mockUser.name}});
                fireEvent.click(screen.getByTestId(mockUser.name), {target: {innerText: mockUser.name}});
            });

            it("calls api to find users", async () => {
                const {findUsers} = require('../../../services/userService');
                expect(findUsers).toBeCalled();
            });

            it("then shows the funding stream selection list", async () => {
                const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
                expect(combobox).toBeInTheDocument();
                expect(within(combobox).getByRole("option", {name: mockFundingStream.name})).toBeInTheDocument();
            });

            describe("and when I select a funding stream and click Continue", () => {

                beforeEach(async () => {
                    const combobox = screen.getByRole("combobox", {name: /Select funding stream/i});
                    userEvent.selectOptions(combobox, mockFundingStream.name);

                    const button = screen.getByRole("button", {name: /Continue/});
                    expect(button).toBeEnabled();

                    await waitFor(() => userEvent.click(button));
                });

                it("calls api to find the selected user's permissions for selected funding stream", async () => {
                    const {getOtherUsersPermissionsForFundingStream} = require('../../../services/userService');

                    expect(getOtherUsersPermissionsForFundingStream).toBeCalled();
                });

                it("renders different page title", async () => {
                    expect(screen.queryByTestId('page-title')).not.toBeInTheDocument();
                    expect(await screen.findByRole('heading', {name: /Set and view user permissions/})).toBeInTheDocument();
                });

                it("renders new description text", async () => {
                    expect(await screen.findByText(/Assign and view permissions for user 537 for Lalala funding stream/)).toBeInTheDocument();
                });

                it("renders the save button", async () => {
                    const button = screen.getByRole("button", {name: /Apply permissions/});
                    expect(button).toBeEnabled();
                });

                it("renders the remove button", async () => {
                    const button = screen.getByRole("button", {name: /Remove user permissions/});
                    expect(button).toBeEnabled();
                });

                it("renders the user's permissions correctly", async () => {
                    const allCheckboxes = screen.getAllByRole("checkbox");
                    allCheckboxes.forEach(checkbox => {
                        if (checkbox.title === Permission.CanCreateTemplates.toString())
                            expect(checkbox).toBeChecked();
                        else
                            expect(checkbox).not.toBeChecked();
                    });
                });

                describe("and when I change a permission and click to save it", () => {

                    beforeEach(async () => {
                        const checkbox1 = screen.getByRole("checkbox", {name: Permission.CanCreateTemplates.toString()});
                        expect(checkbox1).toBeInTheDocument();
                        expect(checkbox1).toBeChecked();
                        userEvent.click(checkbox1);
                        expect(checkbox1).not.toBeChecked();

                        const checkbox2 = screen.getByRole("checkbox", {name: Permission.CanMapDatasets.toString()});
                        expect(checkbox2).toBeInTheDocument();
                        expect(checkbox2).not.toBeChecked();
                        userEvent.click(checkbox2);
                        expect(checkbox2).toBeChecked();

                        const button = screen.getByRole("button", {name: /Apply permissions/});
                        expect(button).toBeEnabled();

                        await waitFor(() => userEvent.click(button));
                    });

                    it("calls the api correctly to save the updated permissions and displays notification",
                        async () => {
                            const {updateOtherUsersPermissionsForFundingStream} = require('../../../services/userService');

                            const expectedUpdate = buildPermissions({
                                fundingStreamId: mockFundingStream.id,
                                fundingStreamName: mockFundingStream.name,
                                userId: mockUser.id,
                                setAllPermsEnabled: false,
                                actions: [p => p.canMapDatasets = true]
                            });
                            expect(updateOtherUsersPermissionsForFundingStream).toBeCalledWith(expectedUpdate);
                            
                            const banner = await screen.findByTestId("notification-banner");
                            expect(banner).toBeInTheDocument();
                            expect(within(banner).getByRole("heading", {name: "Success"})).toBeInTheDocument();
                            expect(within(banner).getByText(/Permissions updated for/)).toBeInTheDocument();
                            expect(within(banner).getByText(/user 537/)).toBeInTheDocument();
                            expect(within(banner).getByText(/for Lalala funding stream/)).toBeInTheDocument();
                        });
                });

                describe("and when I click to remove all of a user's permissions", () => {

                    beforeEach(async () => {
                        const button = screen.getByRole("button", {name: /Remove user permissions/});
                        expect(button).toBeEnabled();

                        await waitFor(() => userEvent.click(button));
                    });

                    it("calls the api correctly to save the updated permissions and displays notification", async () => {
                        const modal = await screen.findByTestId("modal-confirmation-placeholder");
                        expect(modal).toBeInTheDocument();
                        expect(within(modal).getByText(/Are you sure you want to remove all user permissions for/)).toBeInTheDocument();
                        expect(within(modal).getByText(/user 537/)).toBeInTheDocument();
                        expect(within(modal).getByText(/and delete them from the Lalala funding stream?/)).toBeInTheDocument();
                        expect(within(modal).getByRole("button", {name: /No, stay on this page/})).toBeInTheDocument();
                        
                        const button = screen.getByRole("button", {name: /Yes, remove user permissions/});
                        expect(button).toBeEnabled();

                        await waitFor(() => userEvent.click(button));

                        const {removeOtherUserFromFundingStream} = require('../../../services/userService');
                        expect(removeOtherUserFromFundingStream).toBeCalledWith(mockUser.id, mockFundingStream.id);

                        const banner = await screen.findByTestId("notification-banner");
                        expect(banner).toBeInTheDocument();
                        expect(within(banner).getByRole("heading", {name: "Success"})).toBeInTheDocument();
                        expect(within(banner).getByText(/Removed/)).toBeInTheDocument();
                        expect(within(banner).getByText(/user 537/)).toBeInTheDocument();
                        expect(within(banner).getByText(/from Lalala funding stream/)).toBeInTheDocument();
                    });
                });
            });
        });
    });
});

const mockFundingStream: FundingStream = {
    id: "LLL",
    name: "Lalala"
}
const mockUser: UserSearchResultItem = {
    id: "user-id-537",
    name: "user 537",
    username: "user-537"
};
const mockUserSearchResult: UserSearchResult = {
    users: [mockUser]
};
const mockUserPermissions = buildPermissions({
    userId: "user-id-537",
    fundingStreamId: mockFundingStream.id,
    fundingStreamName: mockFundingStream.name,
    setAllPermsEnabled: false,
    actions: [p => p.canCreateTemplates = true]
});

const mockUserService = () => {
    jest.mock("../../../services/userService", () => {
        const service = jest.requireActual("../../../services/userService");
        return {
            ...service,
            findUsers: jest.fn(() => Promise.resolve({
                status: 200,
                data: mockUserSearchResult
            })),
            getOtherUsersPermissionsForFundingStream: jest.fn(() => Promise.resolve({
                status: 200,
                data: mockUserPermissions
            })),
            updateOtherUsersPermissionsForFundingStream: jest.fn(() => Promise.resolve({
                status: 200,
                data: mockUserPermissions
            })),
            removeOtherUserFromFundingStream: jest.fn(() => Promise.resolve({
                status: 200
            }))
        }
    });
};

const renderPage = async () => {
    const {IndividualPermissionsAdmin} = require('../../../pages/Permissions/IndividualPermissionsAdmin')
    return render(<MemoryRouter initialEntries={['/Permissions/Individual']}>
            <QueryClientProviderTestWrapper>
                <Switch>
                    <Route path="/Permissions/Individual"
                           component={IndividualPermissionsAdmin}/>
                </Switch>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>
    )
};

const useSelectorSpy = jest.spyOn(redux, 'useSelector');
