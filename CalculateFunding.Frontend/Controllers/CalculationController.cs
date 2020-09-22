using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
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

namespace CalculateFunding.Frontend.Controllers
{
    public class CalculationController : Controller
    {
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IResultsApiClient _resultsApiClient;

        public CalculationController(
            ICalculationsApiClient calcClient,
            IMapper mapper,
            IAuthorizationHelper authorizationHelper,
            IResultsApiClient resultsApiClient)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));

            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _resultsApiClient = resultsApiClient;
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/calculations/{calculationId}")]
        public async Task<IActionResult> SaveCalculation(string specificationId, string calculationId, [FromBody] CalculationUpdateViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(calculationId, nameof(calculationId));
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
        public async Task<IActionResult> CompilePreview([FromRoute] string specificationId, [FromRoute] string calculationId, [FromBody] PreviewCompileRequestViewModel vm)
        {
            if (!ModelState.IsValid)
            {
                PreviewResponse errorResponse = new PreviewResponse();

                foreach (var modelStateValue in ModelState.Values)
                {
                    errorResponse.CompilerOutput = new Build
                    {
                        CompilerMessages = new List<CompilerMessage>
                        {
                            new CompilerMessage {Message = modelStateValue.Errors[0].ErrorMessage}
                        }
                    };
                }

                return BadRequest(errorResponse);
            }

            PreviewRequest request = _mapper.Map<PreviewRequest>(vm);
            request.CalculationId = calculationId;
            request.SpecificationId = specificationId;

            ApiResponse<PreviewResponse> response = await _calcClient.PreviewCompile(request);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            if (response.StatusCode == HttpStatusCode.BadRequest)
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

            ApiResponse<IEnumerable<Common.ApiClient.Calcs.Models.Code.TypeInformation>> response = await _calcClient.GetCodeContextForSpecification(specificationId);
            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
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
        public async Task<IActionResult> ApproveCalculation([FromRoute] string specificationId, [FromRoute] string calculationId, [FromBody] PublishStatusEditModel publishStatusEditModel)
        {
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
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
        }

        [Route("api/calcs/{calculationId}/approvepermission")]
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
        public async Task<IActionResult> CreateCalculation(string specificationId, string calculationId, [FromBody] CreateAdditionalCalculationViewModel vm)
        {
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
            createCalculation.Id = calculationId;
            createCalculation.Name = vm.CalculationName;
            createCalculation.ValueType = vm.CalculationType;

            ValidatedApiResponse<Calculation> response = await _calcClient.CreateCalculation(specificationId, createCalculation);
            
            if (response.IsBadRequest(out BadRequestObjectResult badRequest))
            {
                return badRequest;
            }

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            return BadRequest($"An error occurred while saving calculation. Please check and try again.");
        }

        [HttpPost]
        [Route("api/calcs/status-counts")]
        public async Task<IActionResult> GetCalculationStatusCounts([FromBody] SpecificationIdsRequestModel specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            ApiResponse<IEnumerable<CalculationStatusCounts>> response = await _calcClient.GetCalculationStatusCounts(specificationIds);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/calculations/{calculationId}/editadditionalcalculation")]
        public async Task<IActionResult> EditAdditionalCalculation(string specificationId, string calculationId, [FromBody] EditAdditionalCalculationViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
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
            editCalculation.ValueType = vm.CalculationType;

            ValidatedApiResponse<Calculation> response = await _calcClient.EditCalculation(specificationId, calculationId, editCalculation);
                
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

        [HttpGet]
        [Route("api/calcs/getcalculationbyid/{calculationId}")]
        public async Task<IActionResult> GetCalculationById(string calculationId)
        {
            Guard.ArgumentNotNull(calculationId, nameof(calculationId));

            ApiResponse<Calculation> result = await _calcClient.GetCalculationById(calculationId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }

            return BadRequest(result.Content);
        }

        [HttpGet]
        [Route("api/calcs/getcalculations/{specificationId}/{calculationType}/{pageNumber}")]
        public async Task<IActionResult> GetCalculationsForSpecification(string specificationId,
            CalculationType calculationType, int pageNumber, [FromQuery] string searchTerm, [FromQuery] string status)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            PublishStatus? publishStatus = null;

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                publishStatus = (PublishStatus)Enum.Parse(typeof(PublishStatus), status);
            }

            ApiResponse<SearchResults<CalculationSearchResult>> result =
                await _calcClient.SearchCalculationsForSpecification(specificationId,
                    calculationType, publishStatus, searchTerm, pageNumber);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }

            return BadRequest(result.Content);
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
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));

            PublishStatus? publishStatus = null;

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                publishStatus = (PublishStatus)Enum.Parse(typeof(PublishStatus), status);
            }

            ApiResponse<SearchResults<CalculationSearchResult>> result =
                await _calcClient.SearchCalculationsForSpecification(specificationId,
                    calculationType, publishStatus, searchTerm, pageNumber);

            ApiResponse<ProviderResultResponse> providerResultResponse =
                await _resultsApiClient.GetProviderResults(providerId, specificationId);
            IActionResult providerResultResponseErrorResult = providerResultResponse.IsSuccessOrReturnFailureResult("GetProviderResults");
            if (providerResultResponseErrorResult != null)
            {
                return providerResultResponseErrorResult;
            }

            if (result.StatusCode == HttpStatusCode.OK)
            {
                var calcSearchResults = result.Content;

                IEnumerable<AdditionalCalculationSearchResultViewModel> additionalCalcs =
                    calcSearchResults.Results.Select(c =>
                        new AdditionalCalculationSearchResultViewModel
                        {
                            Id = c.Id,
                            Name = c.Name,
                            ValueType = c.ValueType,
                            Value = providerResultResponse.Content.CalculationResults.FirstOrDefault(calcResult => calcResult.Calculation.Id == c.Id)?.Value,
                            LastUpdatedDate = c.LastUpdatedDate
                        });

                var calcs = new SearchResults<AdditionalCalculationSearchResultViewModel>
                {
                    TotalCount = calcSearchResults.TotalCount,
                    Results = additionalCalcs,
                    Facets = calcSearchResults.Facets,
                    TotalErrorCount = calcSearchResults.TotalErrorCount,
                };

                return Ok(calcs);
            }

            return BadRequest(result.Content);
        }

        [HttpGet]
        [Route("api/calcs/getcalculationversionhistory/{calculationId}")]
        public async Task<IActionResult> GetCalculationVersionHistory(string calculationId)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            var response = await _calcClient.GetAllVersionsByCalculationId(calculationId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(response.Content);
            }

            return new BadRequestObjectResult(response.Content);
        }

        [HttpGet]
        [Route("api/calcs/getmultipleversions")]
        public async Task<IActionResult> GetMulitpleCalculationVersions([FromQuery] string calculationId,
            [FromQuery(Name = "versions[]")] int[] versions)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(versions, nameof(versions));


            ApiResponse<IEnumerable<CalculationVersion>> response = await _calcClient.GetMultipleVersionsByCalculationId(versions, calculationId);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            if (response.StatusCode == HttpStatusCode.BadGateway)
            {
                return BadRequest();
            }

            return new StatusCodeResult(500);

        }

        private async Task<bool> CanUserApproveCalculation(Calculation calculation)
        {
            if (await _authorizationHelper.DoesUserHavePermission(User, calculation.SpecificationId, SpecificationActionTypes.CanApproveAnyCalculations))
            {
                return true;
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, calculation.SpecificationId, SpecificationActionTypes.CanApproveCalculations))
            {
                return false;
            }

            return User.GetUserProfile()?.Id != calculation.Author.Id;
        }
    }
}
