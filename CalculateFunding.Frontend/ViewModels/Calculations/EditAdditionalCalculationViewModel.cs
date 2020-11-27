using System.ComponentModel.DataAnnotations;
using CalculateFunding.Common.ApiClient.Calcs.Models;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
	public class EditAdditionalCalculationViewModel
	{
		[Required]
		public string SourceCode { get; set; }

		[Required(ErrorMessage = "Calculation name is required")]
		public string CalculationName { get; set; }

		[Required]
		public CalculationValueType ValueType { get; set; }

        [Required]
        public CalculationDataType DataType { get; set; }
    }
}