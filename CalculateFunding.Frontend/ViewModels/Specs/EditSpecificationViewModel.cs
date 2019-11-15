﻿namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Frontend.Properties;

    public class EditSpecificationViewModel : ISpecificationAuthorizationEntity
    {
        public string Id { get; set; }

        public string OriginalSpecificationName { get; set; }

        public string OriginalFundingStreamId { get; set; }

        public string OriginalFundingPeriodId { get; set; }

        public bool IsSelectedForFunding { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingStreamId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationProviderVersionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string ProviderVersionId { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingPeriodRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingPeriodId { get; set; }

        public string GetSpecificationId()
        {
            return Id;
        }
    }
}
