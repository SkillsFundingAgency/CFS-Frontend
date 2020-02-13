using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
	[TestClass]
	public class PublishControllerTests
	{
		private const string ValidSpecificationId = "A VALID SPECIFICATION ID";
		private readonly ISpecificationsApiClient _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
		private readonly IAuthorizationHelper _authorizationHelper = Substitute.For<IAuthorizationHelper>();
		private readonly IPublishingApiClient _publishingApiClient = Substitute.For<IPublishingApiClient>();
		private readonly ValidatedApiResponse<JobCreationResponse> _validatedApiResponse = 
			new ValidatedApiResponse<JobCreationResponse>(HttpStatusCode.OK, new JobCreationResponse { JobId = "ID" });
		private PublishController _publishController;

		[TestInitialize]
		public void Setup()
		{
			_publishController =
				new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);
		}

		[TestMethod]
		public async Task SaveTimetable_Returns_Forbid_Result_Given_User_Does_Not_Have_Edit_Specification_Permission()
		{
			IActionResult result = await _publishController.SaveTimetable(new ReleaseTimetableViewModel());

			result.Should().BeAssignableTo<ForbidResult>();
		}

        [TestMethod]
        public async Task SaveTimetable_Returns_OK_Result_Given_User_Has_Required_Permission()
        {
			SetupAuthorizedUser(SpecificationActionTypes.CanEditSpecification);
            _specificationsApiClient.SetPublishDates(Arg.Any<string>(), Arg.Any<SpecificationPublishDateModel>())
                .Returns(HttpStatusCode.OK);
            _publishController =
                new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

            var fundingDate = DateTime.Now.AddDays(-1);
            var statementDate = DateTime.Now.AddMonths(-1);
            var releaseTimetableViewModel = new ReleaseTimetableViewModel
            {
				SpecificationId = "XYZ",
				FundingDate = fundingDate,
				StatementDate = statementDate
            };
            IActionResult result = await _publishController.SaveTimetable(releaseTimetableViewModel);

            result.Should().BeAssignableTo<OkObjectResult>();
            var specificationPublishDateModelResult = result.As<OkObjectResult>().Value.As<SpecificationPublishDateModel>();
            specificationPublishDateModelResult.EarliestPaymentAvailableDate.Should().Be(fundingDate);
            specificationPublishDateModelResult.ExternalPublicationDate.Should().Be(statementDate);
        }

        [TestMethod]
		public async Task RefreshFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_Refresh_Funding_Permission()
		{
			IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<ForbidResult>();
		}

		[TestMethod]
		public async Task RefreshFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
		{
			SetupAuthorizedUser(SpecificationActionTypes.CanRefreshFunding);
			_publishingApiClient.RefreshFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);
			_publishController =
				new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

			IActionResult result = await _publishController.RefreshFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<OkObjectResult>();
		}

        [TestMethod]
		public async Task ApproveFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_Approve_Permission()
		{
			IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<ForbidResult>();
		}

		[TestMethod]
		public async Task ApproveFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
		{
			SetupAuthorizedUser(SpecificationActionTypes.CanApproveFunding);
			_publishingApiClient.ApproveFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);
			_publishController =
				new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

			IActionResult result = await _publishController.ApproveFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<OkObjectResult>();
		}

        [TestMethod]
		public async Task PublishFunding_Returns_Forbid_Result_Given_User_Does_Not_Have_ReleaseFunding_Permission()
		{
			IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<ForbidResult>();
		}

		[TestMethod]
		public async Task PublishFunding_Returns_OK_Result_Given_User_Has_Required_Permission()
		{
			SetupAuthorizedUser(SpecificationActionTypes.CanReleaseFunding);
			_publishingApiClient.PublishFundingForSpecification(Arg.Any<string>()).Returns(_validatedApiResponse);
			_publishController =
				new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);

			IActionResult result = await _publishController.PublishFunding(ValidSpecificationId);

			result.Should().BeAssignableTo<OkObjectResult>();
		}

		private void SetupAuthorizedUser(SpecificationActionTypes specificationActionType)
		{
			_authorizationHelper.DoesUserHavePermission(
					_publishController.User,
					Arg.Any<string>(),
					specificationActionType)
				.Returns(true);
		}
	}
}
