namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;
    using Newtonsoft.Json;

    public class ScenarioCreateViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioGherkinRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Scenario { get; set; }

    }
}
