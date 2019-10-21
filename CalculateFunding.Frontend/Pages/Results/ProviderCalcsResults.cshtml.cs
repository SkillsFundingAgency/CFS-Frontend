using System;
using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculationType = CalculateFunding.Common.ApiClient.Results.Models.CalculationType;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.ViewModels.Results;
using Serilog;
using System.Linq;

namespace CalculateFunding.Frontend.Pages.Results
{
    public class ProviderCalcsResultsPageModel : ProviderResultsBasePageModel
    {
        private readonly IFeatureToggle _featureToggle;

        public int CalculationErrorCount { get; set; }

        public ProviderCalcsResultsPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
            _featureToggle = featureToggle;
        }

        public override void PopulateResults(ApiResponse<ProviderResult> providerResponse)
        {
            this.CalculationErrorCount = providerResponse.Content.CalculationResults.Where(m => !string.IsNullOrWhiteSpace(m.ExceptionType) && _featureToggle.IsExceptionMessagesEnabled()).Count();
            ViewModel.CalculationItems = providerResponse.Content.CalculationResults.Select(m =>
                         new CalculationItemResult
                         {
                             Calculation = m.Calculation.Name,
                             SubTotal = m.Value,
                             CalculationExceptionType = _featureToggle.IsExceptionMessagesEnabled() ? m.ExceptionType : string.Empty,
                             CalculationExceptionMessage = _featureToggle.IsExceptionMessagesEnabled() ? m.ExceptionMessage : string.Empty,
                             CalculationType = AsCalculationSpecificationType(m.CalculationType)
                         }
                     );
        }
        
        //TODO; temp hack moving to nuget api client and need place holder enum maps 
        private static readonly IDictionary<CalculationType, CalculationSpecificationType> CalculationTypeMapping = new Dictionary<CalculationType, CalculationSpecificationType>
        {
	        {CalculationType.Additional, CalculationSpecificationType.Additional},
	        {CalculationType.Template, CalculationSpecificationType.Template},
        };

        private static CalculationSpecificationType AsCalculationSpecificationType(CalculationType calculationType)
        {
	        return CalculationTypeMapping.TryGetValue(calculationType, out CalculationSpecificationType calculationSpecificationType)
		        ? calculationSpecificationType
		        : throw new ArgumentOutOfRangeException();
        }

    }
}