using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class PreviewCompileRequestViewModel
    {
        [Required]
        public string CalculationId { get; set; }

        [Required]
        public string SourceCode { get; set; }
    }
}
