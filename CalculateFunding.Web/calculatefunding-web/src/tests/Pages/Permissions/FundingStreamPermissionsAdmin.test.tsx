import {render, screen, waitFor, within} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import {QueryClientProviderTestWrapper} from "../../Hooks/QueryClientProviderTestWrapper";
import * as redux from "react-redux";
import React from "react";
import {FundingStream} from "../../../types/viewFundingTypes";
import {buildPermissions} from "../../fakes/testFactories";
import userEvent from "@testing-library/user-event";
import {ReportOnUsersWithFundingStreamPermissionsModel} from "../../../types/ReportOnUsersWithFundingStreamPermissionsModel";


describe("<FundingStreamPermissionsAdmin />", () => {

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
            expect(await within(title).findByRole('heading', {name: /Funding stream permissions/})).toBeInTheDocument();
            expect(await within(title).findByText(/Download all user permissions for a funding stream/)).toBeInTheDocument();
        });

        describe("when I select a funding stream", () => {
            
            beforeEach(async () => {
                const combobox = screen.getByRole("combobox", {name: /Select funding stream to download/i});
                userEvent.selectOptions(combobox, mockFundingStream.name);

                const button = screen.getByRole("button", {name: /Download/});
                expect(button).toBeEnabled();

                await waitFor(() => userEvent.click(button));
            });

            it("calls api to get report", async () => {
                const {getReportOnUsersByFundingStream} = require('../../../services/userService');
                expect(getReportOnUsersByFundingStream).toBeCalledWith(mockFundingStream.id);
            });

            it("displays report info", async () => {
                expect(await screen.findByText(/Report generated successfully/)).toBeInTheDocument();
                const link = screen.getByRole("link",  {name: /Download report/});
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', mockReport.url);
            });
        });
    });
});


const mockFundingStream: FundingStream = {
    id: "LLL",
    name: "Lalala"
}
const mockReport: ReportOnUsersWithFundingStreamPermissionsModel = {
    fileName: "xxx.xxx", 
    url: "xxx/xxx"
};

const mockUserService = () => {
    jest.mock("../../../services/userService", () => {
        const service = jest.requireActual("../../../services/userService");
        return {
            ...service,
            getReportOnUsersByFundingStream: jest.fn(() => Promise.resolve({
                status: 200,
                data: mockReport
            }))
        }
    });
};

const renderPage = async () => {
    const {FundingStreamPermissionsAdmin} = require('../../../pages/Permissions/FundingStreamPermissionsAdmin')
    return render(<MemoryRouter initialEntries={['/Permissions/FundingStream']}>
            <QueryClientProviderTestWrapper>
                <Switch>
                    <Route path="/Permissions/FundingStream"
                           component={FundingStreamPermissionsAdmin}/>
                </Switch>
            </QueryClientProviderTestWrapper>
        </MemoryRouter>
    )
};

const useSelectorSpy = jest.spyOn(redux, 'useSelector');