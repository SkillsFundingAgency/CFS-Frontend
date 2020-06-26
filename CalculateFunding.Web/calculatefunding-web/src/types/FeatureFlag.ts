export enum FeatureFlagKey {
    TemplateBuilderVisible = "TemplateBuilderVisible",
    ReleaseTimetableVisible = "ReleaseTimetableVisible"
}

export interface FeatureFlag {
    name: string,
    isEnabled: boolean
}