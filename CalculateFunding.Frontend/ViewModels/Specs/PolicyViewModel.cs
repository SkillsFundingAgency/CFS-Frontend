using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class PolicyViewModel : ReferenceViewModel
    {
        private string _description;
        private string _descriptionFirstLine;

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

        public List<CalculationViewModel> Calculations { get; set; }

        public List<PolicyViewModel> SubPolicies { get; set; }

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