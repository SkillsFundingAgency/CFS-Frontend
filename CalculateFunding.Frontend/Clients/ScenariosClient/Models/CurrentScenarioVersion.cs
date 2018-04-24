
namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System;

    public class CurrentScenarioVersion
    {
        public string PublishStatus { get; set; }

        public int Version { get; set; }

        public DateTime Date { get; set; }

        public Reference Author { get; set; }
    }
}
