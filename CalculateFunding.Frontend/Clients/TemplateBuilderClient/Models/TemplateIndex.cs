using System;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateIndex
    {
	    public string Id { get; set; }
	    public string Name { get; set; }
	    public string FundingStreamId { get; set; }
	    public string FundingStreamName { get; set; }
	    public string FundingPeriodId { get; set; }
	    public string FundingPeriodName { get; set; }
	    public DateTime LastUpdatedDate { get; set; }
	    public string LastUpdatedAuthorId { get; set; }
	    public string LastUpdatedAuthorName { get; set; }
	    public string Status { get; set; }
	    public int Version { get; set; }
	    public int CurrentMajorVersion { get; set; }
	    public int CurrentMinorVersion { get; set; }
	    public int PublishedMajorVersion { get; set; }
	    public int PublishedMinorVersion { get; set; }
	    public string HasReleasedVersion { get; set; }
    }
}
