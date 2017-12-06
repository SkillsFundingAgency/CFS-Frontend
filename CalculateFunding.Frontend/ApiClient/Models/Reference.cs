namespace CalculateFunding.Frontend.ApiClient.Models
{
    public class Reference
    {

        public Reference(string id, string name)
        {
            Id = id;
            Name = name;
        }

        public string Id { get; set; }
        public string Name { get; set; }
    }
}