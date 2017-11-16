using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Newtonsoft.Json;

namespace Allocations.Web.ApiClient.Models
{
    public class ProductTestScenario : IValidatableObject
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [Required]
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("givenSteps")]
        public List<GivenStep> GivenSteps { get; set; }
        [JsonProperty("thenSteps")]
        public List<ThenStep> ThenSteps { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var testScenario = validationContext.ObjectInstance as ProductTestScenario;

            if (testScenario == null || testScenario.GivenSteps.Any())
            {
                yield return new ValidationResult("There must be at least one given step");
            }

            if (testScenario == null || testScenario.ThenSteps.Any())
            {
                yield return new ValidationResult("There must be at least one then step");
            }
        }
    }
}