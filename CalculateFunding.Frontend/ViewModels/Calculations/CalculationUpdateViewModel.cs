namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using System.ComponentModel.DataAnnotations;

    public class CalculationUpdateViewModel
    {
        [Required]
        public string SourceCode { get; set; }
    }
}
