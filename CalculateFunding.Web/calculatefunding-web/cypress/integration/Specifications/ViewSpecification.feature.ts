import {makeServer, mockApiData} from "../../../src/mirage";
import {Server} from "miragejs";

context('View Specification page', () => {
    const data = mockApiData();

    let server: Server;

    beforeEach(() => {
        server = makeServer({environment: 'test'});
        cy.visit('/SpecificationsList')
    });
    afterEach(() => {
        server.shutdown();
    });

    describe('go to Specifications List page', () => {

    });
});