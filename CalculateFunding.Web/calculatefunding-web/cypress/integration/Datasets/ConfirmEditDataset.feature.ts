import {makeServer, mockApiData} from "../../../src/mirage";
import {Server} from "miragejs";
import {ReferencedSpecificationRelationshipMetadata} from "../../../src/types/Datasets/ReferencedSpecificationRelationshipMetadata";

context('Confirm changes when editing a dataset from released data', () => {
    const data = mockApiData();

    let server: Server;

    beforeEach(() => {
        server = makeServer({environment: 'test'});
        server.get(
            `/specifications/*`,
            (schema, request)
                : ReferencedSpecificationRelationshipMetadata | object => {
                if (request.url.includes('/dataset-relationship/')) {
                    return data.relationshipMetadata1;
                } else {
                    return {};
                }
            });
        server.put(
            `/specifications/*`,
            (schema, request)
                : Boolean => {
                if (request.url.includes('/dataset-relationship/')) {
                    return true;
                } else {
                    return false;
                }
            });

        getToConfirmEditPage();
    });
    after(() => {
        server.shutdown();
    });
    
    function getToConfirmEditPage() {
        cy.visit(`/Datasets/${data.relationshipMetadata1.relationshipId}/Edit/${data.spec1.id}`);
        cy.findByRole('checkbox', {name: /calc b OBSOLETE/i})
            .check();
        cy.findByRole('button', {name: /Continue to summary/})
            .click();
        cy.url()
            .should('include', `/Datasets/${data.relationshipMetadata1.relationshipId}/ConfirmEdit/${data.spec1.id}`);
    }

    describe('when page has loaded', () => {
        it('has correct title', () => {
            cy.findByRole('heading', {name: /Check funding lines and calculations/})
                .should('exist');
        })
        it('has link to spec', () => {
            cy.findByRole('link', {name: data.spec1.name})
                .should('exist');
        })
        it('has Dataset details heading', () => {
            cy.findByRole('heading', {name: /Dataset details/})
                .should('exist');
        });
        it('has relationship name', () => {
            cy.findByText(/Relationship name/i)
                .should('exist');
        });
        it('has relationship description', () => {
            cy.findAllByText(/relationship description/i)
                .should('exist');
        });
        it('has selected template item names', () => {
            cy.findByRole('cell', {name: data.calc1.name})
                .should('exist');
            cy.findByRole('cell', {name: data.calc1.templateId.toString()})
                .should('exist');
            cy.findAllByRole('cell', {name: /Calculation/})
                .should('exist');
            cy.findByRole('cell', {name: data.calc2.name})
                .should('exist');
            cy.findByRole('cell', {name: data.calc2.templateId.toString()})
                .should('exist');
            cy.findByRole('cell', {name: data.fundingLine1.name})
                .should('exist');
            cy.findByRole('cell', {name: data.fundingLine1.templateId.toString()})
                .should('exist');
            cy.findByRole('cell', {name: /Funding Line/})
                .should('exist');
        });
        it('has Create button', () => {
            cy.findByRole('button', {name: /Update data set/})
                .should('exist');
        });
    });

    describe('when user clicks Create', () => {
        it('goes to correct page', () => {
            cy.findByRole('button', {name: /Update data set/})
                .click();
            cy.url()
                .should('include', `/ViewSpecification/${data.spec1.id}?showDatasets=true`);
        })
    });
});


