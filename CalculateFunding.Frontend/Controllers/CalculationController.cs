using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Calcs.Models.Code;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using CalculationType = CalculateFunding.Common.ApiClient.Calcs.Models.CalculationType;
using CalcsJob = CalculateFunding.Common.ApiClient.Calcs.Models.Job;
using ResultsJob = CalculateFunding.Common.ApiClient.Results.Models.Job;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Frontend.ViewModels.Jobs;

namespace CalculateFunding.Frontend.Controllers
{
    public class CalculationController : Controller
    {
        private ICalculationsApiClient _calcClient;
        private ISpecificationsApiClient _specificationsApiClient;
        private IPoliciesApiClient _policiesApiClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IResultsApiClient _resultsApiClient;

        public CalculationController(
            ICalculationsApiClient calcClient,
            IMapper mapper,
            IAuthorizationHelper authorizationHelper,
            IResultsApiClient resultsApiClient,
            ISpecificationsApiClient specificationsApiClient,
            IPoliciesApiClient policiesApiClient)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _resultsApiClient = resultsApiClient;
            _specificationsApiClient = specificationsApiClient;
            _policiesApiClient = policiesApiClient;
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/calculations/{calculationId}")]
        public async Task<IActionResult> SaveCalculation(
            string specificationId,
            string calculationId,
            [FromBody] CalculationUpdateViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanEditCalculations))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApiResponse<Calculation> existingCalculationResponse = await _calcClient.GetCalculationById(calculationId);
            IActionResult errorResult = existingCalculationResponse.IsSuccessOrReturnFailureResult("Calculation");

            if (errorResult != null)
            {
                return errorResult;
            }

            Calculation existingCalculation = existingCalculationResponse.Content;

            CalculationEditModel update = new CalculationEditModel()
            {
                CalculationId = calculationId,
                Description = existingCalculation.Description,
                Name = existingCalculation.Name,
                SpecificationId = specificationId,
                ValueType = existingCalculation.ValueType,
                SourceCode = vm.SourceCode,
            };

            ValidatedApiResponse<Calculation> response = await _calcClient.EditCalculation(specificationId, calculationId, update);

            if (response.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while saving calculation. Status code={response.StatusCode}");
            }
        }

        [Route("api/specs/{specificationId}/calculations/{calculationId}/compilePreview")]
        [HttpPost]
        public async Task<IActionResult> CompilePreview(
            [FromRoute] string specificationId,
            [FromRoute] string calculationId,
            [FromBody] PreviewCompileRequestViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                PreviewResponse errorResponse = new PreviewResponse();

                foreach (var modelStateValue in ModelState.Values)
                {
                    errorResponse.CompilerOutput = new Build
                    {
                        CompilerMessages = new List<CompilerMessage>
                        {
                            new CompilerMessage
                            {
                                Message = modelStateValue.Errors[0]
                                    .ErrorMessage
                            }
                        }
                    };
                }

                return BadRequest(errorResponse);
            }

            PreviewRequest request = _mapper.Map<PreviewRequest>(vm);
            request.CalculationId = calculationId;
            request.SpecificationId = specificationId;
            request.ProviderId = vm.ProviderId;

            ApiResponse<PreviewResponse> response = await _calcClient.PreviewCompile(request);

            if (response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while compiling calculation. Status code={response.StatusCode}");
        }

        [Route("api/specs/{specificationId}/codeContext")]
        [HttpGet]
        public async Task<IActionResult> GetCodeContext(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<TypeInformation>> response = await _calcClient.GetCodeContextForSpecification(specificationId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        /// <summary>
        /// Approve calculation
        /// </summary>
        /// <param name="specificationId">Specification ID</param>
        /// <param name="calculationId">CalculationId</param>
        /// <param name="publishStatusEditModel">Calculation status</param>
        /// <returns></returns>
        [Route("api/specs/{specificationId}/calculations/{calculationId}/status")]
        [HttpPut]
        public async Task<IActionResult> ApproveCalculation(
            [FromRoute] string specificationId,
            [FromRoute] string calculationId,
            [FromBody] PublishStatusEditModel publishStatusEditModel)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(publishStatusEditModel, nameof(publishStatusEditModel));

            ApiResponse<Calculation> calculationResult = await _calcClient.GetCalculationById(calculationId);

            IActionResult errorResult = calculationResult.IsSuccessOrReturnFailureResult("GetCalculationById");

            if (errorResult != null)
            {
                return errorResult;
            }

            if (calculationResult.Content.SpecificationId != specificationId)
            {
                return new PreconditionFailedResult("The calculation requested is not contained within the specification requested");
            }

            bool canApprove = await CanUserApproveCalculation(calculationResult.Content);

            if (!canApprove)
            {
                return new ForbidResult();
            }

            if (calculationResult.Content.PublishStatus == PublishStatus.Approved)
            {
                return Ok(new PublishStatusResult()
                {
                    PublishStatus = PublishStatus.Approved
                });
            }

            ValidatedApiResponse<PublishStatusResult> response = await _calcClient.UpdatePublishStatus(calculationId, publishStatusEditModel);

            if (response.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        /// <summary>
        /// Approve all calculations
        /// </summary>
        /// <param name="specificationId">Specification ID</param>
        /// <returns></returns>
        [Route("api/specs/{specificationId}/calculations/approveAll")]
        [HttpPut]
        public async Task<IActionResult> ApproveAllCalculations([FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanApproveAllCalculations))
            {
                return new ForbidResult();
            }

            ApiResponse<CalcsJob> response = await _calcClient.QueueApproveAllSpecificationCalculations(specificationId);

            return response.Handle("Approve all calculations",
                onSuccess: x => x.Content.Id != null ? Ok(new JobCreatedResponse { JobId = x.Content.Id }) : BadRequest());
        }

        [Route("api/calcs/{calculationId}/approvePermission")]
        [HttpGet]
        public async Task<IActionResult> GetIsUserAllowedToApproveCalculation([FromRoute] string calculationId)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            ApiResponse<Calculation> calculationResult = await _calcClient.GetCalculationById(calculationId);

            IActionResult errorResult = calculationResult.IsSuccessOrReturnFailureResult("GetCalculationById");

            if (errorResult != null)
            {
                return errorResult;
            }

            bool canApprove = await CanUserApproveCalculation(calculationResult.Content);

            if (!canApprove)
            {
                return new ForbidResult();
            }

            return Ok(true);
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/calculations/createadditionalcalculation")]
        public async Task<IActionResult> CreateCalculation(string specificationId, [FromBody] CreateAdditionalCalculationViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanEditCalculations))
            {
                return new ForbidResult();
            }

            CalculationCreateModel createCalculation = _mapper.Map<CalculationCreateModel>(vm);

            createCalculation.SpecificationId = specificationId;
            createCalculation.Name = vm.CalculationName;
            createCalculation.ValueType = vm.CalculationType;

            ValidatedApiResponse<Calculation> response = await _calcClient.CreateCalculation(specificationId, createCalculation);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("CreateCalculation");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/calcs/status-counts")]
        public async Task<IActionResult> GetCalculationStatusCounts([FromBody] SpecificationIdsRequestModel specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            ApiResponse<IEnumerable<CalculationStatusCounts>> response = await _calcClient.GetCalculationStatusCounts(specificationIds);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("GetCalculationStatusCounts");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/calculations/{calculationId}/editadditionalcalculation")]
        public async Task<IActionResult> EditAdditionalCalculation(
            string specificationId,
            string calculationId,
            [FromBody] EditAdditionalCalculationViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanEditCalculations))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CalculationEditModel editCalculation = _mapper.Map<CalculationEditModel>(vm);

            editCalculation.SpecificationId = specificationId;
            editCalculation.CalculationId = calculationId;
            editCalculation.Name = vm.CalculationName;
            editCalculation.ValueType = vm.ValueType;
            editCalculation.DataType = vm.DataType;

            ValidatedApiResponse<Calculation> response = await _calcClient.EditCalculation(specificationId, calculationId, editCalculation);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("EditCalculation");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpGet]
        [Route("api/calcs/getcalculationbyid/{calculationId}")]
        public async Task<IActionResult> GetCalculationById(string calculationId)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            ApiResponse<Calculation> calcResponse = await _calcClient.GetCalculationById(calculationId);

            IActionResult calcResponseError =
                calcResponse.IsSuccessOrReturnFailureResult("GetCalculationById");

            if (calcResponseError != null)
            {
                return calcResponseError;
            }

            CalculationByIdViewModel calculationByIdViewModel = _mapper.Map<CalculationByIdViewModel>(calcResponse.Content);

            if (calcResponse.Content.CalculationType != CalculationType.Template)
            {
                return Ok(calculationByIdViewModel);
            }

            Guard.IsNullOrWhiteSpace(calculationByIdViewModel.SpecificationId, nameof(calculationByIdViewModel.SpecificationId));
            Guard.IsNullOrWhiteSpace(calculationByIdViewModel.FundingStreamId, nameof(calculationByIdViewModel.FundingStreamId));

            string fundingStreamId = calculationByIdViewModel.FundingStreamId;

            ApiResponse<TemplateMapping> templateMappingResponse =
                await _calcClient.GetTemplateMapping(calculationByIdViewModel.SpecificationId, fundingStreamId);

            IActionResult templateMappingResponseError =
                templateMappingResponse.IsSuccessOrReturnFailureResult("GetTemplateMapping");

            if (templateMappingResponseError != null)
            {
                return templateMappingResponseError;
            }

            ApiResponse<SpecificationSummary> specificationResponse =
                await _specificationsApiClient.GetSpecificationSummaryById(calculationByIdViewModel.SpecificationId);

            IActionResult specificationResponseError =
                specificationResponse.IsSuccessOrReturnFailureResult("GetSpecificationSummaryById");

            if (specificationResponseError != null)
            {
                return specificationResponseError;
            }

            TemplateMapping templateMapping = templateMappingResponse.Content;
            SpecificationSummary specificationSummary = specificationResponse.Content;
            string templateVersion = specificationSummary.TemplateIds[fundingStreamId];

            ApiResponse<TemplateMetadataDistinctCalculationsContents> policiesResponse =
                await _policiesApiClient.GetDistinctTemplateMetadataCalculationsContents(
                    fundingStreamId, specificationSummary.FundingPeriod.Id, templateVersion);

            IActionResult policiesResponseError =
                policiesResponse.IsSuccessOrReturnFailureResult("GetDistinctTemplateMetadataCalculationsContents");

            if (policiesResponseError != null)
            {
                return policiesResponseError;
            }

            TemplateMetadataDistinctCalculationsContents templateContents = policiesResponse.Content;

            uint templateCalculationId = templateMapping.TemplateMappingItems.First(t => t.CalculationId == calculationId)
                .TemplateId;

            calculationByIdViewModel.TemplateCalculationId = templateCalculationId;

            calculationByIdViewModel.TemplateCalculationType = templateContents.Calculations.First(c => c.TemplateCalculationId == templateCalculationId)
                .Type;

            return Ok(calculationByIdViewModel);
        }

        [HttpGet]
        [Route("api/calcs/getcalculations/{specificationId}/{calculationType}/{pageNumber}")]
        public async Task<IActionResult> GetCalculationsForSpecification(
            string specificationId,
            CalculationType calculationType,
            int pageNumber,
            [FromQuery] string searchTerm,
            [FromQuery] string status)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            PublishStatus? publishStatus = null;

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                publishStatus = (PublishStatus)Enum.Parse(typeof(PublishStatus), status);
            }

            ApiResponse<SearchResults<CalculationSearchResult>> response =
                await _calcClient.SearchCalculationsForSpecification(specificationId,
                    calculationType, publishStatus, searchTerm, pageNumber);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("SearchCalculationsForSpecification");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/calcs/specifications/{specificationId}/generate-calculation-csv-results")]
        public async Task<IActionResult> RunGenerateCalculationCsvResultsJob(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<ResultsJob> result =
                await _resultsApiClient.RunGenerateCalculationCsvResultsJob(specificationId);

            return result.IsSuccessOrReturnFailureResult(nameof(specificationId)) ?? Ok(new
            {
                jobId = result.Content?.Id
            });
        }

        [HttpGet]
        [Route("api/calcs/getcalculations/{specificationId}/{calculationType}/{pageNumber}/provider/{providerId}")]
        public async Task<IActionResult> GetAdditionalCalculationsByProviderId(
            string specificationId,
            CalculationType calculationType,
            int pageNumber,
            [FromQuery] string searchTerm,
            [FromQuery] string status,
            [FromRoute] string providerId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(calculationType, nameof(calculationType));

            PublishStatus? publishStatus = !string.IsNullOrEmpty(status) && status != "All"
                ? publishStatus = (PublishStatus)Enum.Parse(typeof(PublishStatus), status)
                : null;

            ApiResponse<SearchResults<CalculationSearchResult>> calculationSearchResultResponse =
                await _calcClient.SearchCalculationsForSpecification(specificationId,
                    calculationType, publishStatus, searchTerm, pageNumber);

            IActionResult calculationSearchResultErrorResult =
                calculationSearchResultResponse.IsSuccessOrReturnFailureResult("SearchCalculationsForSpecification");

            if (calculationSearchResultErrorResult != null)
            {
                return calculationSearchResultErrorResult;
            }

            SearchResults<CalculationSearchResult> calcSearchResults = calculationSearchResultResponse.Content;

            ApiResponse<ProviderResultResponse> providerResultResponse =
                await _resultsApiClient.GetProviderResults(providerId, specificationId);

            IActionResult providerResultResponseErrorResult =
                providerResultResponse.IsSuccessOrReturnFailureResult("GetProviderResults");

            if (providerResultResponseErrorResult != null)
            {
                return providerResultResponseErrorResult;
            }

            IEnumerable<AdditionalCalculationSearchResultViewModel> additionalCalcs =
                calcSearchResults.Results.Select(c =>
                    new AdditionalCalculationSearchResultViewModel
                    {
                        Id = c.Id,
                        Name = c.Name,
                        ValueType = c.ValueType,
                        Value = providerResultResponse.Content.CalculationResults
                            .FirstOrDefault(calcResult =>
                                calcResult.Calculation != null && calcResult.Calculation.Id == c.Id)
                            ?.Value,
                        LastUpdatedDate = c.LastUpdatedDate,
                        ExceptionMessage = providerResultResponse.Content.CalculationResults
                            .FirstOrDefault(calcResult =>
                                calcResult.Calculation != null && calcResult.Calculation.Id == c.Id)
                            ?.ExceptionMessage,
                    });

            AdditionalCalculationViewModel additionalCalculationViewModel =
                new AdditionalCalculationViewModel(additionalCalcs, calcSearchResults.TotalCount,
                    pageNumber, (int)Math.Ceiling(calcSearchResults.TotalCount / (double)50),
                    50, calcSearchResults.TotalErrorCount, calcSearchResults.Facets);


            return Ok(additionalCalculationViewModel);
        }

        [HttpGet]
        [Route("api/calcs/getcalculationversionhistory/{calculationId}")]
        public async Task<IActionResult> GetCalculationVersionHistory(string calculationId)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            var response = await _calcClient.GetAllVersionsByCalculationId(calculationId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(response.Content
                    .OrderByDescending(v => v.Version)
                    .ThenByDescending(v => v.LastUpdated));
            }

            return new BadRequestObjectResult(response.Content);
        }

        [HttpGet]
        [Route("api/calcs/getmultipleversions")]
        public async Task<IActionResult> GetMulitpleCalculationVersions(
            [FromQuery] string calculationId,
            [FromQuery(Name = "versions[]")] int[] versions)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(versions, nameof(versions));

            ApiResponse<IEnumerable<CalculationVersion>> response = await _calcClient.GetMultipleVersionsByCalculationId(versions, calculationId);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("GetMultipleVersionsByCalculationId");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [Route("api/calcs/calculation-summaries-for-specification")]
        [HttpGet]
        public async Task<IActionResult> GetCalculationSummaryForSpecification([FromQuery] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<CalculationSummary>> response = await _calcClient.GetCalculationSummariesForSpecification(specificationId);

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("GetCalculationSummariesForSpecification");

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [Route("api/calcs/generate-identifier")]
        [HttpGet]
        public async Task<IActionResult> GenerateCalculationIdentifier([FromQuery] string calculationName)
        {
            Guard.IsNullOrWhiteSpace(calculationName, nameof(calculationName));

            ApiResponse<CalculationIdentifier> response =
                await _calcClient.GenerateCalculationIdentifier(new GenerateIdentifierModel { CalculationName = calculationName });

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult(nameof(GenerateCalculationIdentifier));

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        private async Task<bool> CanUserApproveCalculation(Calculation calculation)
        {
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            if (await _authorizationHelper.DoesUserHavePermission(User, calculation.SpecificationId, SpecificationActionTypes.CanApproveAnyCalculations))
            {
                return true;
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, calculation.SpecificationId, SpecificationActionTypes.CanApproveCalculations))
            {
                return false;
            }

            return User.GetUserProfile()
                ?.Id != calculation.Author.Id;
        }
    }
}