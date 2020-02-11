import configureMockStore from 'redux-mock-store';
import {ProviderActionTypes} from "../../actions/ProviderActions";
import thunk from "redux-thunk";

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

describe('Provider actions ', () => {
    it('calls the provider funding', () => {
        store.dispatch({type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ProviderActionTypes.GET_PROVIDERBYIDANDVERSION});
    });

    it('calls the provider transactions', () => {
        store.dispatch({type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS});
        const actions = store.getActions();

        expect(actions[1]).toEqual({type: ProviderActionTypes.GET_PUBLISHEDPROVIDERTRANSACTIONS});
    });
});