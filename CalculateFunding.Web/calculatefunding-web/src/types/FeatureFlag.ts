export enum FeatureFlagKey {
    TemplateBuilderVisible = "TemplateBuilderVisible",
    ReleaseTimetableVisible = "ReleaseTimetableVisible",
    ProfilingPatternVisible = "ProfilingPatternVisible"
}

export interface FeatureFlag {
    name: string,
    isEnabled: boolean
}