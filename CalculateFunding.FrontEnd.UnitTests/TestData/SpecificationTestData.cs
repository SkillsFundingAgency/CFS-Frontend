// <copyright file="SpecificationTestData.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.TestData
{
    using System.Collections.Generic;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;

    public static class SpecificationTestData
    {
        public static IEnumerable<Specification> Data()
        {
            return new[]
            {
                new Specification
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                    Policies = new List<Policy>()
                },
                new Specification
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                    Policies = new List<Policy>()
                },
                new Specification
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                    Policies = new List<Policy>()
                }
            };
        }

        public static IEnumerable<SpecificationSummary> DataSummary()
        {
            return new[]
            {
                new SpecificationSummary
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                },
                new SpecificationSummary
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                },
                new SpecificationSummary
                {
                    FundingPeriod = new Reference(),
                    FundingStreams = new List<FundingStream>(),
                    Description = "test",
                }
            };
        }
    }
}