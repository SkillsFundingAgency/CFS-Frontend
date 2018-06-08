using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ViewFundingModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;

        public IEnumerable<SelectListItem> Specifications { get; set; }

        public PageBannerOperation PageBannerOperation { get; set; }

        public IEnumerable<PublishedProviderResultViewModel> Results { get; set; }

        public ViewFundingModel(ISpecsApiClient specsApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsApiClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Task<ApiResponse<IEnumerable<SpecificationSummary>>> specificationsLookupTask = _specsClient.GetSpecificationsSelectedForFunding();

            await TaskHelper.WhenAllAndThrow(specificationsLookupTask);

            IActionResult errorResult = specificationsLookupTask.Result.IsSuccessOrReturnFailureResult("Specifications");
            if (errorResult != null)
            {
                return errorResult;
            }

            Specifications = specificationsLookupTask.Result.Content.Select(s => new SelectListItem()
            {
                Text = s.Name,
                Value = s.Id,
                Selected = specificationId == s.Id,
            });

            if (!string.IsNullOrWhiteSpace(specificationId))
            {
                GenerateSampleRecords();
            }

            return Page();
        }

        private void GenerateSampleRecords()
        {
            List<PublishedProviderResultViewModel> results = new List<PublishedProviderResultViewModel>();

            results.Add(new PublishedProviderResultViewModel()
            {
                ProviderId = "p1",
                ProviderName = "Provider one",
                Ukprn = "1235",
                FundingStreamResults = new List<PublishedFundingStreamResultViewModel>()
                {
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs1",
                        FundingStreamName = "Funding Stream 1",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al1", "Allocation Line 1"),
                            GenerateAllocationLine("al2", "Allocation Line 2", 653),
                            GenerateAllocationLine("al3", "Allocation Line 3", 72269, AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al4", "Allocation Line 4", 60000, AllocationLineStatusViewModel.Published,DateTimeOffset.Now),
                            GenerateAllocationLine("al5", "Allocation Line 5", 722, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),

                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs2",
                        FundingStreamName = "Funding Stream 2",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al6", "Allocation Line 6", 2000),
                            GenerateAllocationLine("al7", "Allocation Line 7", 23424),
                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs3",
                        FundingStreamName = "Funding Stream 3",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al8", "Allocation Line 8", 5, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 02, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al9", "Allocation Line 9", 60, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 02, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                        }
                    }
                }
            });


            results.Add(new PublishedProviderResultViewModel()
            {
                ProviderId = "p2",
                ProviderName = "Provider two",
                Ukprn = "1232",
                FundingStreamResults = new List<PublishedFundingStreamResultViewModel>()
                {
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs1",
                        FundingStreamName = "Funding Stream 1",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al1", "Allocation Line 1", 1, AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al2", "Allocation Line 2", 2,AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al3", "Allocation Line 3", 52, AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al4", "Allocation Line 4", 77, AllocationLineStatusViewModel.Approved ,DateTimeOffset.Now),
                            GenerateAllocationLine("al5", "Allocation Line 5", 25, AllocationLineStatusViewModel.Approved, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),

                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs2",
                        FundingStreamName = "Funding Stream 2",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al6", "Allocation Line 6", 23423, AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al7", "Allocation Line 7", 2345, AllocationLineStatusViewModel.Approved),
                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs3",
                        FundingStreamName = "Funding Stream 3",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al8", "Allocation Line 8", 55, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al9", "Allocation Line 9", 6063, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                        }
                    }
                }
            });

            results.Add(new PublishedProviderResultViewModel()
            {
                ProviderId = "p3",
                ProviderName = "Provider three",
                Ukprn = "1233",
                FundingStreamResults = new List<PublishedFundingStreamResultViewModel>()
                {
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs1",
                        FundingStreamName = "Funding Stream 1",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al1", "Allocation Line 1"),
                            GenerateAllocationLine("al2", "Allocation Line 2", 732),
                            GenerateAllocationLine("al3", "Allocation Line 3", 2436, AllocationLineStatusViewModel.Approved),
                            GenerateAllocationLine("al4", "Allocation Line 4", 552, AllocationLineStatusViewModel.Published,DateTimeOffset.Now),
                            GenerateAllocationLine("al5", "Allocation Line 5", 78325, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),

                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs2",
                        FundingStreamName = "Funding Stream 2",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al6", "Allocation Line 6", 1),
                            GenerateAllocationLine("al7", "Allocation Line 7", 0),
                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs3",
                        FundingStreamName = "Funding Stream 3",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al8", "Allocation Line 8", 0, AllocationLineStatusViewModel.Approved, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al9", "Allocation Line 9", 32463, AllocationLineStatusViewModel.Approved, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                        }
                    }
                }
            });

            results.Add(new PublishedProviderResultViewModel()
            {
                ProviderId = "p4",
                ProviderName = "Provider four",
                Ukprn = "1234",
                FundingStreamResults = new List<PublishedFundingStreamResultViewModel>()
                {
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs1",
                        FundingStreamName = "Funding Stream 1",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al1", "Allocation Line 1", 2352, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 05, 25, 8, 13, 0, 2, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al2", "Allocation Line 2", 653, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 05, 25, 8, 13, 0, 2, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al3", "Allocation Line 3", 72269, AllocationLineStatusViewModel.Approved, new DateTimeOffset(2018, 05, 25, 8, 13, 0, 2, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al4", "Allocation Line 4", 60000, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 05, 25, 8, 13, 0, 2, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al5", "Allocation Line 5", 722, AllocationLineStatusViewModel.Published, new DateTimeOffset(2018, 05, 25, 8, 13, 0, 2, TimeSpan.FromMinutes(60))),

                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs2",
                        FundingStreamName = "Funding Stream 2",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al6", "Allocation Line 6", 2000),
                            GenerateAllocationLine("al7", "Allocation Line 7", 23424),
                        }
                    },
                    new PublishedFundingStreamResultViewModel()
                    {
                        FundingStreamId ="fs3",
                        FundingStreamName = "Funding Stream 3",
                        AllocationLineResults = new List<PublishedAllocationLineResultViewModel>()
                        {
                            GenerateAllocationLine("al8", "Allocation Line 8", 5, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                            GenerateAllocationLine("al9", "Allocation Line 9", 60, AllocationLineStatusViewModel.Held, new DateTimeOffset(2018, 04, 08, 8, 16, 2, 0, TimeSpan.FromMinutes(60))),
                        }
                    }
                }
            });

            foreach (PublishedProviderResultViewModel provider in results)
            {
                foreach (PublishedFundingStreamResultViewModel fundingStream in provider.FundingStreamResults)
                {
                    foreach (PublishedAllocationLineResultViewModel allocationLine in fundingStream.AllocationLineResults)
                    {
                        fundingStream.FundingAmount += allocationLine.FundingAmount;
                        fundingStream.TotalAllocationLines++;
                        if (allocationLine.LastUpdated > fundingStream.LastUpdated)
                        {
                            fundingStream.LastUpdated = allocationLine.LastUpdated;
                        }

                        switch (allocationLine.Status)
                        {
                            case AllocationLineStatusViewModel.Approved:
                                fundingStream.NumberApproved++;
                                break;
                            case AllocationLineStatusViewModel.Held:
                                fundingStream.NumberHeld++;
                                break;
                            case AllocationLineStatusViewModel.Published:
                                fundingStream.NumberPublished++;
                                break;
                        }
                    }

                    provider.FundingAmount += fundingStream.FundingAmount;
                    provider.NumberHeld += fundingStream.NumberHeld;
                    provider.NumberApproved += fundingStream.NumberApproved;
                    provider.NumberPublished += fundingStream.NumberPublished;
                    provider.TotalAllocationLines += fundingStream.TotalAllocationLines;

                    if (fundingStream.LastUpdated > provider.LastUpdated)
                    {
                        provider.LastUpdated = fundingStream.LastUpdated;
                    }
                }
            }

            Results = results;
        }

        private PublishedAllocationLineResultViewModel GenerateAllocationLine(string allocationLineId, string allocationLineName, decimal fundingAmount = 0, AllocationLineStatusViewModel status = AllocationLineStatusViewModel.Held, DateTimeOffset? date = null)
        {
            return new PublishedAllocationLineResultViewModel()
            {
                AllocationLineId = allocationLineId,
                AllocationLineName = allocationLineName,
                Status = status,
                FundingAmount = fundingAmount,
                LastUpdated = date ?? new DateTimeOffset(2018, 06, 08, 4, 5, 2, 0, TimeSpan.FromMinutes(60)),
            };
        }
    }
}