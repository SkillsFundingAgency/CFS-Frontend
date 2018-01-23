using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class GivenStep : TestStep, IValidatableObject
    {
        public GivenStep()
        {

        }
        public GivenStep(string dataset, string field, ComparisonOperator @operator, string value)
        {
            StepType = TestStepType.GivenSourceField;
            Dataset = dataset;
            Field = field;
            Operator = @operator;
            Value = value;
        }
        [JsonProperty("dataset")]
        public string Dataset { get; set; }
        [JsonProperty("field")]
        public string Field { get; set; }
        [JsonProperty("operator")]
        public ComparisonOperator Operator { get; set; }
        [JsonProperty("value")]
        public string Value { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            switch (StepType)
            {
                case TestStepType.GivenSourceField:
                    if (Operator != ComparisonOperator.None || !string.IsNullOrEmpty(Field) || !string.IsNullOrEmpty(Value))
                    {
                        if (string.IsNullOrEmpty(Dataset)) yield return new ValidationResult("Dataset must be specified");
                        if(Operator == ComparisonOperator.None) yield return new ValidationResult("Operator must be specified");
                        if (string.IsNullOrEmpty(Value)) yield return new ValidationResult("Value must be specified");
                    }
                    break;
            }
        }
    }
}