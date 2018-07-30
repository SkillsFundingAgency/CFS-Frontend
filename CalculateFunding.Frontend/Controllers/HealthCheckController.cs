using System;
using System.Linq;
using Autofac.Core;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Options;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Health;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CalculateFunding.Frontend.Controllers
{
    [Route("healthcheck")]
    [ApiController]
    [AllowAnonymous]
    public class HealthCheckController : ControllerBase
    {
        private const string HealthCheckKey = "Ocp-Apim-Health-Check-Key";
        private HealthCheckOptions _options;

        public HealthCheckController(IOptions<HealthCheckOptions> options)
        {
            _options = options.Value;
        }

        public IActionResult Get()
        {
            if (!this.Request.Headers.ContainsKey(HealthCheckKey))
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }
            else
            {
                string healthCheckKeyValue = this.Request.Headers[HealthCheckKey];

                if (healthCheckKeyValue != _options.ApiKey)
                {
                    return StatusCode(StatusCodes.Status403Forbidden);
                }

            }
            OverallHealth overallHealth = new OverallHealth();

            overallHealth.Services.Add(TryResolveService(typeof(ICalculationSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(IDatasetSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(IProviderSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(IDatasetRelationshipsSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(IScenarioSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(ITestScenarioSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(ITestResultsSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(ITestScenarioResultsService)));
            overallHealth.Services.Add(TryResolveService(typeof(ICalculationProviderResultsSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(ISpecificationSearchService)));
            overallHealth.Services.Add(TryResolveService(typeof(IUserProfileService)));

            overallHealth.OverallHealthOk = overallHealth.Services.Min(x => x.HealthOk);

            return new JsonResult(overallHealth);
        }

        private ServiceHealth TryResolveService(Type serviceType)
        {
            var health = new ServiceHealth { Name = serviceType.GetFriendlyName(), HealthOk = false };
            try
            {
                var service = this.HttpContext.RequestServices.GetService(serviceType);
                health.HealthOk = true;
            }
            catch (DependencyResolutionException drEx)
            {
                health.HealthOk = false;

                if (drEx.InnerException != null)
                {
                    health.Message = drEx.InnerException.Message;
                }
                else
                {
                    health.Message = drEx.Message;
                }
            }

            return health;
        }
    }
}