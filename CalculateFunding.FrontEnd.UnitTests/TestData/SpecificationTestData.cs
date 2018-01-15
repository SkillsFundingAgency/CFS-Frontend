using CalculateFunding.Frontend.ApiClient.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace CalculateFunding.FrontEnd.TestData
{
    public static class SpecificationTestData
    {
        public static IEnumerable<Specification> Data()
        {
            return new[] {
                new Specification{
                    AcademicYear = new Reference(),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<Policy>()
                },
                new Specification{
                    AcademicYear = new Reference(),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<Policy>()
                },
                new Specification{
                    AcademicYear = new Reference(),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<Policy>()
                }
            };
        }
    }
}

