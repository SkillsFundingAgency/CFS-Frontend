import {render, screen, waitFor, within} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import * as redux from "react-redux";
import React from "react";
import {buildPermissions} from "../../fakes/testFactories";
import userEvent from "@testing-library/user-event";


describe("<Admin />", () => {

    describe("given I am an admin user for a funding stream ", () => {

        beforeEach(() => {
            const permissions = [buildPermissions({
                fundingStreamId: "asdf",
                fundingStreamName: "lorem ipsum",
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

        it("renders heading", async () => {
            expect(await screen.findByRole('heading', {name: /Would you like to view user permissions for/})).toBeInTheDocument();
        });

        it("renders by individual user option", async () => {
            expect(await screen.findByRole('radio', {name: /An individual user/})).toBeInTheDocument();
        });

        it("renders by funding stream option", async () => {
            expect(await screen.findByRole('radio', {name: /A funding stream/})).toBeInTheDocument();
        });

        describe("when I select to administer an individual user", () => {

            beforeEach(async () => {
                const option = screen.getByRole("radio", {name: /An individual user/});
                userEvent.click(option);

                const button = screen.getByRole("button", {name: /Continue/});
                expect(button).toBeEnabled();

                await waitFor(() => userEvent.click(button));
            });

            it("redirects to correct page", async () => {
                expect(mockHistoryPush).toBeCalledWith("/Permissions/Individual");
            });
        });
        
        describe("when I select to administer a funding stream", () => {

            beforeEach(async () => {
                const option = screen.getByRole("radio", {name: /A funding stream/});
                userEvent.click(option);

                const button = screen.getByRole("button", {name: /Continue/});
                expect(button).toBeEnabled();

                await waitFor(() => userEvent.click(button));
            });

            it("redirects to correct page", async () => {
                expect(mockHistoryPush).toBeCalledWith("/Permissions/FundingStream");
            });
        });
    });
});


const renderPage = async () => {
    const {Admin} = require('../../../pages/Permissions/Admin')
    return render(<MemoryRouter initialEntries={['/Permissions/Admin']}>
            <Switch>
                <Route path="/Permissions/Admin"
                       component={Admin}/>
            </Switch>
        </MemoryRouter>
    )
};

const mockHistoryPush = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush
    }),
}));
const useSelectorSpy = jest.spyOn(redux, 'useSelector');