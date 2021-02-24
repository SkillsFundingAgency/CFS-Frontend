using System;

namespace CalculateFunding.Frontend.ViewModels.Provider
{
    public class CurrentProviderVersionForFundingStream
    {
        public int? ProviderSnapshotId { get; set; }
        public string Name { get; set; }
        public string ProviderVersionId { get; set; }
        public string Description { get; set; }
        public DateTimeOffset TargetDate { get; set; }
        public int Version { get; set; }
    }
}
