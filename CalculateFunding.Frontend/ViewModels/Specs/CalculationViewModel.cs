using System;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CalculationViewModel : ReferenceViewModel
    {
        private string _description;
        private string _descriptionFirstLine;

        public ReferenceViewModel AllocationLine { get; set; }

        public string Description
        {
            get
            {
                return _description;
            }
            set
            {
                _description = value;
                _descriptionFirstLine = FirstLine.ParseFirstLine(value);
            }
        }

        public string DescriptionFirstLine
        {
            get
            {
                return _descriptionFirstLine;
            }
        }

        public CalculationSpecificationTypeViewModel CalculationType { get; set; }

        public DateTime LastUpdated { get; set; }

        public string LastUpdatedDisplay
        {
            get
            {
                return LastUpdated.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
