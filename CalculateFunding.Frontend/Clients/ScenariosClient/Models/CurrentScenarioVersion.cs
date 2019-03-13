
namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using System;
    using CalculateFunding.Common.Models;

    public class CurrentScenarioVersion
    {
        public string PublishStatus { get; set; }

        public int Version { get; set; }

        public DateTime Date { get; set; }

        public Reference Author { get; set; }
    }
}
