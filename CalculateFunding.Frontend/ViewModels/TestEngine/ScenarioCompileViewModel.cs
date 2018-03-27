using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    public class ScenarioCompileViewModel
    {
        [Required]
        public string Gherkin { get; set; }
    }
}
