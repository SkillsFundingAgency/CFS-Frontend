using System;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ProviderSearchController_SearchProviderResultsForCalculation_UnitTests
    {
	    private ProviderSearchController _sut;
	    private Mock<IProviderSearchService> _mockProviderSearchService;
        Mock<ICalculationProviderResultsSearchService> _mockCalculationProviderResultsSearchService;

	    [TestInitialize]
	    public void Initialize()
	    {
            _mockProviderSearchService = new Mock<IProviderSearchService>();
            _mockCalculationProviderResultsSearchService = new Mock<ICalculationProviderResultsSearchService>();

            _mockCalculationProviderResultsSearchService.Setup(x => x.PerformSearch(It.IsAny<SearchRequestViewModel>()))
	            .ReturnsAsync(Builder<CalculationProviderResultSearchResultViewModel>.CreateNew().Build);

            _mockProviderSearchService.Setup(x => x.PerformSearch(It.IsAny<SearchRequestViewModel>()))
	            .ReturnsAsync(() => Builder<ProviderSearchResultViewModel>.CreateNew().Build());

            _sut = new ProviderSearchController(_mockProviderSearchService.Object, _mockCalculationProviderResultsSearchService.Object);
	    }

	    [TestMethod]
	    public async Task Should_SearchProviderResultsForCalculation_ValidViewModel_Success()
	    {
		    CalculationProviderSearchRequestViewModel data = Builder<CalculationProviderSearchRequestViewModel>.CreateNew().With(x => x.CalculationValueType = "Number").Build();
		    
		    IActionResult actual = await _sut.SearchProviderResultsForCalculation(data);

		    actual.Should().BeOfType<OkObjectResult>();

	    }
    }
}
