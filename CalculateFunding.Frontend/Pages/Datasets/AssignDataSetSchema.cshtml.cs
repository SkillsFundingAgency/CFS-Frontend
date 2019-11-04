using CalculateFunding.Common.ApiClient.DataSets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class AssignDatasetSchemaPageModel : PageModel
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public AssignDatasetSchemaPageModel(ISpecificationsApiClient specsClient, IDatasetsApiClient datasetsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(specsClient, nameof(mapper));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public string SpecificationDescription { get; set; }

        public IEnumerable<GdsSelectListItem> Datasets { get; set; }

	    public bool IsAuthorizedToEdit { get; set; }

        [BindProperty]
        public AssignDatasetSchemaViewModel AssignDatasetSchemaViewModel { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            if (string.IsNullOrWhiteSpace(specificationId))
            {
                return new BadRequestObjectResult(ErrorMessages.SpecificationIdNullOrEmpty);
            }

            SpecificationId = specificationId;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(specificationId);

            if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult($"Unable to get specification response. Specification Id value = {SpecificationId}");
            }

            if (specificationResponse.StatusCode.IsSuccess())
            {
                SpecificationSummary specContent = specificationResponse.Content;

                if (specContent == null)
                {
                    throw new InvalidOperationException(message: $"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
                }

	            IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User, specContent, SpecificationActionTypes.CanEditSpecification);
				
                SpecificationName = specContent.Name;
                SpecificationDescription = specContent.Description;
                FundingPeriodId = specContent.FundingPeriod.Id;
                FundingPeriodName = specContent.FundingPeriod.Name;

                ApiResponse<IEnumerable<DatasetDefinition>> datasetResponse = await _datasetsClient.GetDatasetDefinitions();

                if (datasetResponse == null || datasetResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundObjectResult(ErrorMessages.DatasetDefinitionNotFoundInDatasetService);
                }

                if (datasetResponse.StatusCode.IsSuccess())
                {
                    IEnumerable<DatasetDefinition> datasetDefinitionList = datasetResponse.Content;

                    if (datasetDefinitionList.IsNullOrEmpty())
                    {
                        throw new InvalidOperationException($"Unable to retrieve Dataset definition from the response. Specification Id value = {SpecificationId}");
                    }
                    else
                    {
                        PopulateDatasetSchemas(datasetDefinitionList);
                    }
                }
                else
                {
                    return new StatusCodeResult(500);
                }
            }
            else
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

	        SpecificationId = specificationId;

	        ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(specificationId);
	        if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
	        {
		        return new NotFoundObjectResult($"Unable to get specification response. Specification Id value = {SpecificationId}");
	        }

	        if (specificationResponse.StatusCode == HttpStatusCode.OK && specificationResponse.Content == null)
	        {
		        throw new InvalidOperationException($"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
	        }

	        IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User, specificationResponse.Content, SpecificationActionTypes.CanEditSpecification);
	        if (!IsAuthorizedToEdit)
	        {
		        return new ForbidResult();
	        }

			if (!string.IsNullOrWhiteSpace(AssignDatasetSchemaViewModel.Name))
            {
                ApiResponse<IEnumerable<DefinitionSpecificationRelationship>> existingRelationshipResponse = await _datasetsClient.GetRelationshipBySpecificationIdAndName(specificationId, AssignDatasetSchemaViewModel.Name);

                if (existingRelationshipResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(AssignDatasetSchemaViewModel)}.{nameof(AssignDatasetSchemaViewModel.Name)}", ValidationMessages.RelationshipNameAlreadyExists);
                }
            }

			if (!ModelState.IsValid)
            {
                if (specificationResponse.StatusCode == HttpStatusCode.OK)
                {
                    SpecificationSummary specContent = specificationResponse.Content;

                    ApiResponse<IEnumerable<DatasetDefinition>> datasetResponse = await _datasetsClient.GetDatasetDefinitions();

                    if (datasetResponse == null || datasetResponse.StatusCode == HttpStatusCode.NotFound)
                    {
                        return new NotFoundObjectResult(ErrorMessages.DatasetDefinitionNotFoundInDatasetService);
                    }

                    if (datasetResponse.StatusCode == HttpStatusCode.OK)
                    {
                        IEnumerable<DatasetDefinition> datasetDefinitionList = datasetResponse.Content;

                        if (datasetDefinitionList == null)
                        {
                            throw new InvalidOperationException($"Unable to retrieve Dataset definition from the response. Specification Id value = {SpecificationId}");
                        }

                        SpecificationName = specContent.Name;

                        SpecificationDescription = specContent.Description;

                        FundingPeriodId = specContent.FundingPeriod.Id;

                        FundingPeriodName = specContent.FundingPeriod.Name;

                        PopulateDatasetSchemas(datasetDefinitionList);

                        return Page();
                    }
                    else
                    {
                        return new StatusCodeResult(500);
                    }
                }
            }

			CreateDefinitionSpecificationRelationshipModel datasetSchema = _mapper.Map<CreateDefinitionSpecificationRelationshipModel>(AssignDatasetSchemaViewModel);

            datasetSchema.SpecificationId = specificationId;

            ApiResponse<DefinitionSpecificationRelationship> newAssignDatasetResponse = await _datasetsClient.CreateRelationship(datasetSchema);

            if (newAssignDatasetResponse?.StatusCode == HttpStatusCode.OK)
            {
                return Redirect($"/datasets/ListDatasetSchemas/{specificationId}");
            }

            return new StatusCodeResult(500);
        }

        private void PopulateDatasetSchemas(IEnumerable<DatasetDefinition> datsetDefn)
        {
            Guard.ArgumentNotNull(datsetDefn, nameof(datsetDefn));

            Datasets = datsetDefn != null ? datsetDefn.OrderBy(m => m.Name).Select(m => new GdsSelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Description = m.Description,
            }).ToList() : Enumerable.Empty<GdsSelectListItem>();
        }
    }
}
