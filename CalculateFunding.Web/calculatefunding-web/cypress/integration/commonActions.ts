import {Server} from "miragejs";

export const commonActions = () => {
    const goToSpecificationsList = () => {
        cy.findAllByRole('link', {name: /Specifications/i})
            .first()
            .click()
    }
    const goToSpecification = (specName: string) => {
        goToSpecificationsList();
        cy.findByRole('link', {name: specName})
            .first()
            .click()
    };

    const specifyDatasetTypeToCreate_Uploaded = (theServer: Server, data: any) => {
        cy.findByRole('link', {name: data.spec1.name})
            .should('exist');
        cy.findByRole('radio', {name: /Uploaded data/})
            .check();
        cy.findByRole('button', {name: /Continue/})
            .click();
        cy.url()
            .should('include', `/Datasets/CreateDataset/${data.spec1.id}`);
    };

    const specifyDatasetTypeToCreate_Released = (theServer: Server, data: any) => {
        cy.findByRole('link', {name: data.spec1.name})
            .should('exist');
        cy.findByRole('radio', {name: /Released data/})
            .check();
        cy.findByRole('button', {name: /Continue/})
            .click();
        cy.url().should('include', `/Datasets/Create/SelectReferenceSpecification/${data.spec1.id}`);
    };

    const selectReferenceSpecification = (theServer: Server, data: any) => {
        cy.findByRole('combobox', {name: /Select funding stream/})
            .select(data.fundingStream2.name);
        cy.findByRole('combobox', {name: /Select funding period/})
            .select(data.fundingPeriod2.name);
        cy.findByText(data.spec2.name)
            .should('exist');
        cy.findByRole('button', {name: /Continue/})
            .click();
        cy.url().should('include', `/Datasets/Create/SpecifyDatasetDetails`);
    };

    const specifyDatasetDetails = (theServer: Server, data: any) => {
        cy.findByRole('link', {name: data.spec1.name})
            .should('exist');
        cy.findByRole('textbox', {name: /Data set name/})
            .type('Dataset123');
        cy.findByRole('textbox', {name: /Description/})
            .type('lorem ipsum description');
        cy.findByRole('button', {name: /Continue/})
            .click();
        cy.url()
            .should('include', `/Datasets/Create/SelectDatasetTemplateItems/${data.spec1.id}`);
    };

    const selectTemplateItems = (theServer: Server, data: any) => {
        cy.findByRole('link', {name: data.spec1.name})
            .should('exist');
        cy.findByRole('checkbox', {name: /Calculate total pupil mass/})
            .check();
        cy.findByRole('button', {name: /Continue to summary/})
            .click();
        cy.url()
            .should('include', `/Datasets/Create/ConfirmDatasetToCreate/${data.spec1.id}`);
    };

    return {
        goToSpecificationsList,
        goToSpecification,
        specifyDatasetTypeToCreate_Uploaded,
        specifyDatasetTypeToCreate_Released,
        selectTemplateItems,
        specifyDatasetDetails,
        selectReferenceSpecification,
    }
}