import {screen, waitFor, within} from "@testing-library/react";
import {SpecificationTestData} from "./SpecificationTestData";
import {getSpecificationSummaryService} from "../../../services/specificationService";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import userEvent from "@testing-library/user-event";

const test = SpecificationTestData();

describe("<EditSpecification />", () => {

    describe("<EditSpecification /> with FDZ", () => {
        beforeEach(async () => {
            test.mockSpecificationService(test.specificationFdz);
            test.mockProviderService();
            test.mockProviderVersionService();
            test.mockPolicyService(ProviderSource.FDZ, ApprovalMode.All);

            await test.renderEditSpecificationPage(test.specificationFdz.id);

            await waitFor(() => {
                expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
            });
        });

        afterEach(() => jest.clearAllMocks());

        describe("service call tests", () => {

            it("it calls the specificationService", async () => {
                const {getSpecificationSummaryService} = require('../../../services/specificationService');
                await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
            });

            it("it calls the policyService getPublishedTemplatesByStreamAndPeriod", async () => {
                const {getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
            });

            it("it calls the policyService getFundingConfiguration", async () => {
                const {getFundingConfiguration} = require('../../../services/policyService');
                await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));
            });

            it("it calls the providerService getProviderSnapshotsForFundingStreamService", async () => {
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
            });

            it("it does not call the providerVersionService getProviderByFundingStreamIdService", async () => {
                const {getCoreProvidersByFundingStream} = require('../../../services/providerVersionService');
                expect(getCoreProvidersByFundingStream).not.toBeCalled();
            });

        });

        describe("page render tests", () => {

            it("does not render any errors", async () => {
                expect(await screen.queryByTestId("error-summary")).not.toBeInTheDocument();
            });

            it('the breadcrumbs are correct', async () => {
                expect((await screen.findAllByText(/Edit specification/))[0]).toHaveClass("govuk-breadcrumbs__list-item");
            });

            it('will have the correct breadcrumbs', async () => {
                expect(await screen.findAllByTestId("breadcrumb")).toHaveLength(3);
            });

            it('will have the correct <H1 /> title', async () => {
                expect((await screen.findAllByText(/Edit specification/))[1]).toHaveClass("govuk-fieldset__heading");
            });

            it("renders the specification name", async () => {
                const specNameInput = screen.getByRole("textbox", {name: /Specification name/});
                expect(specNameInput).toHaveValue(test.specificationFdz.name);
            });

            it("renders the specification description", async () => {
                const specNameInput = screen.getByRole("textbox", {name: /Can you provide more detail?/});
                expect(specNameInput).toHaveValue(test.specificationFdz.description);
            });

            it("renders the funding stream name", async () => {
                expect(screen.getByText("Funding stream")).toBeInTheDocument();
                expect(screen.getByRole("heading", {name: test.specificationFdz.fundingStreams[0].id}));
            });

            it("renders the funding period name", async () => {
                expect(screen.getByText("Funding period")).toBeInTheDocument();
                expect(screen.getByRole("heading", {name: test.specificationFdz.fundingPeriod.name}));
            });

            it("renders the Core provider options", async () => {
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));

                const coreProviderSelect = screen.getByRole("combobox", {name: /Core provider data/}) as HTMLSelectElement;
                expect(within(coreProviderSelect).getByRole("option", {name: /Select core provider/}));
                expect(within(coreProviderSelect).getByRole("option", {name: test.providerSnapshot1.name}));
                expect(within(coreProviderSelect).getByRole("option", {name: test.providerSnapshot2.name}));
            });

            it("renders the template options", async () => {
                const {getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));

                const templateVersionSelect = screen.getByRole("combobox", {name: /Template version/});
                expect(templateVersionSelect).toHaveLength(3);
                expect(within(templateVersionSelect).getByRole("option", {name: /Select template version/}));
                expect(within(templateVersionSelect).getByRole("option", {name: test.template1.templateVersion}));
                expect(within(templateVersionSelect).getByRole("option", {name: test.template2.templateVersion}));
            });

            it("renders the save button as enabled", async () => {
                const button = screen.getByRole("button", {name: /Save and continue/});
                expect(button).toBeEnabled();
            });
        });

        describe("form submission tests", () => {

            async function waitForPageToLoad() {
                const {getSpecificationSummaryService} = require('../../../services/specificationService');
                const {getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                const {getFundingConfiguration} = require('../../../services/policyService');
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');

                await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
                await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));
                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
            }

            it("it submits form successfully given nothing is changed", async () => {
                const {updateSpecificationService} = require('../../../services/specificationService');

                await waitForPageToLoad();

                const button = screen.getByRole("button", {name: /Save and continue/});
                expect(button).toBeEnabled();
                await waitFor(() => userEvent.click(button));

                expect(updateSpecificationService).toHaveBeenCalledWith({
                        assignedTemplateIds: {"stream-547": test.template2.templateVersion},
                        description: "Lorem ipsum lalala",
                        fundingPeriodId: test.fundingPeriod.id,
                        fundingStreamId: test.fundingStream.id,
                        name: test.specificationCfs.name,
                        providerSnapshotId: test.providerSnapshot2.providerSnapshotId,
                        providerVersionId: undefined,
                    }, test.specificationFdz.id
                );
                expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
            });

            it("it submits form given all fields are provided", async () => {
                await waitForPageToLoad();

                const coreProviderSelect = screen.getByRole("combobox", {name: /Core provider data/}) as HTMLSelectElement;
                expect(coreProviderSelect).toHaveLength(3);

                userEvent.selectOptions(coreProviderSelect, test.providerSnapshot1.name);

                const templateVersionSelect = screen.getByRole("combobox", {name: /Template version/});
                expect(templateVersionSelect).toHaveLength(3);

                userEvent.selectOptions(templateVersionSelect, test.template1.templateVersion);

                const descriptionTextArea = screen.getByRole("textbox", {name: /Can you provide more detail?/});
                userEvent.clear(descriptionTextArea);
                userEvent.type(descriptionTextArea, "new description");
                expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

                const button = screen.getByRole("button", {name: /Save and continue/});
                await waitFor(() => userEvent.click(button));

                const {updateSpecificationService} = require('../../../services/specificationService');
                expect(updateSpecificationService).toHaveBeenCalledWith({
                        assignedTemplateIds: {"stream-547": test.template1.templateVersion},
                        description: "new description",
                        fundingPeriodId: test.fundingPeriod.id,
                        fundingStreamId: test.fundingStream.id,
                        name: test.specificationCfs.name,
                        providerSnapshotId: test.providerSnapshot1.providerSnapshotId,
                        providerVersionId: undefined
                    }, test.specificationCfs.id
                );

                expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
            });
        })
    });
});
