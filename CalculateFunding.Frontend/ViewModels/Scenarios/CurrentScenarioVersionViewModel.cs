using CalculateFunding.Frontend.ViewModels.Common;
using System;

namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    public class CurrentScenarioVersionViewModel
    {
        public string PublishStatus { get; set; }

        public int Version { get; set; }

        public DateTime Date { get; set; }

        public ReferenceViewModel Author { get; set; }
    }
}
