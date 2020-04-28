using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.FeatureManagement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeatureFlagsController : ControllerBase
    {
        private readonly IFeatureManager _featureManager;

        public FeatureFlagsController(IFeatureManager featureManager)
        {
            _featureManager = featureManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeatureFlag>>> GetFeatureFlags()
        {
            List<FeatureFlag> features = new List<FeatureFlag>();
            await foreach (string feature in _featureManager.GetFeatureNamesAsync())
            {
                bool isEnabled = await _featureManager.IsEnabledAsync(feature);
                features.Add(new FeatureFlag { Name = feature, isEnabled = isEnabled });
            }

            return Ok(features);
        }
    }
}