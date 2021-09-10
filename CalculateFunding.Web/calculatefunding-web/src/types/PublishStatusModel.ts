export interface PublishStatusModel {
  publishStatus: PublishStatus;
}

export enum PublishStatus {
  Draft = "Draft",
  Approved = "Approved",
  Updated = "Updated",
  Archived = "Archived",
}
