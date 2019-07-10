using System;
using System.Collections.Generic;
using System.Linq;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class Specification : Reference, ISpecificationAuthorizationEntity
    {
        public Specification()
        {
            Policies = Enumerable.Empty<Policy>();
        }

        [JsonProperty("fundingPeriod")]
        public Reference FundingPeriod { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("policies")]
        public IEnumerable<Policy> Policies { get; set; }

        [JsonProperty("fundingStreams")]
        public IEnumerable<FundingStream> FundingStreams { get; set; }

        [JsonProperty("providerVersionId")]
        public string ProviderVersionId { get; set; }

        [JsonProperty("publishStatus")]
        public PublishStatus PublishStatus { get; set; }

        [JsonProperty("isSelectedForFunding")]
        public bool IsSelectedForFunding { get; set; }

        public string GetSpecificationId()
        {
            return Id;
        }

        /// <summary>
        /// Gets all calculations - from top level policies and subpolicies in a flat list
        /// </summary>
        /// <returns>IEnumerable of Calculations for the specification</returns>
        public IEnumerable<Calculation> GetAllCalculations()
        {
            List<Calculation> calculations = new List<Calculation>();

            if (Policies != null)
            {
                foreach (Policy policy in Policies)
                {
                    if (policy != null && policy.Calculations != null)
                    {
                        foreach (Calculation calculation in policy.Calculations)
                        {
                            if (calculation != null)
                            {
                                calculations.Add(calculation);
                            }
                        }
                    }

                    if (policy != null && policy.SubPolicies != null)
                    {
                        foreach (Policy subPolicy in policy.SubPolicies)
                        {
                            if (subPolicy != null && subPolicy.Calculations != null)
                            {
                                foreach (Calculation calculation in subPolicy.Calculations)
                                {
                                    if (calculation != null)
                                    {
                                        calculations.Add(calculation);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return calculations;
        }

        /// <summary>
        /// Gets calculation by ID - located in either top level policies or subpolicies
        /// </summary>
        /// <returns>IEnumerable of Calculations for the specification</returns>
        public Calculation GetCalculationById(string calculationId)
        {
            Guard.ArgumentNotNull(calculationId, nameof(calculationId));
            List<Calculation> calculations = new List<Calculation>();

            if (Policies != null)
            {
                foreach (Policy policy in Policies)
                {
                    if (policy != null && policy.Calculations != null)
                    {
                        foreach (Calculation calculation in policy.Calculations)
                        {
                            if (calculation != null && string.Equals(calculation.Id, calculationId, StringComparison.InvariantCultureIgnoreCase))
                            {
                                return calculation;
                            }
                        }
                    }

                    if (policy != null && policy.SubPolicies != null)
                    {
                        foreach (Policy subPolicy in policy.SubPolicies)
                        {
                            if (subPolicy?.Calculations != null)
                            {
                                foreach (Calculation calculation in subPolicy.Calculations)
                                {
                                    if (calculation != null && string.Equals(calculation.Id, calculationId, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        return calculation;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return null;
        }
    }
}