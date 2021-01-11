using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.TemplateMetadata.Enums;

namespace CalculateFunding.Frontend.ViewModels.ProviderResults
{
    public class TemplateCalculationResult
    {
        public string CalculationId { get; set; }
        public string Name { get; set; }

        public uint TemplateCalculationId { get; set; }

        public PublishStatus Status { get; set; }

        public CalculationValueFormat ValueFormat { get; set; }

        public CalculationType TemplateCalculationType { get; set; }

        public object Value { get; set; }

        public string ExceptionMessage { get; set; }
    }
}
