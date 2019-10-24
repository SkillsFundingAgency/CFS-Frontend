using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
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

			IEnumerable<DatasetVersionIndex> datasetVersionModels = new List<DatasetVersionIndex>()
			{
				new DatasetVersionIndex()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 20, 1, 1, 1));

			IMapper mapper = Substitute.For<IMapper>();
			mapper.Map<DatasetVersionSearchResultModel>(datasetVersionModels.First())
				.Returns(new DatasetVersionSearchResultModel());
			
			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService, mapper);

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

			mapper
				.Received(1)
				.Map<DatasetVersionSearchResultModel>(datasetVersionModels.First());

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

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService, Substitute.For<IMapper>());

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

			IEnumerable<DatasetVersionIndex> datasetVersionModels = new List<DatasetVersionIndex>()
			{
				new DatasetVersionIndex()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(Enumerable.Empty<DatasetVersionIndex>(), 20, 1, 1, 1));

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService, Substitute.For<IMapper>());

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

			IEnumerable<DatasetVersionIndex> datasetVersionModels = new List<DatasetVersionIndex>()
			{
				new DatasetVersionIndex()
			};

			IDatasetSearchService mockDatasetSearchService = Substitute.For<IDatasetSearchService>();
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 20))
				.Returns(new DatasetVersionSearchResultViewModel(Enumerable.Empty<DatasetVersionIndex>(), 1, 1, 1, 20));
			mockDatasetSearchService
				.PerformSearchDatasetVersion(Arg.Is<SearchRequestViewModel>(sr => sr.PageSize == 1))
				.Returns(new DatasetVersionSearchResultViewModel(datasetVersionModels, 20, 1, 1, 1));

			DatasetHistoryModel datasetHistoryModel = new DatasetHistoryModel(mockDatasetSearchService, Substitute.For<IMapper>());

			// Act
			IActionResult result = await datasetHistoryModel.OnGetAsync(datasetidvalue, 1, 20);

			// Assert
			result.Should().BeOfType<InternalServerErrorResult>();
		}
	}
}
