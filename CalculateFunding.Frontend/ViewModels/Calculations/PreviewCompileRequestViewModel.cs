namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using System.ComponentModel.DataAnnotations;

    public class PreviewCompileRequestViewModel
    {
        [Required]
        public string SourceCode { get; set; }
    }
}
