import configureMockStore from 'redux-mock-store';
import thunk from "redux-thunk";
import {SpecificationActionTypes} from "../../actions/SpecificationActions";

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

describe('Specification actions ', () => {

    afterEach(() => {
        store.clearActions();
    });

    it('calls the Get Release Timetable action', () => {
        store.dispatch({type: SpecificationActionTypes.GET_ALLSPECIFICATIONS});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: SpecificationActionTypes.GET_ALLSPECIFICATIONS});
    });
});