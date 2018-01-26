using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationUpdateViewModel
    {
        [Required]
        public string SourceCode { get; set; }
    }
}
