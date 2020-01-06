namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchRequestViewModel
    {
	    public string SpecificationId { get; set; }

	    public string CalculationType { get; set; }

	    public string Status { get; set; }

	    public int PageNumber { get; set; }

	    public string SearchTerm { get; set; }
    }
}
