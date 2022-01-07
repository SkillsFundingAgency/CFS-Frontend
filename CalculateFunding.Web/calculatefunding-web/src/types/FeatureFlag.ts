export enum FeatureFlagKey {
  TemplateBuilderVisible = "TemplateBuilderVisible",
  ReleaseTimetableVisible = "ReleaseTimetableVisible",
  EnableReactQueryDevTool = "EnableReactQueryDevTool",
  ProfilingPatternVisible = "ProfilingPatternVisible",
  SpecToSpec = "SpecToSpec",
  EnableNewFundingManagement = "EnableNewFundingManagement",
}

export interface FeatureFlag {
  name: string;
  isEnabled: boolean;
}
