import { Server } from "miragejs";

import { makeServer } from "../../../../src/mirage";

context("Funding management approvals results page", () => {
    let server: Server;

    const fundingStreamId = "PSG";
    const fundingPeriodId = "AY-2021";
    const specificationId = "7fd0f041-b4b2-40a8-a13b-3f3645722f42";

    before(() => setup());

    function setup(){
        server?.shutdown();
        server = makeServer({ environment: "test" });

server.get(`specs/specification-summary-by-id/${specificationId}`, () =>{
    return {
        "providerSource":"CFS",
        "fundingPeriod":{
            "id":"AY-2021",
            "name":"Schools Academic Year 2020-21"
        },
        "fundingStreams":[
            {
                "id":"PSG",
                "name":"PE and Sport Premium Grant"
            }
        ],
        "providerVersionId":"psg-2020-10-05",
        "providerSnapshotId":null,
        "description":"Test ",
        "isSelectedForFunding":true,
        "lastEditedDate":"2020-10-08T11:51:07.9890055+01:00",
        "approvalStatus":"Approved",
        "forceUpdateOnNextRefresh":null,
        "templateIds":{
            "PSG":"1.0"
        },
        "dataDefinitionRelationshipIds":[
            "4eae528d-5df6-4556-af48-260acdd161c3"
        ],
        "coreProviderVersionUpdates":"Manual",
        "id":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
        "name":"George Test 08102020v1"
    }
})

        server.get(`/policy/configuration/${fundingStreamId}/${fundingPeriodId}`, () =>{
            return {
                "organisationGroupings":[
                    {
                        "groupTypeIdentifier":"UKPRN",
                        "groupingReason":0,
                        "groupTypeClassification":"LegalEntity",
                        "organisationGroupTypeCode":"LocalAuthority",
                        "providerTypeMatch":[
                            {
                                "providerType":"Local authority maintained schools",
                                "providerSubtype":"Community school"
                            },
                            {
                                "providerType":"Local authority maintained schools",
                                "providerSubtype":"Foundation school"
                            },
                            {
                                "providerType":"Local authority maintained schools",
                                "providerSubtype":"Pupil referral unit"
                            },
                            {
                                "providerType":"Local authority maintained schools",
                                "providerSubtype":"Voluntary aided school"
                            },
                            {
                                "providerType":"Local authority maintained schools",
                                "providerSubtype":"Voluntary controlled school"
                            },
                            {
                                "providerType":"Special schools",
                                "providerSubtype":"Community special school"
                            },
                            {
                                "providerType":"Special schools",
                                "providerSubtype":"Foundation special school"
                            }
                        ],
                        "providerStatus":null
                    },
                    {
                        "groupTypeIdentifier":"UKPRN",
                        "groupingReason":0,
                        "groupTypeClassification":"LegalEntity",
                        "organisationGroupTypeCode":"AcademyTrust",
                        "providerTypeMatch":[
                            {
                                "providerType":"Free Schools",
                                "providerSubtype":"Free schools"
                            },
                            {
                                "providerType":"Free Schools",
                                "providerSubtype":"Free schools alternative provision"
                            },
                            {
                                "providerType":"Free Schools",
                                "providerSubtype":"Free schools special"
                            },
                            {
                                "providerType":"Free Schools",
                                "providerSubtype":"Free schools 16 to 19"
                            },
                            {
                                "providerType":"Independent schools",
                                "providerSubtype":"City technology college"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy alternative provision converter"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy alternative provision sponsor led"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy converter"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy special converter"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy special sponsor led"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy sponsor led"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy 16 to 19 sponsor led"
                            },
                            {
                                "providerType":"Academies",
                                "providerSubtype":"Academy 16-19 converter"
                            }
                        ],
                        "providerStatus":null
                    },
                    {
                        "groupTypeIdentifier":"UKPRN",
                        "groupingReason":1,
                        "groupTypeClassification":"LegalEntity",
                        "organisationGroupTypeCode":"Provider",
                        "providerTypeMatch":[
                            {
                                "providerType":"Special schools",
                                "providerSubtype":"Non-maintained special school"
                            }
                        ],
                        "providerStatus":null
                    },
                    {
                        "groupTypeIdentifier":"LACode",
                        "groupingReason":1,
                        "groupTypeClassification":"GeographicalBoundary",
                        "organisationGroupTypeCode":"LocalAuthority",
                        "providerTypeMatch":[

                        ],
                        "providerStatus":null
                    }
                ],
                "id":"config-PSG-AY-2021",
                "fundingStreamId":"PSG",
                "fundingPeriodId":"AY-2021",
                "defaultTemplateVersion":null,
                "variations":[
                    {
                        "name":"TemplateUpdated",
                        "order":0,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"FundingSchemaUpdated",
                        "order":1,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"ProviderMetadata",
                        "order":2,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"Closure",
                        "order":3,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"ClosureWithSuccessor",
                        "order":4,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"FundingUpdated",
                        "order":5,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"ProfilingUpdated",
                        "order":6,
                        "fundingLineCodes":null
                    },
                    {
                        "name":"PupilNumberSuccessor",
                        "order":7,
                        "fundingLineCodes":null
                    }
                ],
                "errorDetectors":[
                    "TrustIdMismatchErrorDetector",
                    "FundingLineValueProfileMismatchErrorDetector",
                    "PostPaymentOutOfScopeProviderErrorDetector",
                    "MultipleSuccessorErrorDetector",
                    "ProviderNotFundedErrorDetector"
                ],
                "approvalMode":"All",
                "providerSource":"CFS",
                "paymentOrganisationSource":"PaymentOrganisationAsProvider",
                "updateCoreProviderVersion":"Manual",
                "enableUserEditableCustomProfiles":false,
                "enableUserEditableRuleBasedProfiles":false,
                "runCalculationEngineAfterCoreProviderUpdate":false,
                "enableConverterDataMerge":false,
                "successorCheck":true,
                "indicativeOpenerProviderStatus":[

                ],
                "allowedPublishedFundingStreamsIdsToReference":[

                ],
                "releaseManagementVariations":[

                ],
                "releaseChannels":[

                ],
                "releaseActionGroups":[

                ]
            };
        });

        server.post("/publishedProviders/search", () =>{
            return {
                "providers":[
                    {
                        "publishedProviderVersionId":"PSG-AY-2021-10056716",
                        "providerType":"Academies",
                        "providerSubType":"Academy alternative provision converter",
                        "localAuthority":"Plymouth",
                        "fundingStatus":"Approved",
                        "providerName":"ACE Schools Plymouth",
                        "ukprn":"10056716",
                        "upin":"",
                        "urn":"142835",
                        "fundingValue":2000.0,
                        "specificationId":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                        "fundingStreamId":"PSG",
                        "fundingPeriodId":"AY-2021",
                        "indicative":"Hide indicative allocations",
                        "isIndicative":false,
                        "hasErrors":false,
                        "errors":[

                        ],
                        "majorVersion":null,
                        "minorVersion":null
                    },
                    {
                        "publishedProviderVersionId":"PSG-AY-2021-10076778",
                        "providerType":"Local authority maintained schools",
                        "providerSubType":"Voluntary controlled school",
                        "localAuthority":"Somerset",
                        "fundingStatus":"Approved",
                        "providerName":"Abbas and Templecombe Church of England Primary School",
                        "ukprn":"10076778",
                        "upin":"",
                        "urn":"123775",
                        "fundingValue":2000.0,
                        "specificationId":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                        "fundingStreamId":"PSG",
                        "fundingPeriodId":"AY-2021",
                        "indicative":"Hide indicative allocations",
                        "isIndicative":false,
                        "hasErrors":false,
                        "errors":[

                        ],
                        "majorVersion":null,
                        "minorVersion":null
                    }
                ],
                "filteredFundingAmount":10000.0,
                "canPublish":false,
                "canApprove":false,
                "totalFundingAmount":0.0,
                "totalProvidersToApprove":0,
                "totalProvidersToPublish":0,
                "totalErrorResults":0,
                "totalResults":5,
                "currentPage":1,
                "startItemNumber":1,
                "endItemNumber":5,
                "pagerState":{
                    "displayNumberOfPages":4,
                    "previousPage":null,
                    "nextPage":null,
                    "lastPage":1,
                    "pages":[
                        1
                    ],
                    "currentPage":1
                },
                "facets":[
                    {
                        "name":"providerType",
                        "facetValues":[
                            {
                                "name":"Academies",
                                "count":3
                            },
                            {
                                "name":"Local authority maintained schools",
                                "count":2
                            }
                        ]
                    },
                    {
                        "name":"providerSubType",
                        "facetValues":[
                            {
                                "name":"Academy converter",
                                "count":2
                            },
                            {
                                "name":"Academy alternative provision converter",
                                "count":1
                            },
                            {
                                "name":"Community school",
                                "count":1
                            },
                            {
                                "name":"Voluntary controlled school",
                                "count":1
                            }
                        ]
                    },
                    {
                        "name":"localAuthority",
                        "facetValues":[
                            {
                                "name":"Essex",
                                "count":1
                            },
                            {
                                "name":"Leicestershire",
                                "count":1
                            },
                            {
                                "name":"Plymouth",
                                "count":1
                            },
                            {
                                "name":"Somerset",
                                "count":1
                            },
                            {
                                "name":"Wandsworth",
                                "count":1
                            }
                        ]
                    },
                    {
                        "name":"fundingStatus",
                        "facetValues":[
                            {
                                "name":"Approved",
                                "count":5
                            }
                        ]
                    },
                    {
                        "name":"indicative",
                        "facetValues":[
                            {
                                "name":"Hide indicative allocations",
                                "count":5
                            }
                        ]
                    },
                    {
                        "name":"monthYearOpened",
                        "facetValues":[
                            {
                                "name":"Any other",
                                "count":5
                            }
                        ]
                    },
                    {
                        "name":"hasErrors",
                        "facetValues":[
                            {
                                "name":"False",
                                "count":5
                            }
                        ]
                    }
                ]
            };
        })

        server.post("/publishedProviders/search/ids", () =>{
            return [
                "PSG-AY-2021-10080904",
                "PSG-AY-2021-10076778",
                "PSG-AY-2021-10074189",
                "PSG-AY-2021-10056716",
                "PSG-AY-2021-10045668"
            ];
        })

        server.get("/jobs/latest-success/*/RefreshFundingJob", () =>{
            return {
                "jobId":"d7c82c6a-9436-469f-a9ad-f25d85a187d1",
                "jobType":"RefreshFundingJob",
                "specificationId":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                "entityId":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                "runningStatus":"Completed",
                "completionStatus":"Succeeded",
                "invokerUserId":"testid",
                "invokerUserDisplayName":"testuser",
                "parentJobId":null,
                "lastUpdated":"2021-05-04T13:38:01.6936124+01:00",
                "created":"2021-05-04T13:37:43.2145278+01:00",
                "itemCount":null,
                "overallItemsProcessed":null,
                "overallItemsSucceeded":null,
                "overallItemsFailed":null,
                "supersededByJobId":null,
                "outcome":null,
                "outcomes":[

                ],
                "outcomeType":null,
                "trigger":{
                    "message":"Requesting publication of specification",
                    "entityId":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                    "entityType":"Specification"
                }
            };
        })
        server.get(`/specs/${specificationId}/provider-errors`, () =>{
            return [];
        })

        cy.visit(`/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`);
    }

    describe("when page has loaded ", () => {

        it("has the correct breadcrumbs", () => {
            cy.get("#breadcrumbs").findByRole("link", {
                name: /Calculate funding/
            }).should("exist");

            cy.get("#breadcrumbs").findByRole("link", {
                name: /Funding management/
            }).should("exist");

            cy.get("#breadcrumbs").findByRole("link", {
                name: /Funding approvals/
            }).should("exist");

            cy.get("#breadcrumbs").findByText(/PE and Sport Premium Grant/).should("exist");

        });

         it("has correct title", () => {
             cy.findByRole("heading", { name: /George Test 08102020v1/, level: 1 }).should(
                 "exist"
             );
        });
        it("has correct subtitle", () => {
            cy.findByRole("heading", {
                name: /PE and Sport Premium Grant for Schools Academic Year 2020-21/,
                level: 2
            }).should(
                "exist"
            );
        });

        it("has link to Manage specification", () => {
            cy.findAllByRole("link", { name: /Manage specification/ }).should("exist");
        });

        it("has correct text below link to Specification reports", () => {
            cy.findByText(/Specification reports/).should("exist");
        });

        it("has link to Approve batch of providers", () => {
            cy.findAllByRole("link", { name: /Approve batch of providers/ }).should("exist");
        });

        it("has link to Release management", () => {
            cy.findAllByRole("link", { name: /Release management/ }).should("exist");
        });

        it("has link to Release management", () => {
            cy.findAllByRole("button", { name: /Refresh funding/ }).should("exist");
        });

        it("has last refresh date on page", () => {
            cy.findByText(/Last refresh/i).should("exist");
        });
    });

});
