export enum FeatureFlagKey {
    TemplateBuilderVisible = "TemplateBuilderVisible"
}

export interface FeatureFlag {
    name: string,
    isEnabled: boolean
}