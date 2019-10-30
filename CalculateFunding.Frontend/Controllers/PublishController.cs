using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class PublishController : Controller
    {
        private ISpecificationsApiClient _specificationsApiClient;

        public PublishController(ISpecificationsApiClient specificationsApiClient)
        {
            _specificationsApiClient = specificationsApiClient;
        }

        [Route("api/publish/savetimetable")]
        [HttpPost]
        public async Task<IActionResult> SaveTimetable([FromBody]ReleaseTimetableViewModel viewModel)
        {
            SpecificationPublishDateModel publishData = new SpecificationPublishDateModel
            {
                EarliestPaymentAvailableDate = viewModel.FundingDate,
                ExternalPublicationDate = viewModel.StatementDate
            };


            HttpStatusCode publish = await _specificationsApiClient.SetPublishDates(viewModel.SpecificationId, publishData);

            if (publish == HttpStatusCode.OK)
            {
                return new OkObjectResult(Content("Successful"));
            }

            if (publish == HttpStatusCode.BadRequest)
            {
                return new BadRequestObjectResult(Content("There was a problem with the data submitted. Please check and try again."));
            }

            return new NotFoundObjectResult(Content("Error. Not Found."));
        }

        [Route("api/publish/gettimetable/{specificationId}")]
        [HttpGet]
        public async Task<IActionResult> GetTimetable(string specificationId)
        {
            ApiResponse<SpecificationPublishDateModel> result = await _specificationsApiClient.GetPublishDates(specificationId);

            if (result != null)
            {
                return new OkObjectResult(result);
            }

            return new NotFoundObjectResult(Content("Error. Not Found."));
        }

    }
}