namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using CalculateFunding.Common.ApiClient.Calcs.Models;
    using System.ComponentModel.DataAnnotations;

    public class PreviewCompileRequestViewModel
    {
        [Required]
        public string SourceCode { get; set; }

        public string ProviderId { get; set; }

        public CalculationDataType DataType { get; set; }
    }
}
