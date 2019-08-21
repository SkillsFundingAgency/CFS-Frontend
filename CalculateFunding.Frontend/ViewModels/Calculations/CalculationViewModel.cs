using System;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationViewModel : ReferenceViewModel
    {
        public string SpecificationId { get; set; }

        public string Description { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public DateTime LastModified { get; set; }

        public int Version { get; set; }

        public string LastModifiedByName { get; set; }

        public string SourceCode { get; set; }

        public CalculationTypeViewModel CalculationType { get; set; }

        public PublishStatusViewModel PublishStatus { get; set; }
    }
}
