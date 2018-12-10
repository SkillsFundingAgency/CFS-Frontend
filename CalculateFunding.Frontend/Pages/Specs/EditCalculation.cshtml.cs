namespace CalculateFunding.Frontend.Pages.Specs
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Net;
	using System.Threading.Tasks;
	using AutoMapper;
	using CalculateFunding.Common.ApiClient.Models;
	using CalculateFunding.Common.Identity.Authorization.Models;
	using CalculateFunding.Common.Utility;
	using CalculateFunding.Frontend.Clients.SpecsClient.Models;
	using CalculateFunding.Frontend.Extensions;
	using CalculateFunding.Frontend.Helpers;
	using CalculateFunding.Frontend.Interfaces.ApiClient;
	using CalculateFunding.Frontend.ViewModels.Specs;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.AspNetCore.Mvc.RazorPages;
	using Microsoft.AspNetCore.Mvc.Rendering;
	using Newtonsoft.Json;
	using Serilog;

	public class EditCalculationPageModel : PageModel
	{
		private readonly ISpecsApiClient _specsClient;
		private readonly ILogger _logger;
		private readonly IMapper _mapper;
		private readonly IAuthorizationHelper _authorizationHelper;

		private static readonly IEnumerable<string> _calculationTypes = new[] { CalculationSpecificationType.Funding.ToString(), CalculationSpecificationType.Number.ToString(), CalculationSpecificationType.Baseline.ToString(), };

		public EditCalculationPageModel(ISpecsApiClient specsClient, ILogger logger, IMapper mapper, IAuthorizationHelper authorizationHelper)
		{
			Guard.ArgumentNotNull(specsClient, nameof(specsClient));
			Guard.ArgumentNotNull(logger, nameof(logger));
			Guard.ArgumentNotNull(mapper, nameof(mapper));
			Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

			_specsClient = specsClient;
			_logger = logger;
			_mapper = mapper;
			_authorizationHelper = authorizationHelper;
		}


		[BindProperty]
		public EditCalculationViewModel EditCalculationViewModel { get; set; }

		public SpecificationViewModel Specification { get; set; }

		public IList<SelectListItem> Policies { get; set; }

		public IEnumerable<SelectListItem> AllocationLines { get; set; }

		public IEnumerable<SelectListItem> CalculationTypes { get; set; }

		public string HideAllocationLinesForBaselinesJson { get; set; }

		public string ExistingAllocationLineId { get; set; }

		public int AvailableBaselineAllocationLineIds { get; set; }

		public bool IsAuthorizedToEdit { get; set; }

		public async Task<IActionResult> OnGetAsync(string specificationId, string calculationId)
		{
			Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

			Specification specification = await GetSpecification(specificationId);

			if (specification != null)
			{
				IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification);

				ApiResponse<CalculationCurrentVersion> calculationResult = await _specsClient.GetCalculationById(specificationId, calculationId);
				if (calculationResult == null)
				{
					_logger.Error("Calculation Result API response returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

					return new InternalServerErrorResult("Calculation Result API response returned null");
				}

				if (calculationResult.StatusCode == HttpStatusCode.NotFound)
				{
					return new NotFoundObjectResult("Calculation not found");
				}
				else if (calculationResult.StatusCode != HttpStatusCode.OK)
				{
					_logger.Warning($"Unexpected status code from Calculation API call '{calculationResult.StatusCode}'");
					return new InternalServerErrorResult($"Unexpected status code from Calculation API call '{calculationResult.StatusCode}'");
				}

				Calculation calculation = calculationResult.Content;
				if (calculation == null)
				{
					_logger.Warning("Calculation Result API response content returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

					return new InternalServerErrorResult("Calculation content returned null");
				}

				EditCalculationViewModel = _mapper.Map<EditCalculationViewModel>(calculation);

				return await PopulateForm(specification, calculationId);
			}
			else
			{
				return new PreconditionFailedResult("Specification not found");
			}
		}

		public async Task<IActionResult> OnPostAsync(string specificationId, string calculationId)
		{
			Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
			Specification specification = await GetSpecification(specificationId);

			if (!await _authorizationHelper.DoesUserHavePermission(User, specification, SpecificationActionTypes.CanEditSpecification))
			{
				return new ForbidResult();
			}

			if (!ModelState.IsValid)
			{
				return await PopulateForm(specification, calculationId);
			}

			CalculationUpdateModel updateModel = _mapper.Map<CalculationUpdateModel>(EditCalculationViewModel);

			ValidatedApiResponse<Calculation> editCalculationResponse = await _specsClient.UpdateCalculation(specificationId, calculationId, updateModel);

			if (editCalculationResponse.StatusCode == HttpStatusCode.OK)
			{
				Calculation editedCalculation = editCalculationResponse.Content;

				return Redirect($"/specs/policies/{specificationId}?operationId={editedCalculation.Id}&operationType=CalculationUpdated");
			}
			else if (editCalculationResponse.StatusCode == HttpStatusCode.BadRequest)
			{
				editCalculationResponse.AddValidationResultErrors(ModelState);

				await PopulateForm(specification, calculationId);

				return Page();
			}
			else
			{
				throw new InvalidOperationException($"Unable to create calculation specifications. Status Code = {editCalculationResponse.StatusCode}");
			}
		}

		private async Task<IActionResult> PopulateForm(Specification specification, string calculationId)
		{
			Specification = _mapper.Map<SpecificationViewModel>(specification);

			PopulateAllocationLines(specification);

			if (AllocationLines.IsNullOrEmpty())
			{
				return new InternalServerErrorResult($"Failed to load allocation lines for specification id: {specification.Id}");
			}

			PopulatePolicies(specification);

			PopulateCalculationTypes();

			ApiResponse<IEnumerable<CalculationCurrentVersion>> baselinesQuery = await _specsClient.GetBaselineCalculationsBySpecificationId(specification.Id);
			IActionResult baselinesError = baselinesQuery.IsSuccessOrReturnFailureResult("Calculation baselines");
			if (baselinesError != null)
			{
				return baselinesError;
			}

			IEnumerable<string> hiddenAllocationLineIds;
			if (baselinesQuery.Content.AnyWithNullCheck())
			{
				hiddenAllocationLineIds = baselinesQuery.Content.Select(s => s.AllocationLine?.Id).Where(s => !string.IsNullOrWhiteSpace(s));
			}
			else
			{
				hiddenAllocationLineIds = Enumerable.Empty<string>();
			}

			HideAllocationLinesForBaselinesJson = JsonConvert.SerializeObject(hiddenAllocationLineIds);

			ExistingAllocationLineId = JsonConvert.SerializeObject(specification.GetCalculationById(calculationId)?.AllocationLine?.Id);
			AvailableBaselineAllocationLineIds = AllocationLines.Count() - hiddenAllocationLineIds.Count();

			return Page();
		}

		private void PopulateCalculationTypes()
		{
			CalculationTypes = _calculationTypes.Select(m => new SelectListItem
			{
				Value = m,
				Text = m,
				Selected = string.Equals(m, EditCalculationViewModel.CalculationType, StringComparison.InvariantCultureIgnoreCase)
			});
		}

		private void PopulatePolicies(Specification specification)
		{
			Guard.ArgumentNotNull(specification, nameof(specification));

			Policies = new List<SelectListItem>();

			if (specification.Policies != null)
			{
				SelectListGroup policiesGroup = new SelectListGroup { Name = "Policies" };
				SelectListGroup subPoliciesGroup = new SelectListGroup { Name = "Subpolicies" };

				foreach (Policy policy in specification.Policies)
				{
					Policies.Add(new SelectListItem
					{
						Value = policy.Id,
						Text = policy.Name,
						Selected = policy.Id == EditCalculationViewModel.PolicyId,
						Group = policiesGroup
					});

					if (policy.SubPolicies != null)
					{
						foreach (Policy subPolicy in policy.SubPolicies)
						{
							Policies.Add(new SelectListItem
							{
								Value = subPolicy.Id,
								Text = subPolicy.Name,
								Selected = subPolicy.Id == EditCalculationViewModel.PolicyId,
								Group = subPoliciesGroup
							});
						}
					}
				}
			}
		}

		private void PopulateAllocationLines(Specification specification)
		{
			List<SelectListItem> result = new List<SelectListItem>();

			if (specification.FundingStreams != null)
			{
				foreach (FundingStream fundingStream in specification.FundingStreams)
				{
					result.AddRange(fundingStream.AllocationLines.Select(m => new SelectListItem
					{
						Value = m.Id,
						Text = m.Name,
						Selected = m.Id == EditCalculationViewModel.AllocationLineId
					}));
				}
			}

			AllocationLines = result.OrderBy(c => c.Text);
		}

		private async Task<Specification> GetSpecification(string specificationId)
		{
			Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

			ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

			if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
			{
				return specificationResponse.Content;
			}

			return null;
		}
	}
}