namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationSearchRequestViewModel
    {
	    public string SearchText { get; set; }

	    public string[] FundingPeriods { get; set; }
	    
	    public string[] FundingStreams { get; set; }
	    
	    public string[] Status { get; set; }
	    
	    public int PageSize { get; set; }
	    
	    public int Page { get; set; }
    }
}
