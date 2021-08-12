using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Provider
{
    public class PublishedProviderVersionViewModel
    {
        [JsonProperty("ukprn")]
        public string UKPRN { get; set; }
        public string Name { get; set; }
        public bool IsIndicative { get; set; }
    }
}
