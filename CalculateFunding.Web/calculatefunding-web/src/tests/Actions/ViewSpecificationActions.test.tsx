import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import {getSpecification, ViewSpecificationActionTypes} from "../../actions/ViewSpecificationResultsActions";


describe('getSpecification action', () => {

    // @ts-ignore
    let store;
    let httpMock: MockAdapter;
    let specificationId = "123";

    const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

    beforeEach(() => {
        httpMock = new MockAdapter(axios);
        const mockStore = configureMockStore();
        store = mockStore({});
        store.dispatch = jest.fn();
    });

    it('gets a specification', async () => {
        // given
        httpMock.onGet(`api/specs/specification-summary-by-id/${specificationId}`).reply(200, {
            status: 'success',
            message: '',
        });
        // when
        await flushAllPromises();
        // then
       expect(httpMock.onGet().networkError()).toBeFalsy();
    })
});
