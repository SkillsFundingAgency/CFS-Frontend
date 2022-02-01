import { useSelector } from "react-redux";

import { IStoreState } from "../reducers/rootReducer";
import { FeatureFlagsState } from "../states/FeatureFlagsState";

export const useFeatureFlags = () => {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
        (state) => state.featureFlags
    );


    return { featureFlagsState }
}
