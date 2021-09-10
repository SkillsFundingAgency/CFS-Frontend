export interface PublishedProviderIdsSearchRequest {
  searchTerm: string;
  hasErrors: boolean | undefined;
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  localAuthority: string[];
  status: string[];
  providerType: string[];
  providerSubType: string[];
  searchFields: string[];
}
