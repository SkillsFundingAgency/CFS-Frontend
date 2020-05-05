using System;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateVersionResource
    {
	    public DateTimeOffset Date { get; set; }
	    public string AuthorId { get; set; }
	    public string AuthorName { get; set; }
	    public string Comment { get; set; }
	    public int Version { get; set; }
	    public TemplateStatus Status { get; set; }
    }
}
