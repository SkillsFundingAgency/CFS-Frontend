using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using System;

namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    public class TestScenarioViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public int Version { get; set; }

        public DateTimeOffset? CurrentVersionDate { get; set; }

        public ReferenceViewModel Author { get; set; }

        public string Commment { get; set; }

        public string PublishStatus { get; set; }

        public string Gherkin { get; set; }

        public string SpecificationId { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                if (!LastUpdatedDate.HasValue)
                {
                    return null;
                }

                return LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
