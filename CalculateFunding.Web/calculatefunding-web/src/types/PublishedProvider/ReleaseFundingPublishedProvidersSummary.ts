export interface ReleaseFundingPublishedProvidersSummary {
  totalProviders: number;
  totalIndicativeProviders: number;
  totalFunding?: number;
  channelFundings: ChannelFunding[];
}
export interface ChannelFunding {
  channelCode: string;
  channelName: string;
  totalFunding?: number;
  totalProviders: number;
}
