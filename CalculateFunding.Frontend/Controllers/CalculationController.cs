namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Calcs;
    using CalculateFunding.Common.ApiClient.Calcs.Models;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Common.ApiClient.Models;
    using Microsoft.AspNetCore.Mvc;

    public class CalculationController : Controller
    {
        private ICalculationsApiClient _calcClient;
        private ISpecificationsApiClient _specificationsApiClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CalculationController(ICalculationsApiClient calcClient, IMapper mapper, IAuthorizationHelper authorizationHelper, ISpecificationsApiClient specificationsApiClient)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _specificationsApiClient = specificationsApiClient;
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
                Description = existingCalculation.Current.Description,
                Name = existingCalculation.Name,
                SpecificationId = specificationId,
                ValueType = existingCalculation.Current.ValueType,
                SourceCode = vm.SourceCode,
            };

            ValidatedApiResponse<Calculation> response = await _calcClient.EditCalculation(specificationId, calculationId, update);

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
        public async Task<IActionResult> CompilePreview([FromRoute]string specificationId, [FromRoute] string calculationId, [FromBody]PreviewCompileRequestViewModel vm)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PreviewRequest request = _mapper.Map<PreviewRequest>(vm);
            request.CalculationId = calculationId;
            request.SpecificationId = specificationId;

            ApiResponse<PreviewResponse> response = await _calcClient.PreviewCompile(request);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while compiling calculation. Status code={response.StatusCode}");
            }
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

        [Route("api/specs/{specificationId}/calculations/{calculationId}/status")]
        [HttpPut]
        public async Task<IActionResult> EditCalculationStatus([FromRoute]string specificationId, [FromRoute]string calculationId, [FromBody]PublishStatusEditModel publishStatusEditModel)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(publishStatusEditModel, nameof(publishStatusEditModel));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanEditCalculations))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<PublishStatusResult> response = await _calcClient.UpdatePublishStatus(calculationId, publishStatusEditModel);

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
        [Route("api/specs/{specificationId}/calculations/createadditionalcalculation")]
        public async Task<IActionResult> CreateCalculation(string specificationId, string calculationId, [FromBody] CreateAdditionalCalculationViewModel vm)
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

            CalculationCreateModel createCalculation = _mapper.Map<CalculationCreateModel>(vm);

            createCalculation.SpecificationId = specificationId;
            createCalculation.Id = calculationId;
            createCalculation.Name = vm.CalculationName;
            createCalculation.ValueType = vm.CalculationType;
            
            ValidatedApiResponse<Calculation> response = await _calcClient.CreateCalculation(specificationId, createCalculation);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while saving calculation. Status code={response.StatusCode}");
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

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while saving calculation. Status code={response.StatusCode}");
            }
        }
    }
}
