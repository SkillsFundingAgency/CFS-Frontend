namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class SpecificationDatasourceRelationshipSearchResultItem
    {
        [JsonProperty("specificationId")]
        public string Id { get; set; }

        [JsonProperty("specificationName")]
        public string Name { get; set; }

        [JsonProperty("definitionRelationshipCount")]
        public int RelationshipCount { get; set; }
    }
}
