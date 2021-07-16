using CalculateFunding.Common.ApiClient.Calcs.Models;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationByIdViewModel : Calculation
    {
        public uint? TemplateCalculationId { get; set; }
        public CalculateFunding.Common.TemplateMetadata.Enums.CalculationType? TemplateCalculationType { get; set; }
    }
}
