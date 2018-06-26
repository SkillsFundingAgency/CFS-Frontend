namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class ReferenceViewModel
    {
        public ReferenceViewModel()
        {
        }

        public ReferenceViewModel(string id, string name)
        {
            this.Id = id;
            this.Name = name;
        }

        public string Id { get; set; }

        public string Name { get; set; }
    }
}
