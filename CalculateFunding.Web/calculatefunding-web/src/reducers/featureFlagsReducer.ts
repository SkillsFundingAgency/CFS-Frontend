import {FeatureFlagsState} from "../states/FeatureFlagsState";
import {GetFeatureFlagsAction, FeatureFlagsActionTypes} from "../actions/FeatureFlagsActions";
import { FeatureFlagKey, FeatureFlag } from "../types/FeatureFlag";
import { Reducer } from "redux";

const initialState: FeatureFlagsState = {
    templateBuilderVisible: false,
    releaseTimetableVisible: false,
    enableReactQueryDevTool: false,
    profilingPatternVisible: undefined
};

function isFeatureEnabled(featureFlags: FeatureFlag[], targetFeature: FeatureFlagKey): boolean {
    const flag = featureFlags.find(f => f.name === targetFeature);
    return flag !== undefined ? flag.isEnabled : false
}

export const reduceFeatureFlagsState: Reducer<FeatureFlagsState, GetFeatureFlagsAction> = (state: FeatureFlagsState = initialState, action: GetFeatureFlagsAction): FeatureFlagsState => {
    switch (action.type) {
        case FeatureFlagsActionTypes.GET_FEATUREFLAGS:
            return {
                ...state,
                templateBuilderVisible: isFeatureEnabled(action.payload, FeatureFlagKey.TemplateBuilderVisible),
                releaseTimetableVisible: isFeatureEnabled(action.payload, FeatureFlagKey.ReleaseTimetableVisible),
                enableReactQueryDevTool: isFeatureEnabled(action.payload, FeatureFlagKey.EnableReactQueryDevTool),
                profilingPatternVisible: isFeatureEnabled(action.payload, FeatureFlagKey.ProfilingPatternVisible)
            };
        default:
            return state;
    }
};