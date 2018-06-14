using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class PublishedAllocationLineResultStatusUpdateProviderModel
    {
        private List<string> _allocationLineIds = new List<string>();

        public string ProviderId { get; set; }

        public IEnumerable<string> AllocationLineIds
        {
            get { return _allocationLineIds; }
        }

        public void AddAllocationLine(string allocationLineId)
        {
            _allocationLineIds.Add(allocationLineId);
        }
    }
}
