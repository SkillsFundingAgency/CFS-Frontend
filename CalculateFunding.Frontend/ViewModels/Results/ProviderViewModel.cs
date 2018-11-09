using CalculateFunding.Common.ApiClient.Models;
using Newtonsoft.Json;
using System;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class ProviderViewModel : Reference 
    {
        public string ProviderType { get; set; }

        public string ProviderSubtype { get; set; }

        public string LocalAuthority { get; set; }

        public int? Upin { get; set; }

        public int? Ukprn { get; set; }

        public int? Urn { get; set; }

        [JsonProperty("openDate")]
        public DateTime? DateOpened { get; set; }

        public string DateOpenedDisplay { get; set; } 
 
    }
}
