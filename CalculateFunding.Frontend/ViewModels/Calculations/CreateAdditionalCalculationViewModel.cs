using System.ComponentModel.DataAnnotations;
using CalculateFunding.Common.ApiClient.Calcs.Models;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
	public class CreateAdditionalCalculationViewModel
	{
		[Required]
		public string SourceCode { get; set; }

		[Required(ErrorMessage = "Calculation name is required")]
		[MinLength(length:1, ErrorMessage = "Please provide a calculation name.")]
		public string CalculationName { get; set; }

		[Required(ErrorMessage = "Calculation type is required")]
		public CalculationValueType CalculationType { get; set; }
	}
}