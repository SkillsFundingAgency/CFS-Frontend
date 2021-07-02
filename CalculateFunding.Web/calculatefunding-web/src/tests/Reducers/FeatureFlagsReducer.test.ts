import { reduceFeatureFlagsState } from "../../reducers/featureFlagsReducer";
import { FeatureFlagsActionTypes } from "../../actions/FeatureFlagsActions";

describe("FeatureFlagsReducer", () => {
    it("Should return the initial state", () => {
        expect(reduceFeatureFlagsState(undefined, {
            type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
            payload: [] })).toEqual({
            enableReactQueryDevTool: false, 
            templateBuilderVisible: false, 
            releaseTimetableVisible: false, 
            specToSpec: false, 
            profilingPatternVisible: false});
    });

    it("Should handle get feature flags action", () => {
        expect(reduceFeatureFlagsState({ 
            templateBuilderVisible: false, 
            releaseTimetableVisible: false, 
            profilingPatternVisible: false, 
            specToSpec: false, 
            enableReactQueryDevTool: false }, {
            type: FeatureFlagsActionTypes.GET_FEATUREFLAGS,
            payload: [{ name: "TemplateBuilderVisible", isEnabled: true }, { name: "Feature2", isEnabled: false }] 
        })).toEqual({ 
            enableReactQueryDevTool: false,
            templateBuilderVisible: true, 
            releaseTimetableVisible: false, 
            specToSpec: false, 
            profilingPatternVisible: false })
    })
});


