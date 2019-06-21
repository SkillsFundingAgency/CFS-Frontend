using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Properties;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class EditSpecificationViewModel : ISpecificationAuthorizationEntity
    {
        public string Id { get; set; }

        public string OriginalSpecificationName { get; set; }

        public string OriginalFundingStreams { get; set; }

        public string OriginalFundingPeriodId { get; set; }

        public bool IsSelectedForFunding { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public IEnumerable<string> FundingStreamIds { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingPeriodRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingPeriodId { get; set; }

        public string GetSpecificationId()
        {
            return Id;
        }
    }
}
