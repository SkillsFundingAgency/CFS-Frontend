import {makeServer, mockApiData} from "../../../src/mirage";
import {Server} from "miragejs";
import {ProviderDataTrackingMode} from "../../../src/types/Specifications/ProviderDataTrackingMode";
import {SpecificationSummary} from "../../../src/types/SpecificationSummary";
import {commonActions} from "../commonActions";

context('Create new dataset', () => {
    const data = mockApiData();
    const {specifyDatasetTypeToCreate_Released, selectReferenceSpecification, specifyDatasetDetails, selectTemplateItems} = commonActions();

    let server: Server;

    beforeEach(() => {
        server = makeServer({environment: 'test'});
        server.get(
            '/specs/*',
            (schema, request) => {
                return {
                    id: "111",
                    name: "PSG 19-20",
                    fundingPeriod: data.fundingPeriod1,
                    fundingStreams: [data.fundingStream1],
                    lastUpdatedDate: undefined,
                    approvalStatus: "Draft",
                    description: "lorem ipsum lalala",
                    isSelectedForFunding: false,
                    templateIds: {},
                    coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
                    providerSnapshotId: undefined,
                    dataDefinitionRelationshipIds: [],
                    providerVersionId: '',
                } as SpecificationSummary
            }
        );
        cy.visit('/Datasets/Create/SelectDatasetTypeToCreate/' + data.spec1.id)
        specifyDatasetTypeToCreate_Released(server, data);
        selectReferenceSpecification(server, data);
        specifyDatasetDetails(server, data);
        selectTemplateItems(server, data);
    });
    afterEach(() => {
        server.shutdown();
    });

    describe('when page has loaded', () => {
        it('has correct title', () => {
            cy.findByRole('heading', {name: /Which data set type?/})
                .should('exist');
        })
        it('has Released option', () => {
            cy.findByRole('radio', {name: /Released data/})
                .should('exist');
        })
        it('has Uploaded option', () => {
            cy.findByRole('radio', {name: /Uploaded data/})
                .should('exist');
        })
        it('has link to spec', () => {
            cy.findByRole('link', {name: data.spec1.name})
                .should('exist');
        })
    });

    describe('when user tries to continue without selection', () => {
        it('displays error', () => {
            cy.findByRole('link', {name: data.spec1.name})
                .should('exist');
            cy.findByRole('button', {name: /Continue/})
                .click();
            cy.findByText(/Select released data or uploaded data/)
                .should('exist');
        });
    });

    describe('when user selects Released option and then Continue', () => {
        it('goes to correct page', () => {
            cy.findByRole('link', {name: data.spec1.name})
                .should('exist');
            cy.findByRole('radio', {name: /Released data/})
                .check();
            cy.findByRole('button', {name: /Continue/})
                .click();
            cy.url()
                .should('include', `/Datasets/Create/SelectReferenceSpecification/${data.spec1.id}`);
        })
    });

    describe('when user selects Uploaded option and then Continue', () => {
        it('goes to correct page', () => {
            cy.findByRole('link', {name: data.spec1.name})
                .should('exist');
            cy.findByRole('radio', {name: /Uploaded data/})
                .check();
            cy.findByRole('button', {name: /Continue/})
                .click();
            cy.url()
                .should('include', `/Datasets/CreateDataset/${data.spec1.id}`);
        })
    });
});