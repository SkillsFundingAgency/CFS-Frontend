import * as featureFlagsHook from "../../hooks/useFeatureFlags";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";

export const featureFlagsTestUtils = () => {
  const setupFeatureFlags = (overrides: Partial<FeatureFlagsState>) => {
    const featureFlagsSpy = jest.spyOn(featureFlagsHook, "useFeatureFlags");
    const featureFlagsState: FeatureFlagsState = {
      enableReactQueryDevTool: false,
      profilingPatternVisible: true,
      releaseTimetableVisible: true,
      specToSpec: true,
      templateBuilderVisible: true,
      enableNewFundingManagement: true,
      ...overrides,
    };
    featureFlagsSpy.mockImplementation(() => featureFlagsState);
    return featureFlagsSpy;
  };

  return {
    setupFeatureFlags,
  };
};
