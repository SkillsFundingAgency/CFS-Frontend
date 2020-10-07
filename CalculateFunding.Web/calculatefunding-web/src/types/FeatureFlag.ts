export enum FeatureFlagKey {
    TemplateBuilderVisible = "TemplateBuilderVisible",
    ReleaseTimetableVisible = "ReleaseTimetableVisible",
    EnableReactQueryDevTool = "EnableReactQueryDevTool",
    ProfilingPatternVisible = "ProfilingPatternVisible"
}

export interface FeatureFlag {
    name: string,
    isEnabled: boolean
}