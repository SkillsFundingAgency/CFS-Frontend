namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;

    public class CalculationViewModel : ReferenceViewModel
    {
        public string SpecificationId { get; set; }

        public string Description { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public string Status { get; set; }

        public DateTime LastModified { get; set; }

        public int Version { get; set; }

        public string LastModifiedByName { get; set; }

        public string SourceCode { get; set; }

        public CalculationSpecificationTypeViewModel CalculationType { get; set; }
    }
}
