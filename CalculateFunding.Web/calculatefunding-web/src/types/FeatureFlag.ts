export enum FeatureFlagKey {
  TemplateBuilderVisible = "TemplateBuilderVisible",
  ReleaseTimetableVisible = "ReleaseTimetableVisible",
  EnableReactQueryDevTool = "EnableReactQueryDevTool",
  ProfilingPatternVisible = "ProfilingPatternVisible",
  SpecToSpec = "SpecToSpec",
}

export interface FeatureFlag {
  name: string;
  isEnabled: boolean;
}
