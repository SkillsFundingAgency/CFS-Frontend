

using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;

namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Serilog;
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Calculations;


    public class ProviderTemplateCalculationsPageModel : ProviderResultsBasePageModel
    {
        private ILogger _logger;
        private ProviderResultsBasePageModel _providerResultsBasePageModelImplementation;
        private ICalculationsApiClient _calculationsApiClient;
        public List<ProviderCalculationItemViewModel> TemplateCalculationList;

        public ProviderTemplateCalculationsPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger, ICalculationsApiClient calculationsApiClient)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
	        _logger = logger;
	        _calculationsApiClient = calculationsApiClient;
        }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
	        TemplateCalculationList = new List<ProviderCalculationItemViewModel>();

	        foreach (var calculationResultItem in providerResponse.Content.CalculationResults)
	        {
		        if (calculationResultItem.CalculationType == CalculationSpecificationType.Template)
		        {
			        var calculation = _calculationsApiClient.GetCalculationById(calculationResultItem.Calculation.Id).Result;

			        TemplateCalculationList.Add(new ProviderCalculationItemViewModel
			        {
				        Name = calculationResultItem.Calculation.Name,
				        ValueType = calculation.Content.Current.ValueType.ToString(),
				        Value = calculationResultItem.Value
			        });
		        }
	        }
        }
    }
}