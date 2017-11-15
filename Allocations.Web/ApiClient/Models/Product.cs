using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Allocations.Web.Pages.Specifications;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Allocations.Web.ApiClient.Models
{

    public class Product
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("calculation")]
        public ProductCalculation Calculation { get; set; }
        [JsonProperty("testScenarios")]
        public List<ProductTestScenario> TestScenarios { get; set; }
        [JsonProperty("testProviders")]
        public Reference[] TestProviders { get; set; }
    }

    public class ProductTestScenario
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
    }

    public class ThenStep : TestStep
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
    }

    public class GivenStep : TestStep
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
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum ComparisonOperator
    {
        [EnumMember(Value = "is equal to")]
        EqualTo,
        [EnumMember(Value = "is not equal to")]
        NotEqualTo,
        [EnumMember(Value = "is greater than")]
        GreaterThan,
        [EnumMember(Value = "is less than")]
        LessThan,
        [EnumMember(Value = "is greater than or equal to")]
        GreaterThanOrEqualTo,
        [EnumMember(Value = "is less than or equal to")]
        LessThanOrEqualTo
    }

    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum TestStepType
    {
        GivenSourceField,
        ThenProductValue
    }

    //[] Move to budget/folder??
}