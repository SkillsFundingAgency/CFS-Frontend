import configureMockStore from 'redux-mock-store';
import {ProviderActionTypes} from "../../actions/ProviderActions";
import thunk from "redux-thunk";
import {ViewSpecificationActionTypes} from "../../actions/ViewSpecificationsActions";

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

describe('Specification actions ', () => {

    afterEach(() => {
        store.clearActions();
    });

    it('calls the Get Release Timetable action', () => {
        store.dispatch({type: ViewSpecificationActionTypes.GET_RELEASETIMETABLE});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewSpecificationActionTypes.GET_RELEASETIMETABLE});
    });

    it('calls the confirm timetable changes action', () => {
        store.dispatch({type: ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewSpecificationActionTypes.CONFIRM_TIMETABLECHANGES});
    });

    it('calls the get datasets action', () => {
        store.dispatch({type: ViewSpecificationActionTypes.GET_DATASETS});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewSpecificationActionTypes.GET_DATASETS});
    });

    it('calls the get specification action', () => {
        store.dispatch({type: ViewSpecificationActionTypes.GET_SPECIFICATION});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewSpecificationActionTypes.GET_SPECIFICATION});
    });

    it('calls the get additional calculations action', () => {
        store.dispatch({type: ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS});
        const actions = store.getActions();

        expect(actions[0]).toEqual({type: ViewSpecificationActionTypes.GET_ADDITIONALCALCULATIONS});
    });
});