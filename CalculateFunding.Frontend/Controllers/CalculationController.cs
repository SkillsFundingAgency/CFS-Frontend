namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Microsoft.AspNetCore.Mvc;

    public class CalculationController : Controller
    {
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CalculationController(ICalculationsApiClient calcClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
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

            CalculationUpdateModel update = _mapper.Map<CalculationUpdateModel>(vm);
            ApiResponse<Calculation> response = await _calcClient.UpdateCalculation(calculationId, update);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
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

            PreviewCompileRequest request = _mapper.Map<PreviewCompileRequest>(vm);
            request.CalculationId = calculationId;
            request.SpecificationId = specificationId;

            ApiResponse<PreviewCompileResult> response = await _calcClient.PreviewCompile(request);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
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

            ApiResponse<IEnumerable<TypeInformation>> response = await _calcClient.GetCodeContextForSpecification(specificationId);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
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

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
        }
    }
}
