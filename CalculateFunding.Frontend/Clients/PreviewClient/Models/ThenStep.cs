namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using Newtonsoft.Json;

    public class ThenStep : TestStep, IValidatableObject
    {
        public ThenStep()
        {
        }

        public ThenStep(ComparisonOperator @operator, string value)
        {
            StepType = TestStepType.ThenProductValue;
            Operator = @operator;
            Value = value;
        }

        [JsonProperty("operator")]
        public ComparisonOperator Operator { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            switch (StepType)
            {
                case TestStepType.GivenSourceField:
                    if (Operator != ComparisonOperator.None || !string.IsNullOrEmpty(Value))
                    {
                        if (Operator == ComparisonOperator.None)
                        {
                            yield return new ValidationResult("Operator must be specified");
                        }

                        if (string.IsNullOrEmpty(Value))
                        {
                            yield return new ValidationResult("Value must be specified");
                        }
                    }

                    break;
            }
        }
    }
}