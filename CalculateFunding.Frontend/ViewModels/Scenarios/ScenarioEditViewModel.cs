namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using CalculateFunding.Frontend.Properties;
    using System.ComponentModel.DataAnnotations;
    public class ScenarioEditViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ScenarioGherkinRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Gherkin { get; set; }

    }
}
