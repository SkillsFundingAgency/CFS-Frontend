using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ApiClient.MockApiClient
{
    public class SpecsApiClient : ISpecsApiClient
    {
        public Task<ApiResponse<Reference[]>> GetAcademicYears()
        {
            var years = new[]
            {
                new Reference("1617", "2016-2017"),
                new Reference("1718", "2017-2018"),
                new Reference("1819", "2018-2019")
            };

            var response = new ApiResponse<Reference[]>(HttpStatusCode.OK, years);

            return Task.FromResult(response);
        }

        public Task<ApiResponse<Product>> GetProduct(string specificationId, string productId)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications()
        {
            var specs = new List<Specification> {
                new Specification{
                    AcademicYear = new Reference("1617", "2016-2017"),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<PolicySpecification>()
                },
                new Specification{
                    AcademicYear = new Reference("1718", "2017-2018"),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<PolicySpecification>()
                },
                new Specification{
                    AcademicYear = new Reference("1819", "2018-2019"),
                    FundingStream = new Reference(),
                    Description = "test",
                    Policies = new List<PolicySpecification>{
                        new PolicySpecification
                        {
                            Name = "test name",
                            Id = Guid.NewGuid().ToString(),
                            Description = "test",
                            Calculations = new List<CalculationSpecification>(),
                            SubPolicies = new List<PolicySpecification>()
                        }
                    }
                }
            };

            var response = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specs);

            return Task.FromResult(response);
        }

        public Task<HttpStatusCode> PostProduct(string specificationId, Product product)
        {
            throw new NotImplementedException();
        }

        public Task<HttpStatusCode> PostSpecification(Specification specification)
        {
            throw new NotImplementedException();
        }
    }
}
