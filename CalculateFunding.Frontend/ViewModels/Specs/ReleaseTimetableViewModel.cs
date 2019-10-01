using System;
using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class ReleaseTimetableViewModel
    {
		[Required]
		[DataType(DataType.DateTime)]
        public DateTime FundingDate { get; set; }

		[Required]
        [DataType(DataType.DateTime)]
        public DateTime StatementDate { get; set; }

		[Required]
        public string SpecificationId { get; set; }
    }
}
