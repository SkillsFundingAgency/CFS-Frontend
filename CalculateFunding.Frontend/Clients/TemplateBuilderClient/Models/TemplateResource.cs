﻿using System;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateResource
    {
        public string TemplateId { get; set; }
        
        /// <summary>
        /// contains template itself in its full JSON glory (theoretically any schema supported)
        /// </summary>
        public string TemplateJson { get; set; }
        
        /// <summary>
        /// Funding Stream ID. eg PSG, DSG
        /// </summary>
        public string FundingStreamId { get; set; }
        
        public string FundingStreamName { get; set; }

        /// <summary>
        /// Funding Period Id (foreign key)
        /// </summary>
        public string FundingPeriodId { get; set; }
        
        public string FundingPeriodName { get; set; }

        /// <summary>
        /// Schema version
        /// </summary>
        public string SchemaVersion { get; set; }

        /// <summary>
        /// Template name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Template description
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// Status of Template Build
        /// </summary>
        public TemplateStatus Status { get; set; }
        
        /// <summary>
        /// Comments added to template
        /// </summary>
        public string Comments { get; set; }

        /// <summary>
        /// Template minor version
        /// </summary>
        public int MinorVersion { get; set; }

        /// <summary>
        /// Template major version
        /// </summary>
        public int MajorVersion { get; set; }

        /// <summary>
        /// Version of VersionedItem
        /// </summary>
        public int Version { get; set; }

        /// <summary>
        /// whether this template version is the latest most current
        /// </summary>
        public bool IsCurrentVersion { get; set; }
        
        /// <summary>
        /// Author id
        /// </summary>
        public string AuthorId { get; set; }
        
        /// <summary>
        /// Author name
        /// </summary>
        public string AuthorName { get; set; }
        
        /// <summary>
        /// Last modification date
        /// </summary>
        public DateTime LastModificationDate { get; set; }
    }
}