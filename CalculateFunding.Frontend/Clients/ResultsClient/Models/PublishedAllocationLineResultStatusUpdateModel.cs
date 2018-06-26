using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class PublishedAllocationLineResultStatusUpdateModel
    {
        private List<PublishedAllocationLineResultStatusUpdateProviderModel> _providers;

        public PublishedAllocationLineResultStatusUpdateModel() {
            _providers = new List<PublishedAllocationLineResultStatusUpdateProviderModel>();
        }


        public AllocationLineStatus Status { get; set; }

        public IEnumerable<PublishedAllocationLineResultStatusUpdateProviderModel> Providers
        {
            get { return _providers; }
        }

        public void AddProvider(PublishedAllocationLineResultStatusUpdateProviderModel provider)
        {
            _providers.Add(provider);
        }
    }
}
