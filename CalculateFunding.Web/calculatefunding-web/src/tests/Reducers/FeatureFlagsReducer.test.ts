import { reduceFeatureFlagsState } from "../../reducers/featureFlagsReducer";
import { FeatureFlagsActionTypes } from "../../actions/FeatureFlagsActions";

describe("FeatureFlagsReducer", () => {
    it("Should return the initial state", () => {
        expect(reduceFeatureFlagsState(undefined, {
            type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
            payload: [] })).toEqual({templateBuilderVisible: false});
    });

    it("Should handle get feature flags action", () => {
        expect(reduceFeatureFlagsState({ templateBuilderVisible: false }, {
            type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
            payload: [{ name: "TemplateBuilderVisible", isEnabled: true }, { name: "Feature2", isEnabled: false }] 
        })).toEqual({ templateBuilderVisible: true })
    })
});


