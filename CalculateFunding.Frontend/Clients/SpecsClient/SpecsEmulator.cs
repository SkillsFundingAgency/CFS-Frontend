namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;

    public class SpecsEmulator : ISpecsApiClient
    {
        public Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetAcademicYears()
        {
            IEnumerable<Reference> academicYears = new[] { new Reference("1617", "2016-2017"), new Reference("1718", "2017-2018"), new Reference("1819", "2018-2019") };
             ApiResponse<IEnumerable<Reference>> yearsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, academicYears.ToArray());
            return Task.FromResult(yearsResponse);
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetAllocationLines()
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetFundingStreams()
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Product>> GetProduct(string specificationId, string productId)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            Specification expectedSpecification = new Specification
            {
                AcademicYear = new Reference("2018", "17-18"),

                FundingStream = new Reference("2018", "18-19"),

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

           // var response = new HttpResponseMessage(HttpStatusCode.OK);
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, expectedSpecification);

            return Task.FromResult(specificationResponse);
      }

        public Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications()
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications(string academicYearId)
        {
            Specification expectedSpecification = new Specification
            {
                AcademicYear = new Reference("2018", "17-18"),

                FundingStream = new Reference("2018", "18-19"),

                Description = "Test Spec",

                Id = "1",

                Name = "APT Final Baselines current year"
            };

            List<Specification> listSpec = new List<Specification> { expectedSpecification };

            ApiResponse<IEnumerable<Specification>> specificationResponse = new ApiResponse<IEnumerable<Specification>>(HttpStatusCode.OK, listSpec);

            return Task.FromResult(specificationResponse);
        }

        public Task<ApiResponse<Calculation>> PostCalculation(CreateCalculationModel calculation)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<Policy>> PostPolicy(CreatePolicyModel policy)
        {
            throw new NotImplementedException();
        }

        public Task<HttpStatusCode> PostProduct(string specificationId, Product product)
        {
            throw new NotImplementedException();
        }

        public Task<HttpStatusCode> PostSpecification(CreateSpecificationModel specification)
        {
            throw new NotImplementedException();
        }
    }
}
