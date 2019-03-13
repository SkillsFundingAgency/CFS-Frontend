using System;
using CalculateFunding.Common.Models;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models.Results
{
    public class ScenarioResultItem
    {
        public Reference Scenario { get; set; }

        public string Result { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
