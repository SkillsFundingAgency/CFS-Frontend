using System;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CalculationViewModel : ReferenceViewModel
    {
        public ReferenceViewModel AllocationLine { get; set; }

        public string Description { get; set; }
        
        public string DescriptionFirstLine => FirstLine.ParseFirstLine(Description);

        public CalculationTypeViewModel CalculationType { get; set; }

        public DateTime LastUpdated { get; set; }

        public string LastUpdatedDisplay => LastUpdated.ToString(FormatStrings.DateTimeFormatString);

        public string LastUpdatedDateFormatted => LastUpdated.ToString(FormatStrings.DateFormatString);

        public string LastUpdatedTimeFormatted => LastUpdated.ToString(FormatStrings.TimeFormatString);
    }
}
