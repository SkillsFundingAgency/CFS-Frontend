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
                new Reference("1819", "2018/19"),
                new Reference("1718", "2017/18"),
                new Reference("1617", "2016/17")
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
            throw new NotImplementedException();
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications(string academicYearId)
        {
            var specs = new[] {
                new Specification{
                    Name = "Test Spec 1",
                    Id = Guid.NewGuid().ToString(),
                    AcademicYear = new Reference("1617", "2016-2017"),
                    FundingStream = new Reference(),
                    Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                    Policies = new List<PolicySpecification>()
                },
                new Specification{
                    Name = "Test Spec 2",
                    Id = Guid.NewGuid().ToString(),
                    AcademicYear = new Reference("1718", "2017-2018"),
                    FundingStream = new Reference(),
                    Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                    Policies = new List<PolicySpecification>()
                },
                new Specification{
                    Name = "Test Spec 3",
                    Id = Guid.NewGuid().ToString(),
                    AcademicYear = new Reference("1819", "2018-2019"),
                    FundingStream = new Reference(),
                    Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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

            var response = new ApiResponse<List<Specification>>(HttpStatusCode.OK, specs.Where(m => m.AcademicYear.Id == academicYearId).ToList());

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
