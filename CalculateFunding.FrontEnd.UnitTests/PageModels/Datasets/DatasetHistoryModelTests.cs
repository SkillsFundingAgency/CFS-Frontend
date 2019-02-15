using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Pages.Datasets;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Datasets
{
	[TestClass]
	public class DatasetHistoryModelTests
	{
		[TestMethod]
		public async Task OnGetAsync_GivenSearchIsOk_ShouldReturnPageResult()
		{
			// Arrange
			const int pageSize = 20;
			const string datasetidvalue = "datasetIdValue";
			SearchRequestViewModel expectedSearchRequest = new SearchRequestViewModel()
			{
				PageSize = pageSize,
				PageNumber = 1,
				Filters = new Dictionary<string, string[]>() {{"datasetId", new[] {datasetidvalue}}},
				IncludeFacets = false,
				FacetCount = 0,
				SearchTerm = null
			};

			IEnumerable<DatasetVersionSearchResultModel> datasetVersionModels = new List<DatasetVersionSearchResultModel>()
			{
				new DatasetVersionSearchResultModel()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 20, 1, 1, 1));

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService);

			// Act
			IActionResult result = await datasetHistoryModel.OnGetAsync(datasetidvalue, 1, 20);

			// Assert
			result.Should().BeOfType<PageResult>();

			datasetHistoryModel
				.Current
				.Should().NotBeNull();

			datasetHistoryModel
				.DatasetSearchResultViewModel
				.Should().NotBeNull();

			datasetHistoryModel
				.DatasetId
				.Should().Be(datasetidvalue);
		}

		[TestMethod]
		public async Task OnGetAsync_GivenSearchReturnsNull_ShouldReturnInternalServerError()
		{
			// Arrange
			const int pageSize = 20;
			const string datasetidvalue = "datasetIdValue";
			SearchRequestViewModel expectedSearchRequest = new SearchRequestViewModel()
			{
				PageSize = pageSize,
				PageNumber = 1,
				Filters = new Dictionary<string, string[]>() { { "datasetId", new[] { datasetidvalue } } },
				IncludeFacets = false,
				FacetCount = 0,
				SearchTerm = null
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns((DatasetVersionSearchResultViewModel)null);
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns((DatasetVersionSearchResultViewModel)null);

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService);

			// Act
			IActionResult result = await datasetHistoryModel.OnGetAsync(datasetidvalue, 1, 20);

			// Assert
			result.Should().BeOfType<InternalServerErrorResult>();
		}

		[TestMethod]
		public async Task OnGetAsync_GivenSearchReturnsEmptyListForCurrentVersion_ShouldReturnInternalServerError()
		{
			// Arrange
			const int pageSize = 20;
			const string datasetidvalue = "datasetIdValue";
			SearchRequestViewModel expectedSearchRequest = new SearchRequestViewModel()
			{
				PageSize = pageSize,
				PageNumber = 1,
				Filters = new Dictionary<string, string[]>() { { "datasetId", new[] { datasetidvalue } } },
				IncludeFacets = false,
				FacetCount = 0,
				SearchTerm = null
			};

			IEnumerable<DatasetVersionSearchResultModel> datasetVersionModels = new List<DatasetVersionSearchResultModel>()
			{
				new DatasetVersionSearchResultModel()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(Enumerable.Empty<DatasetVersionSearchResultModel>(), 20, 1, 1, 1));

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService);

			// Act
			IActionResult result = await datasetHistoryModel.OnGetAsync(datasetidvalue, 1, 20);

			// Assert
			result.Should().BeOfType<InternalServerErrorResult>();
		}

		[TestMethod]
		public async Task OnGetAsync_GivenSearchReturnsEmptyListForAllVersions_ShouldReturnInternalServerError()
		{
			// Arrange
			const int pageSize = 20;
			const string datasetidvalue = "datasetIdValue";
			SearchRequestViewModel expectedSearchRequest = new SearchRequestViewModel()
			{
				PageSize = pageSize,
				PageNumber = 1,
				Filters = new Dictionary<string, string[]>() { { "datasetId", new[] { datasetidvalue } } },
				IncludeFacets = false,
				FacetCount = 0,
				SearchTerm = null
			};

			IEnumerable<DatasetVersionSearchResultModel> datasetVersionModels = new List<DatasetVersionSearchResultModel>()
			{
				new DatasetVersionSearchResultModel()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(Enumerable.Empty<DatasetVersionSearchResultModel>(), 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 20, 1, 1, 1));

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService);

			// Act
			IActionResult result = await datasetHistoryModel.OnGetAsync(datasetidvalue, 1, 20);

			// Assert
			result.Should().BeOfType<InternalServerErrorResult>();
		}
	}
}
