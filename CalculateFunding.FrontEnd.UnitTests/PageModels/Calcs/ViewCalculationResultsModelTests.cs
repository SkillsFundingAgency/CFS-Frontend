using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Pages.Results;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Calcs
{
    [TestClass]
    public class ViewCalculationResultsModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_GivenNoPageNumber_CallsSearch()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = CreateCalculationSearchResultViewModel();

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);

            //Act
            IActionResult result = await pageModel.OnGetAsync(null, "");

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == null &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == ""
                        ));

            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenageNumber_CallsSearchWithCorrentPageNumber()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = CreateCalculationSearchResultViewModel();

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);

            //Act
            IActionResult result = await pageModel.OnGetAsync(2, "");

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == 2 &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == ""
                        ));

            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenNullResultsReturned_ReturnsInternalServerError()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = null;

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);

            //Act
            IActionResult result = await pageModel.OnGetAsync(null, "");

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == null &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == ""
                        ));

            result
                .Should()
                .BeOfType<InternalServerErrorResult>();

            pageModel
                .SearchTerm
                .Should()
                .BeNullOrWhiteSpace();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSearchTerm_CallsSearchSetsSearchTerm()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = CreateCalculationSearchResultViewModel();

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);

            //Act
            IActionResult result = await pageModel.OnGetAsync(null, "term");

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == null &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == "term"
                        ));

            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
               .SearchTerm
               .Should()
               .Be("term");
        }

        [TestMethod]
        public async Task OnPostAsync_GivenNoPageNumber_CallsSearch()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = CreateCalculationSearchResultViewModel();

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);
            pageModel.SearchTerm = "term";

            //Act
            IActionResult result = await pageModel.OnPostAsync(null);

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == null &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == "term"
                        ));

            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenageNumber_CallsSearchWithCorrentPageNumber()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = CreateCalculationSearchResultViewModel();

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);
            pageModel.SearchTerm = "term";

            //Act
            IActionResult result = await pageModel.OnPostAsync(2);

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == 2 &&
                            m.IncludeFacets == false &&
                            m.SearchTerm == "term"
                        ));

            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenNullResultsReturned_ReturnsInternalServerError()
        {
            //Arrange
            CalculationSearchResultViewModel viewModel = null;

            ICalculationSearchService searchService = CreateCalculationService();
            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(viewModel);

            ViewCalculationResultsModel pageModel = CreatePageModel(searchService);

            //Act
            IActionResult result = await pageModel.OnPostAsync(null);

            //Assert
            await
                searchService
                    .Received(1)
                    .PerformSearch(Arg.Is<SearchRequestViewModel>(
                            m => m.PageNumber == null &&
                            m.IncludeFacets == false
                        ));

            result
                .Should()
                .BeOfType<InternalServerErrorResult>();
        }

        static ViewCalculationResultsModel CreatePageModel(ICalculationSearchService searchService = null)
        {
            return new ViewCalculationResultsModel(
                searchService ?? CreateCalculationService());
        }

        static ICalculationSearchService CreateCalculationService()
        {
            return Substitute.For<ICalculationSearchService>();
        }

        static CalculationSearchResultViewModel CreateCalculationSearchResultViewModel()
        {
            return new CalculationSearchResultViewModel();
        }
    }
}
