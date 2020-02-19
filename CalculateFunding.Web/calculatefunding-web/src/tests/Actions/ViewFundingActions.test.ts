import configureMockStore from 'redux-mock-store';
import thunk from "redux-thunk";
import {ViewFundingActionTypes} from "../../actions/viewFundingAction";

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

describe('View Funding actions ', () => {
    it('calls the GET_LOCALAUTHORITIES action', () => {
        store.dispatch({type: ViewFundingActionTypes.GET_LOCALAUTHORITIES});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewFundingActionTypes.GET_LOCALAUTHORITIES});
    });
});