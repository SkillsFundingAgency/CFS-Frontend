using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationVariableDefinition
    {
        public string Label { get; set; }

        public string Description { get; set; }

        public IDictionary<string, CalculationVariableDefinition> Items { get; set; }
    }
}