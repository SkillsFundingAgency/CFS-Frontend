﻿

using System.Linq;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculationType = CalculateFunding.Common.ApiClient.Results.Models.CalculationType;

namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.ApiClient.Providers;

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

        public override void PopulateResults(ApiResponse<ProviderResult> providerResponse)
        {
	        TemplateCalculationList = new List<ProviderCalculationItemViewModel>();

	        foreach (CalculationResult calculationResultItem in providerResponse.Content.CalculationResults.Where(_ => _.CalculationType == CalculationType.Template))
	        {
		        ApiResponse<Calculation> calculation = _calculationsApiClient.GetCalculationById(calculationResultItem.Calculation.Id).Result;

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