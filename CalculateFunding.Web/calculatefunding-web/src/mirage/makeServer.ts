import { createServer } from "miragejs";

import { buildEffectiveSpecificationPermission, buildPermissions } from "../tests/fakes/testFactories";
import { ApprovalMode } from "../types/ApprovalMode";
import { ProviderSource } from "../types/CoreProviderSummary";
import { DatasetMetadata, DatasetTemplateMetadata } from "../types/Datasets/DatasetMetadata";
import { ReferencedSpecificationRelationshipMetadata } from "../types/Datasets/ReferencedSpecificationRelationshipMetadata";
import { FundingConfiguration } from "../types/FundingConfiguration";
import { UpdateCoreProviderVersion } from "../types/Provider/UpdateCoreProviderVersion";
import { PublishedProviderSearchFacet } from "../types/publishedProviderSearchRequest";
import { ProviderDataTrackingMode } from "../types/Specifications/ProviderDataTrackingMode";
import { SpecificationListResultsItem } from "../types/Specifications/SpecificationListResults";
import { SpecificationSummary } from "../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../types/viewFundingTypes";

const specSummary1: SpecificationSummary = {
  id: "111",
  name: "PSG 19-20",
  fundingPeriod: { id: "say1920", name: "Schools Academic Year 2019-20" },
  fundingStreams: [{ id: "PSG", name: "PE and Sport Premium Grant" }],
  description: "lorem ipsum lalala",
  isSelectedForFunding: false,
  approvalStatus: "Draft",
  coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  dataDefinitionRelationshipIds: [],
  templateIds: { "1.1": "" },
};
const spec1: SpecificationListResultsItem = {
  id: "111",
  name: "PSG 19-20",
  fundingPeriodName: "Schools Academic Year 2019-20",
  fundingPeriodId: "say1920",
  fundingStreamNames: ["PE and Sport Premium Grant"],
  fundingStreamIds: ["PSG"],
  lastUpdatedDate: undefined,
  status: "Draft",
  description: "lorem ipsum lalala",
  isSelectedForFunding: false,
};
const spec2: SpecificationListResultsItem = {
  id: "222",
  name: "DSG 21-22",
  fundingPeriodName: "Academies Academic Year 2021-22",
  fundingPeriodId: "aay2122",
  fundingStreamNames: ["Dedicated Schools Grant"],
  fundingStreamIds: ["DSG"],
  lastUpdatedDate: undefined,
  status: "Approved",
  description: "blablabla",
  isSelectedForFunding: true,
};

export const makeServer = ({ environment = "test" }) => {
  const data = mockApiData();

  return createServer({
    environment,

    routes() {
      this.namespace = "/api";

      this.get("/specs/*", () => {
        return data.getSpecifications();
      });
      this.get("/account/IsAuthenticated", () => ({}));
      this.get("/account/hasConfirmedSkills", () => {
        return {};
      });
      this.get("/getConfirmedSkills", () => {
        return {};
      });
      this.get("/api/specification/:id/obsoleteitems", () => {
        return {};
      });
      this.get("/api/policy/configuration/:fundingStreamId/:fundingPeriodId", () => {
        return {
          fundingPeriodId: data.fundingPeriod1.id,
          fundingStreamId: data.fundingStream1.id,
          defaultTemplateVersion: "1",
          enableConverterDataMerge: true,
          providerSource: ProviderSource.CFS,
          updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
          approvalMode: ApprovalMode.All,
        } as FundingConfiguration;
      });
      this.post("/jobs/*", () => {
        return {};
      });
      this.post("/notifications/*", () => {
        return {};
      });
      this.get("/featureflags", () => {
        return [
          { name: "EnableReactQueryDevTool", isEnabled: true },
          { name: "EnableSwagger", isEnabled: true },
          { name: "ProfilingPatternVisible", isEnabled: true },
          { name: "SpecToSpec", isEnabled: true },
          { name: "TemplateBuilderVisible", isEnabled: true },
        ];
      });
      this.post("/users/*", () => {
        return {};
      });
      this.get("/users/*", (schema, request) => {
        if (request.url.includes("effectivepermissions")) {
          return buildEffectiveSpecificationPermission({
            specificationId: request.url.includes(spec1.id)
              ? spec1.id
              : request.url.includes(spec2.id)
              ? spec2.id
              : "?",
            setAllPermsEnabled: true,
          });
        } else if (request.url.includes("admin")) {
          return [
            {
              username: "Admin User",
              hasConfirmedSkills: false,
            },
          ];
        } else if (request.url.includes("search")) {
          return [
            {
              id: "user-id-111",
              name: "user 111",
              username: "Lulu Farquar",
            },
          ];
        } else if (request.url.includes("fundingstreams")) {
          return [
            buildPermissions({
              fundingStreamId: "DSG",
              fundingStreamName: "Dedicated Schools Grant",
              setAllPermsEnabled: true,
            }),
            buildPermissions({
              fundingStreamId: "PSG",
              fundingStreamName: "PE and Sport Premium Grant",
              setAllPermsEnabled: true,
            }),
          ];
        } else {
          return [];
        }
      });

      this.get("/specs/funding-selections", () =>{
        return [
          {
            "id":"DSG",
            "name":"Dedicated Schools Grant",
            "periods":[
              {
                "id":"FY-2021",
                "name":"Financial Year 2020-21",
                "specifications":[
                  {
                    "id":"4aeb22b6-50e1-48b6-9f53-613234b78a55",
                    "name":"GFT Dedicated Schools Grant"
                  }
                ]
              },
              {
                "id":"FY-2021-abd3a03e-6da7-4bd1-a5da-f9b7d2782844",
                "name":"FY-2021-abd3a03e-6da7-4bd1-a5da-f9b7d2782844 test period",
                "specifications":[
                  {
                    "id":"20fe8a25-b37d-4689-922a-12283eb5f3de",
                    "name":"VWGTBSERLO"
                  }
                ]
              },
              {
                "id":"FY-2021-fd89a2e0-c140-47f9-83bc-0672316a6d3c",
                "name":"FY-2021-fd89a2e0-c140-47f9-83bc-0672316a6d3c test period",
                "specifications":[
                  {
                    "id":"aa6380e0-d1b7-43c3-9028-62a43e2b941c",
                    "name":"VDDJWBDLQC"
                  }
                ]
              },
              {
                "id":"FY-2021-69b38817-c857-435c-a8f4-d8dc53b3055a",
                "name":"FY-2021-69b38817-c857-435c-a8f4-d8dc53b3055a test period",
                "specifications":[
                  {
                    "id":"cc1952d1-d4ef-4ee3-9494-e0b213aa37c8",
                    "name":"BMBPBGPYYU"
                  }
                ]
              },
              {
                "id":"FY-2021-c214c749-3fe4-480d-9602-ba90c11f6a29",
                "name":"FY-2021-c214c749-3fe4-480d-9602-ba90c11f6a29 test period",
                "specifications":[
                  {
                    "id":"8c2229f0-46bc-47ed-9a6a-9a6579794a09",
                    "name":"KUXLPROZUE"
                  }
                ]
              },
              {
                "id":"FY-2021-84175b74-198d-4990-b1a1-f52ffb94c282",
                "name":"FY-2021-84175b74-198d-4990-b1a1-f52ffb94c282 test period",
                "specifications":[
                  {
                    "id":"0c8a9456-b2a9-4fd3-8f1a-6c8e37b3d6f0",
                    "name":"WDPFIOZBOE"
                  }
                ]
              },
              {
                "id":"FY-2021-e72ac880-c482-40c8-a962-b8cedcb5c681",
                "name":"FY-2021-e72ac880-c482-40c8-a962-b8cedcb5c681 test period",
                "specifications":[
                  {
                    "id":"f6868f2d-5843-4d79-8f20-a49c0959efb2",
                    "name":"PCERYWZMDX"
                  }
                ]
              },
              {
                "id":"FY-2021-feede2ea-c84f-4aef-8ad4-fc52c29e28aa",
                "name":"FY-2021-feede2ea-c84f-4aef-8ad4-fc52c29e28aa test period",
                "specifications":[
                  {
                    "id":"dbd108bd-ee7b-43bf-80f7-b1ac1e08d530",
                    "name":"TYLHFAVHKX"
                  }
                ]
              },
              {
                "id":"FY-2021-a5acc967-89d1-49f5-a644-c0406f48963a",
                "name":"FY-2021-a5acc967-89d1-49f5-a644-c0406f48963a test period",
                "specifications":[
                  {
                    "id":"b329b8bf-5cdf-41f9-ab66-656672cc585e",
                    "name":"QNRUUFKZBW"
                  }
                ]
              },
              {
                "id":"FY-2021-508043da-beb8-4459-9583-6a8ffbc8d346",
                "name":"FY-2021-508043da-beb8-4459-9583-6a8ffbc8d346 test period",
                "specifications":[
                  {
                    "id":"368b9d1e-b42e-4c82-9c64-aeebc903e052",
                    "name":"IXROUOAFLE"
                  }
                ]
              },
              {
                "id":"FY-2021-f0036ddb-8db7-4148-b6cc-291f51c2349c",
                "name":"FY-2021-f0036ddb-8db7-4148-b6cc-291f51c2349c test period",
                "specifications":[
                  {
                    "id":"00448fe9-00bd-4990-935f-e423ef76d9a2",
                    "name":"DJCAYMQGCV"
                  }
                ]
              },
              {
                "id":"FY-2021-871eed20-9960-4c15-a71e-f18e6296b4ad",
                "name":"FY-2021-871eed20-9960-4c15-a71e-f18e6296b4ad test period",
                "specifications":[
                  {
                    "id":"828b64df-e90a-405d-8cbf-d62f1c7291b5",
                    "name":"ANMAAOIPAX"
                  }
                ]
              },
              {
                "id":"FY-2021-405deb0e-d9f4-48f3-87a7-f1ba73c00e3f",
                "name":"FY-2021-405deb0e-d9f4-48f3-87a7-f1ba73c00e3f test period",
                "specifications":[
                  {
                    "id":"9d9ec30b-45c3-46b7-afc7-7907ae5f0952",
                    "name":"NHOYYHQYMD"
                  }
                ]
              },
              {
                "id":"FY-2021-1a6e33f2-964c-46ba-8c98-c4dd65094c58",
                "name":"FY-2021-1a6e33f2-964c-46ba-8c98-c4dd65094c58 test period",
                "specifications":[
                  {
                    "id":"170e12f7-6552-4d39-9cc6-dbb1bed13029",
                    "name":"HDGIVCYQIW"
                  }
                ]
              },
              {
                "id":"FY-2021-1936479e-227f-4507-8e37-498bd2cfa7dd",
                "name":"FY-2021-1936479e-227f-4507-8e37-498bd2cfa7dd test period",
                "specifications":[
                  {
                    "id":"b07cd2ec-131e-44d4-8ce7-a674ef3ea0d9",
                    "name":"SRVQFIKQOO"
                  }
                ]
              },
              {
                "id":"FY-2021-e5bf97e5-6d38-46ce-bf40-02e69ea6c890",
                "name":"FY-2021-e5bf97e5-6d38-46ce-bf40-02e69ea6c890 test period",
                "specifications":[
                  {
                    "id":"d051f282-11f9-4603-bd62-a75ef42e1cb4",
                    "name":"QALUKBRLEY"
                  }
                ]
              },
              {
                "id":"FY-2021-efad2065-212a-4779-b2e8-5151d9c7dbe5",
                "name":"FY-2021-efad2065-212a-4779-b2e8-5151d9c7dbe5 test period",
                "specifications":[
                  {
                    "id":"5f473777-e740-4f92-a15f-d97d1a7c2aeb",
                    "name":"AYFXUQKWGI"
                  }
                ]
              },
              {
                "id":"FY-2021-1d76a660-2a13-475b-90bb-09292be2080b",
                "name":"FY-2021-1d76a660-2a13-475b-90bb-09292be2080b test period",
                "specifications":[
                  {
                    "id":"5d60179e-e9f5-4567-a5db-0e982081997c",
                    "name":"GXFSZEFBFZ"
                  }
                ]
              },
              {
                "id":"FY-2021-54751416-0a07-4c13-9bbc-7d22d66b560b",
                "name":"FY-2021-54751416-0a07-4c13-9bbc-7d22d66b560b test period",
                "specifications":[
                  {
                    "id":"ef4d2e96-dcc4-4d01-966c-8135294ffc18",
                    "name":"VBFYSECZNB"
                  }
                ]
              },
              {
                "id":"FY-2021-8c60c957-bc7d-4894-970a-e1c2ab8c7bd5",
                "name":"FY-2021-8c60c957-bc7d-4894-970a-e1c2ab8c7bd5 test period",
                "specifications":[
                  {
                    "id":"6b452afd-4992-4ab0-99b8-fcc85de35558",
                    "name":"ZLVXGBXMPQ"
                  }
                ]
              },
              {
                "id":"FY-2021-083423ad-b354-42ef-b14a-2349e24964f3",
                "name":"FY-2021-083423ad-b354-42ef-b14a-2349e24964f3 test period",
                "specifications":[
                  {
                    "id":"92fb96e9-1489-4be4-bc96-0025adc47f32",
                    "name":"RWIDQEOZBC"
                  }
                ]
              },
              {
                "id":"FY-2021-d4fd5692-d507-4ef1-a53c-bd65e3788f5b",
                "name":"FY-2021-d4fd5692-d507-4ef1-a53c-bd65e3788f5b test period",
                "specifications":[
                  {
                    "id":"7672ed0b-bc4b-4693-a84f-786e50ce558d",
                    "name":"LWPCKMNNGE"
                  }
                ]
              },
              {
                "id":"FY-2021-fc2cc0b3-9b49-4e3b-96c9-380894ef975d",
                "name":"FY-2021-fc2cc0b3-9b49-4e3b-96c9-380894ef975d test period",
                "specifications":[
                  {
                    "id":"2702638a-7f96-463b-97ba-96840335c50d",
                    "name":"RZJFROYMNK"
                  }
                ]
              },
              {
                "id":"FY-2021-06581720-36b7-4097-9260-a3867c6b2cca",
                "name":"FY-2021-06581720-36b7-4097-9260-a3867c6b2cca test period",
                "specifications":[
                  {
                    "id":"44229dcb-f0af-444b-a3dc-e116ec421290",
                    "name":"HRMEHWQTPQ"
                  }
                ]
              },
              {
                "id":"FY-2021-f001dd25-d557-420c-8284-13fb6c585c5f",
                "name":"FY-2021-f001dd25-d557-420c-8284-13fb6c585c5f test period",
                "specifications":[
                  {
                    "id":"8c4a7ae0-6716-48dc-815e-7a8e791aa32f",
                    "name":"FKSUSUPSOQ"
                  }
                ]
              },
              {
                "id":"FY-2021-82e77e78-c0ff-4624-9eb7-09c242d2bcbb",
                "name":"FY-2021-82e77e78-c0ff-4624-9eb7-09c242d2bcbb test period",
                "specifications":[
                  {
                    "id":"bd40d143-ab34-46d6-8365-06b01c3f77fe",
                    "name":"XSVURMKWZP"
                  }
                ]
              },
              {
                "id":"FY-2021-48295276-694f-44bd-82a1-f45828050e48",
                "name":"FY-2021-48295276-694f-44bd-82a1-f45828050e48 test period",
                "specifications":[
                  {
                    "id":"a89e9676-e04c-4abd-bf1f-6c8a8d6072c3",
                    "name":"PLOQEQTXJY"
                  }
                ]
              },
              {
                "id":"FY-2021-82b0935e-ff32-4d99-b7a7-7eaf6f3b4a98",
                "name":"FY-2021-82b0935e-ff32-4d99-b7a7-7eaf6f3b4a98 test period",
                "specifications":[
                  {
                    "id":"b596717d-e82a-4a9f-93af-b5adf47c1de3",
                    "name":"WBZJVFELNS"
                  }
                ]
              },
              {
                "id":"FY-2021-dc5b2b43-ba57-4afb-807b-bd409d24ada1",
                "name":"FY-2021-dc5b2b43-ba57-4afb-807b-bd409d24ada1 test period",
                "specifications":[
                  {
                    "id":"81033095-0fa1-43b0-91c8-5daccfb6927c",
                    "name":"ENBGGFHNXS"
                  }
                ]
              },
              {
                "id":"FY-2021-8e85540e-6bf2-4068-834d-6e942c03e502",
                "name":"FY-2021-8e85540e-6bf2-4068-834d-6e942c03e502 test period",
                "specifications":[
                  {
                    "id":"2e10cf69-955d-474b-ac46-1fbd9ee7d52f",
                    "name":"PHMFKZFQMP"
                  }
                ]
              },
              {
                "id":"FY-2021-1f0b08e6-2046-402c-a6fb-f2ae8b5d7608",
                "name":"FY-2021-1f0b08e6-2046-402c-a6fb-f2ae8b5d7608 test period",
                "specifications":[
                  {
                    "id":"75cdeb34-55d2-4cbf-b99f-99980220c22a",
                    "name":"Pete's Test Specification rteshbsrth"
                  }
                ]
              },
              {
                "id":"FY-637354122734291641",
                "name":"FY-637354122734291641 test period",
                "specifications":[
                  {
                    "id":"b9e1d05a-56a8-420d-b7a1-59e81c505c7d",
                    "name":"NQQHQIRXSB"
                  }
                ]
              },
              {
                "id":"FY-637359448512894590",
                "name":"FY-637359448512894590 test period",
                "specifications":[
                  {
                    "id":"98578e43-4f7e-42fb-aa43-a43072df9dc3",
                    "name":"ABNLRHMDNK"
                  }
                ]
              },
              {
                "id":"FY-637360151508245738",
                "name":"FY-637360151508245738 test period",
                "specifications":[
                  {
                    "id":"ceb1098d-55bb-4d69-aa83-d2f2965e7430",
                    "name":"OXYOZIJLAN"
                  }
                ]
              },
              {
                "id":"FY-637365961495279730",
                "name":"FY-637365961495279730 test period",
                "specifications":[
                  {
                    "id":"ed635c45-b3db-4332-97e0-d2487fc63c4e",
                    "name":"PHWRTRDWRZ"
                  }
                ]
              },
              {
                "id":"FY-637369417583884911",
                "name":"FY-637369417583884911 test period",
                "specifications":[
                  {
                    "id":"df9e1ebc-9c2b-4c2a-aa99-2e76e8fee1f0",
                    "name":"RSJOLKBDEQ"
                  }
                ]
              },
              {
                "id":"FY-637370281814739669",
                "name":"FY-637370281814739669 test period",
                "specifications":[
                  {
                    "id":"fb538e18-5134-4cf3-a75e-946f28050c03",
                    "name":"CVERSEHYCM"
                  }
                ]
              },
              {
                "id":"FY-637372009269084876",
                "name":"FY-637372009269084876 test period",
                "specifications":[
                  {
                    "id":"234e26cb-ab90-4f4e-ae39-0c8d599ddd2f",
                    "name":"HPDDYHHZFA"
                  }
                ]
              },
              {
                "id":"FY-637401422217151115",
                "name":"FY-637401422217151115 test period",
                "specifications":[
                  {
                    "id":"195ddc54-244d-486b-b762-c3ad09a63383",
                    "name":"HFGKYDIUIU"
                  }
                ]
              },
              {
                "id":"FY-637465628648590698",
                "name":"FY-637465628648590698 test period",
                "specifications":[
                  {
                    "id":"6e05dabd-fd3e-4773-b9c1-8573e90f42ad",
                    "name":"ETMESBQUVD"
                  }
                ]
              },
              {
                "id":"FY-637465664652667765",
                "name":"FY-637465664652667765 test period",
                "specifications":[
                  {
                    "id":"97458204-c145-4356-b8e4-cb9a06bb3f86",
                    "name":"ZTPVEYTGBC"
                  }
                ]
              },
              {
                "id":"FY-637465708834575066",
                "name":"FY-637465708834575066 test period",
                "specifications":[
                  {
                    "id":"ae7db83f-1399-488a-b385-97ffe233e51e",
                    "name":"ATEQJOMTTE"
                  }
                ]
              },
              {
                "id":"FY-637465742662660186",
                "name":"FY-637465742662660186 test period",
                "specifications":[
                  {
                    "id":"bcc5f667-4f3f-4c43-967d-55b73b9bf5ca",
                    "name":"ACOXUIWYJK"
                  }
                ]
              },
              {
                "id":"FY-637465763454400421",
                "name":"FY-637465763454400421 test period",
                "specifications":[
                  {
                    "id":"b222cd55-4ae3-472e-96b9-5842e61401da",
                    "name":"RSNAEVOMHP"
                  }
                ]
              },
              {
                "id":"FY-637465791888474139",
                "name":"FY-637465791888474139 test period",
                "specifications":[
                  {
                    "id":"268ee832-e8ac-4d8b-add7-c8034acf223b",
                    "name":"YNIINNMLEJ"
                  }
                ]
              },
              {
                "id":"86d92c0a-292f-482c-b328-1c7837f9a769",
                "name":"fe1cf817-7a65-4614-96c5-66df93a3b183",
                "specifications":[
                  {
                    "id":"e365c04d-e884-4c81-b341-e918fb98c8e6",
                    "name":"48bb58ac-e8e2-40d2-abe6-fddb434a147c"
                  }
                ]
              },
              {
                "id":"FY-637660847474833876",
                "name":"FY-637660847474833876 test period",
                "specifications":[
                  {
                    "id":"80b2fd3a-4fa0-491e-999a-21caa6f4a65b",
                    "name":"GQDLNZTPHJ"
                  }
                ]
              }
            ]
          },
          {
            "id":"PSG",
            "name":"PE and Sport Premium Grant",
            "periods":[
              {
                "id":"AY-1920",
                "name":"1920",
                "specifications":[
                  {
                    "id":"289eb3f8-b331-4a29-ad20-7209fe3560fb",
                    "name":"GFT_PE and Sport 19/20"
                  }
                ]
              },
              {
                "id":"AY-TEST5",
                "name":"Test Academic Year 5",
                "specifications":[
                  {
                    "id":"f49f998e-19a6-44e5-9b93-91de1d6d1d42",
                    "name":"Test Choose for Funding Link"
                  }
                ]
              },
              {
                "id":"AY-2021",
                "name":"Schools Academic Year 2020-21",
                "specifications":[
                  {
                    "id":"7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                    "name":"George Test 08102020v1"
                  },
                  {
                    "id":"45e8eef2-c5b8-4ec0-a034-73913dac0b8c",
                    "name":"RH Test"
                  }
                ]
              },
              {
                "id":"AY-637378058824321011",
                "name":"AY-637378058824321011 test period",
                "specifications":[
                  {
                    "id":"40b5de48-54ca-4f6b-9fcb-bf3c08628f30",
                    "name":"George Test 09102020v1"
                  }
                ]
              },
              {
                "id":"AY-637400558744263658",
                "name":"AY-637400558744263658 test period",
                "specifications":[
                  {
                    "id":"d13b58fd-91bd-4c87-9765-1a99213cda6c",
                    "name":"QIAMLQUCTG"
                  }
                ]
              },
              {
                "id":"AY-637401423504314360",
                "name":"AY-637401423504314360 test period",
                "specifications":[
                  {
                    "id":"9f58648e-46ea-4535-98fa-cd854781933b",
                    "name":"CQXMQXIWOR"
                  }
                ]
              },
              {
                "id":"AY-637402287610232202",
                "name":"AY-637402287610232202 test period",
                "specifications":[
                  {
                    "id":"9cdeae00-67ae-43d3-afe5-8f5691942c54",
                    "name":"CKFJNMUKVL"
                  }
                ]
              },
              {
                "id":"AY-TEST3",
                "name":"Test Academic Year 3",
                "specifications":[
                  {
                    "id":"313b714c-d1fd-448c-b211-d76f7d80dac0",
                    "name":"Pete Test 123456"
                  }
                ]
              },
              {
                "id":"AY-637410926873599646",
                "name":"AY-637410926873599646 test period",
                "specifications":[
                  {
                    "id":"92034133-e070-4a79-b92c-4c059953926e",
                    "name":"QHFVEPEKUX"
                  }
                ]
              },
              {
                "id":"AY-637408335203770420",
                "name":"AY-637408335203770420 test period",
                "specifications":[
                  {
                    "id":"80c27463-09b7-4e06-aff9-f1ec1897bb0d",
                    "name":"georgetest12022021v2"
                  }
                ]
              },
              {
                "id":"AY-637407471176865939",
                "name":"AY-637407471176865939 test period",
                "specifications":[
                  {
                    "id":"9d85cdab-1fde-4b0b-8d3c-39b9b2e97535",
                    "name":"georgetest12022021v3"
                  }
                ]
              },
              {
                "id":"AY-637655799027388668",
                "name":"AY-637655799027388668 test period",
                "specifications":[
                  {
                    "id":"774de179-f091-4bc1-a366-26f5aebe73d3",
                    "name":"BUZXTSGQMY"
                  }
                ]
              },
              {
                "id":"AY-637660873705194778",
                "name":"AY-637660873705194778 test period",
                "specifications":[
                  {
                    "id":"db0f6e5b-13ea-44d3-a605-976b4974150a",
                    "name":"NALXYLKKZI"
                  }
                ]
              },
              {
                "id":"AY-2122",
                "name":"Schools Academic Year 2021-22",
                "specifications":[
                  {
                    "id":"345e98fd-4493-433b-a6ea-1d2e8d512bb7",
                    "name":"Dan PSG 2122 tester"
                  }
                ]
              },
              {
                "id":"AY-637717067473537498",
                "name":"AY-637717067473537498 test period",
                "specifications":[
                  {
                    "id":"49ac3f02-d512-4e9a-b84e-c4627c7f17c4",
                    "name":"MTEXZKILEV"
                  }
                ]
              }
            ]
          },
          {
            "id":"GAG",
            "name":"Academies General Annual Grant",
            "periods":[
              {
                "id":"AC-2122",
                "name":"Academies Academic Year 2021-22",
                "specifications":[
                  {
                    "id":"84f7cc6c-648e-4947-82e6-22ee1776fa1b",
                    "name":"GAG spec test"
                  }
                ]
              }
            ]
          }
        ]
      })

      this.get("/users/permissions/fundingstreams", () =>{
        return [
          {
            "fundingStreamName":"Dedicated Schools Grant",
            "userId":"",
            "fundingStreamId":"DSG",
            "canAdministerFundingStream":true,
            "canCreateSpecification":true,
            "canEditSpecification":true,
            "canApproveSpecification":true,
            "canEditCalculations":true,
            "canMapDatasets":true,
            "canChooseFunding":true,
            "canRefreshFunding":true,
            "canApproveFunding":true,
            "canReleaseFunding":true,
            "canCreateTemplates":true,
            "canEditTemplates":true,
            "canApproveTemplates":true,
            "canCreateProfilePattern":true,
            "canEditProfilePattern":true,
            "canAssignProfilePattern":true,
            "canApplyCustomProfilePattern":true,
            "canApproveCalculations":true,
            "canApproveAnyCalculations":true,
            "canApproveAllCalculations":true,
            "canRefreshPublishedQa":true,
            "canUploadDataSourceFiles":true
          },
          {
            "fundingStreamName":"PE and Sport Premium Grant",
            "userId":"",
            "fundingStreamId":"PSG",
            "canAdministerFundingStream":true,
            "canCreateSpecification":true,
            "canEditSpecification":true,
            "canApproveSpecification":true,
            "canEditCalculations":true,
            "canMapDatasets":true,
            "canChooseFunding":true,
            "canRefreshFunding":true,
            "canApproveFunding":true,
            "canReleaseFunding":true,
            "canCreateTemplates":true,
            "canEditTemplates":true,
            "canApproveTemplates":true,
            "canCreateProfilePattern":true,
            "canEditProfilePattern":true,
            "canAssignProfilePattern":true,
            "canApplyCustomProfilePattern":true,
            "canApproveCalculations":true,
            "canApproveAnyCalculations":true,
            "canApproveAllCalculations":true,
            "canRefreshPublishedQa":true,
            "canUploadDataSourceFiles":true
          },
          {
            "fundingStreamName":"Academies General Annual Grant",
            "userId":"",
            "fundingStreamId":"GAG",
            "canAdministerFundingStream":true,
            "canCreateSpecification":true,
            "canEditSpecification":true,
            "canApproveSpecification":true,
            "canEditCalculations":true,
            "canMapDatasets":true,
            "canChooseFunding":true,
            "canRefreshFunding":true,
            "canApproveFunding":true,
            "canReleaseFunding":true,
            "canCreateTemplates":true,
            "canEditTemplates":true,
            "canApproveTemplates":true,
            "canCreateProfilePattern":true,
            "canEditProfilePattern":true,
            "canAssignProfilePattern":true,
            "canApplyCustomProfilePattern":true,
            "canApproveCalculations":true,
            "canApproveAnyCalculations":true,
            "canApproveAllCalculations":true,
            "canRefreshPublishedQa":true,
            "canUploadDataSourceFiles":true
          },
        ]
      })

      this.post("/api/publishedProviders/search", () =>{
        return {
          "providers":[
            {
              "publishedProviderVersionId":"DSG-FY-2021-10005143",
              "providerType":"Local Authority",
              "providerSubType":"Local Authority",
              "localAuthority":"Bournemouth Christchurch and Poole",
              "fundingStatus":"Draft",
              "providerName":"BOURNEMOUTH, CHRISTCHURCH AND POOLE COUNCIL",
              "ukprn":"10005143",
              "upin":"",
              "urn":"",
              "fundingValue":92540428.0,
              "specificationId":"4aeb22b6-50e1-48b6-9f53-613234b78a55",
              "fundingStreamId":"DSG",
              "fundingPeriodId":"FY-2021",
              "indicative":"Hide indicative allocations",
              "isIndicative":false,
              "hasErrors":false,
              "errors":[

              ],
              "majorVersion":0,
              "minorVersion":7,
              "releaseChannels":[

              ]
            }
          ],
          "filteredFundingAmount":92540428.0,
          "canPublish":false,
          "canApprove":true,
          "totalFundingAmount":92540428.0,
          "totalProvidersToApprove":1,
          "totalProvidersToPublish":0,
          "totalErrorResults":0,
          "totalResults":1,
          "currentPage":1,
          "startItemNumber":1,
          "endItemNumber":1,
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
                  "name":"Local Authority",
                  "count":1
                }
              ]
            },
            {
              "name":"providerSubType",
              "facetValues":[
                {
                  "name":"Local Authority",
                  "count":1
                }
              ]
            },
            {
              "name":"localAuthority",
              "facetValues":[
                {
                  "name":"Bournemouth Christchurch and Poole",
                  "count":1
                }
              ]
            },
            {
              "name":"fundingStatus",
              "facetValues":[
                {
                  "name":"Draft",
                  "count":1
                }
              ]
            },
            {
              "name":"indicative",
              "facetValues":[
                {
                  "name":"Hide indicative allocations",
                  "count":1
                }
              ]
            },
            {
              "name":"monthYearOpened",
              "facetValues":[
                {
                  "name":"Any other",
                  "count":1
                }
              ]
            },
            {
              "name":"hasErrors",
              "facetValues":[
                {
                  "name":"False",
                  "count":1
                }
              ]
            }
          ]
        }
      })
    },
  });
};

export const mockApiData = () => {
  const fundingPeriod1: FundingPeriod = {
    id: "say1920",
    name: "Schools Academic Year 2019-20",
  };
  const fundingPeriod2: FundingPeriod = {
    id: "aay2122",
    name: "Academies Academic Year 2021-22",
  };
  const fundingStream1: FundingStream = {
    id: "PSG",
    name: "PE and Sport Premium Grant",
  };
  const fundingStream2: FundingStream = {
    id: "DSG",
    name: "Dedicated Schools Grant",
  };

  function getSpecifications() {
    return {
      totalCount: 2,
      startItemNumber: 1,
      endItemNumber: 2,
      items: [
        {
          id: "111",
          name: "PSG 19-20",
          fundingPeriodName: "Schools Academic Year 2019-20",
          fundingPeriodId: "say1920",
          fundingStreamNames: ["PE and Sport Premium Grant"],
          fundingStreamIds: ["PSG"],
          lastUpdatedDate: new Date("2021-06-30T14:34:19.146+01:00"),
          status: "Draft",
          description: "lorem ipsum lalala",
          isSelectedForFunding: false,
        } as SpecificationListResultsItem,
        {
          id: "222",
          name: "DSG 21-22",
          fundingPeriodName: "Academies Academic Year 2021-22",
          fundingPeriodId: "aay2122",
          fundingStreamNames: ["Dedicated Schools Grant"],
          fundingStreamIds: ["DSG"],
          lastUpdatedDate: new Date("2021-06-30T14:33:18.84+01:00"),
          status: "Approved",
          description: "blablabla",
          isSelectedForFunding: true,
        } as SpecificationListResultsItem,
      ],
      facets: [
        {
          name: PublishedProviderSearchFacet.FundingStatus,
          facetValues: [
            { name: "Draft", count: 1 },
            { name: "Approved", count: 1 },
            { name: "Updated", count: 2 },
          ],
        },
        {
          name: "fundingPeriodName" as PublishedProviderSearchFacet,
          facetValues: [
            { name: "Schools Academic Year 2019-20", count: 1 },
            { name: "Academies Academic Year 2021-22", count: 1 },
            { name: "Schools Academic Year 2020-21", count: 1 },
          ],
        },
        {
          name: "fundingStreamNames" as PublishedProviderSearchFacet,
          facetValues: [
            { name: "PE and Sport Premium Grant", count: 1 },
            { name: "Dedicated Schools Grant", count: 1 },
          ],
        },
      ],
      pagerState: {
        displayNumberOfPages: 1,
        previousPage: 1,
        nextPage: 1,
        lastPage: 1,
        pages: [1],
        currentPage: 1,
      },
    };
  }

  const fundingLine1: DatasetTemplateMetadata = {
    name: "funding line 1",
    templateId: 97,
    isObsolete: false,
    isUsedInCalculation: false,
    isSelected: true,
  };
  const calc1: DatasetTemplateMetadata = {
    name: "calc a",
    templateId: 51,
    isObsolete: false,
    isUsedInCalculation: false,
    isSelected: true,
  };
  const calc2: DatasetTemplateMetadata = {
    name: "calc b",
    templateId: 433,
    isObsolete: true,
    isUsedInCalculation: false,
    isSelected: false,
  };
  const datasetMetadata1 = {
    fundingStreamId: fundingStream1.id,
    fundingPeriodId: fundingPeriod1.id,
    specificationId: specSummary1.id,
    fundingLines: [fundingLine1],
    calculations: [calc1, calc2],
  } as DatasetMetadata;
  const relationshipMetadata1: ReferencedSpecificationRelationshipMetadata = {
    currentSpecificationId: spec1.id,
    currentSpecificationName: spec1.name,
    fundingPeriodId: fundingPeriod1.id,
    fundingPeriodName: fundingPeriod1.name,
    fundingStreamId: fundingStream1.id,
    fundingStreamName: fundingStream1.name,
    referenceSpecificationId: spec2.id,
    referenceSpecificationName: spec2.name,
    relationshipDescription: "relationship description",
    relationshipId: "relationshipId",
    relationshipName: "Relationship Name",
    fundingLines: [fundingLine1],
    calculations: [calc1, calc2],
  };

  return {
    fundingStream1,
    fundingStream2,
    fundingPeriod1,
    fundingPeriod2,
    spec1,
    spec2,
    getSpecifications,
    specSummary1,
    fundingLine1,
    calc1,
    calc2,
    datasetMetadata1,
    relationshipMetadata1,
  };
};
