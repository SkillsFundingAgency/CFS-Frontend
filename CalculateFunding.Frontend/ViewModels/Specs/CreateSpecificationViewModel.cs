using System.Collections.Generic;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using System.ComponentModel.DataAnnotations;
    using Properties;

    public class CreateSpecificationViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingStreamId { get; set; }

        public string ProviderVersionId { get; set; }

        public int? ProviderSnapshotId { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingPeriodRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingPeriodId { get; set; }

        public IDictionary<string, string> AssignedTemplateIds { get; set; }
    }
}
