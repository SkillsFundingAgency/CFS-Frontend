using AutoMapper;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ChoosePageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly ICalculationsApiClient _calcsClient;
        private readonly IResultsApiClient _resultsClient;
        private readonly ITestEngineApiClient _testEngineClient;
        private readonly IMapper _mapper;

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<ChooseApprovalSpecificationViewModel> Specifications { get; set; }

        public PageBannerOperation PageBannerOperation { get; set; }

        public ChoosePageModel(ISpecsApiClient specsApiClient,
            ICalculationsApiClient calcsClient,
            IResultsApiClient resultsClient,
            ITestEngineApiClient testEngineClient,
            IMapper mapper)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(calcsClient, nameof(calcsClient));
            Guard.ArgumentNotNull(resultsClient, nameof(resultsClient));
            Guard.ArgumentNotNull(testEngineClient, nameof(testEngineClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsApiClient;
            _calcsClient = calcsClient;
            _resultsClient = resultsClient;
            _testEngineClient = testEngineClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string fundingPeriod, string fundingStream, ChoosePageBannerOperationType? operationType = null, string operationId = null)
        {
            List<Task> tasks = new List<Task>();
            Task<ApiResponse<IEnumerable<SpecificationSummary>>> specificationsLookupTask = null;

            if (!string.IsNullOrWhiteSpace(fundingPeriod) && !string.IsNullOrWhiteSpace(fundingStream))
            {
                specificationsLookupTask = _specsClient.GetApprovedSpecifications(fundingPeriod, fundingStream);
                tasks.Add(specificationsLookupTask);
            }

            Task<ApiResponse<IEnumerable<Reference>>> fundingPeriodsLookupTask = _specsClient.GetFundingPeriods();

            Task<ApiResponse<IEnumerable<FundingStream>>> fundingStreamsLookupTask = _specsClient.GetFundingStreams();

            tasks.Add(fundingPeriodsLookupTask);
            tasks.Add(fundingStreamsLookupTask);

            await TaskHelper.WhenAllAndThrow(tasks.ToArray());

            IActionResult errorResult = fundingPeriodsLookupTask.Result.IsSuccessOrReturnFailureResult("Funding Period");
            if (errorResult != null)
            {
                return errorResult;
            }

            errorResult = fundingStreamsLookupTask.Result.IsSuccessOrReturnFailureResult("Funding Stream");
            if (errorResult != null)
            {
                return errorResult;
            }

            FundingStreams = fundingStreamsLookupTask.Result.Content.Select(s => new SelectListItem()
            {
                Text = s.Name,
                Value = s.Id,
                Selected = fundingStream == s.Id,
            });

            FundingPeriods = fundingPeriodsLookupTask.Result.Content.Select(s => new SelectListItem()
            {
                Text = s.Name,
                Value = s.Id,
                Selected = fundingPeriod == s.Id,
            });


            Dictionary<string, ChooseApprovalSpecificationViewModel> specifications = new Dictionary<string, ChooseApprovalSpecificationViewModel>();

            string chosenSpecificationId = null;

            if (!string.IsNullOrWhiteSpace(fundingPeriod) && !string.IsNullOrWhiteSpace(fundingStream))
            {
                errorResult = specificationsLookupTask.Result.IsSuccessOrReturnFailureResult("Specification");
                if(errorResult != null)
                {
                    return errorResult;
                }

                foreach (SpecificationSummary specification in specificationsLookupTask.Result.Content)
                {
                    ChooseApprovalSpecificationViewModel chooseSpecification = new ChooseApprovalSpecificationViewModel()
                    {
                        Id = specification.Id,
                        Name = specification.Name,
                        ApprovalStatus = _mapper.Map<PublishStatusViewModel>(specification.ApprovalStatus),
                        IsSelectedForFunding = specification.IsSelectedForFunding,
                        CanBeChosen = true,
                        FundingStreams = _mapper.Map<List<ReferenceViewModel>>(specification.FundingStreams),
                    };

                    if (specification.IsSelectedForFunding)
                    {
                        chosenSpecificationId = specification.Id;
                    }

                    specifications.Add(specification.Id, chooseSpecification);

                }
            }

            if (specifications.Count > 0)
            {
                SpecificationIdsRequestModel specificationIdsRequest = new SpecificationIdsRequestModel()
                {
                    SpecificationIds = specifications.Keys,
                };

                Task<ApiResponse<IEnumerable<CalculationStatusCounts>>> calculationStatusCountsLookupTask = _calcsClient.GetCalculationStatusCounts(specificationIdsRequest);
                Task<ApiResponse<IEnumerable<FundingCalculationResultsTotals>>> resultTotalsCountsLookupTask = _resultsClient.GetFundingCalculationResultsTotals(specificationIdsRequest);
                Task<ApiResponse<IEnumerable<SpecificationTestScenarioResultCounts>>> testScenarioResultCountsLookupTask = _testEngineClient.GetTestScenarioCountsForSpecifications(specificationIdsRequest);

                await TaskHelper.WhenAllAndThrow(calculationStatusCountsLookupTask, resultTotalsCountsLookupTask, testScenarioResultCountsLookupTask);

                errorResult = calculationStatusCountsLookupTask.Result.IsSuccessOrReturnFailureResult("Calculation Status Counts");
                if (errorResult != null)
                {
                    return errorResult;
                }

                errorResult = resultTotalsCountsLookupTask.Result.IsSuccessOrReturnFailureResult("Calculation Result");
                if (errorResult != null)
                {
                    return errorResult;
                }

                errorResult = testScenarioResultCountsLookupTask.Result.IsSuccessOrReturnFailureResult("Test Scenario Counts");
                if (errorResult != null)
                {
                    return errorResult;
                }

                if (calculationStatusCountsLookupTask.Result.Content.Count() != specificationIdsRequest.SpecificationIds.Count())
                {
                    return new InternalServerErrorResult($"Number of calculation approvals counts ({calculationStatusCountsLookupTask.Result.Content.Count()} does not match number of specifications requested ({specificationIdsRequest.SpecificationIds.Count()}");
                }

                foreach (CalculationStatusCounts counts in calculationStatusCountsLookupTask.Result.Content)
                {
                    ChooseApprovalSpecificationViewModel chooseVm = specifications[counts.SpecificationId];

                    chooseVm.CalculationsApproved = counts.Approved;
                    chooseVm.CalculationsTotal = counts.Total;
                }

                if (resultTotalsCountsLookupTask.Result.Content.Count() != specificationIdsRequest.SpecificationIds.Count())
                {
                    return new InternalServerErrorResult($"Number of calculation result counts ({resultTotalsCountsLookupTask.Result.Content.Count()} does not match number of specifications requested ({specificationIdsRequest.SpecificationIds.Count()}");
                }

                foreach (FundingCalculationResultsTotals counts in resultTotalsCountsLookupTask.Result.Content)
                {
                    ChooseApprovalSpecificationViewModel chooseVm = specifications[counts.SpecificationId];

                    chooseVm.FundingAmount = counts.TotalResult;
                }

                if (testScenarioResultCountsLookupTask.Result.Content.Count() != specificationIdsRequest.SpecificationIds.Count())
                {
                    return new InternalServerErrorResult($"Number of test scenario result counts ({testScenarioResultCountsLookupTask.Result.Content.Count()} does not match number of specifications requested ({specificationIdsRequest.SpecificationIds.Count()}");
                }

                foreach (SpecificationTestScenarioResultCounts counts in testScenarioResultCountsLookupTask.Result.Content)
                {
                    ChooseApprovalSpecificationViewModel chooseVm = specifications[counts.SpecificationId];

                    chooseVm.QaTestsPassed = counts.Passed;
                    chooseVm.QaTestsTotal = counts.Passed + counts.Ignored + counts.Failed;
                    chooseVm.ProviderQaCoverage = counts.TestCoverage;
                }

                // Make sure all specifications can't be chosen if one already has for this funding stream/period
                if (!string.IsNullOrWhiteSpace(chosenSpecificationId))
                {
                    foreach (ChooseApprovalSpecificationViewModel specification in specifications.Values)
                    {
                        specification.CanBeChosen = false;
                    }
                }
            }

            Specifications = specifications.Values.AsEnumerable();

            if (operationType.HasValue && specifications.ContainsKey(operationId))
            {
                ChooseApprovalSpecificationViewModel specification = specifications[operationId];

                PageBannerOperation = new PageBannerOperation()
                {
                    EntityName = specification.Name,
                    EntityType = "Specification",
                    OperationAction = "chosen for funding",
                    OperationId = operationId,
                    ActionText = "View funding",
                    ActionUrl = "/approvals/viewfunding/" + specification.Id
                };
            }

            return Page();
        }
    }
}