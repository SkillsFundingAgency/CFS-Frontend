import {makeServer, mockApiData} from "../../../src/mirage";
import {Server} from "miragejs";
import {commonActions} from "../commonActions";
import {
    PublishedSpecificationTemplateMetadata
} from "../../../src/types/Datasets/PublishedSpecificationTemplateMetadata";
import {ProviderDataTrackingMode} from "../../../src/types/Specifications/ProviderDataTrackingMode";
import {SpecificationSummary} from "../../../src/types/SpecificationSummary";
import {EligibleSpecificationReferenceModel} from "../../../src/types/Datasets/EligibleSpecificationReferenceModel";
import {TemplateItemType} from "../../../src/types/Datasets/TemplateItemType";

context('Confirm details for creating a new dataset from released', () => {
    const data = mockApiData();
    const {
        specifyDatasetTypeToCreate_Released,
        selectReferenceSpecification,
        specifyDatasetDetails,
        selectTemplateItems,
    } = commonActions();

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
        server.get(
            `/dataset-specifications/*`,
            (schema, request)
                : EligibleSpecificationReferenceModel[] | PublishedSpecificationTemplateMetadata[] => {
                if (request.url.includes('eligible-specification-references')) {
                    return [{
                        specificationId: data.spec2.id,
                        specificationName: data.spec2.name,
                        fundingStreamId: data.fundingStream2.id,
                        fundingStreamName: data.fundingStream2.name,
                        fundingPeriodId: data.fundingPeriod2.id,
                        fundingPeriodName: data.fundingPeriod2.name,
                    } as EligibleSpecificationReferenceModel]
                } else if (request.url.includes('published-specification-template-metadata')) {
                    return [{
                        name: 'Calculate total pupil mass',
                        templateId: 162,
                        type: TemplateItemType.Calculation
                    } as PublishedSpecificationTemplateMetadata,
                        {
                            name: 'Sport allowance',
                            templateId: 342,
                            type: TemplateItemType.FundingLine
                        } as PublishedSpecificationTemplateMetadata,
                    ]
                } else {
                    return [];
                }
            }
        );
        server.post(
            `/datasets/*`,
            (schema, request) => {
                return {};
            }
        );
        cy.visit('/Datasets/Create/SelectDatasetTypeToCreate/' + data.spec1.id)
        specifyDatasetTypeToCreate_Released(server, data);
        selectReferenceSpecification(server, data);
        specifyDatasetDetails(server, data);
        selectTemplateItems(server, data);
    });
    after(() => {
        server.shutdown();
    });

    describe('when page has loaded', () => {
        it('has correct title', () => {
            cy.findByRole('heading', {name: /Check funding lines\/calculations before creating data set/})
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
        it('has dataset name', () => {
            cy.findByText(/Dataset123/)
                .should('exist');
        });
        it('has dataset description', () => {
            cy.findByText(/lorem ipsum description/)
                .should('exist');
        });
        it('has template item name', () => {
            cy.findByText(/Calculate total pupil mass/)
                .should('exist');
        });
        it('has Create button', () => {
            cy.findByRole('button', {name: /Create data set/})
                .should('exist');
        });
    });

    describe('when user clicks Create', () => {
        it('goes to correct page', () => {
            cy.findByRole('button', {name: /Create data set/})
                .click();
            cy.url()
                .should('include', `/ViewSpecification/${data.spec1.id}?showDatasets=true`);
        })
    });
});