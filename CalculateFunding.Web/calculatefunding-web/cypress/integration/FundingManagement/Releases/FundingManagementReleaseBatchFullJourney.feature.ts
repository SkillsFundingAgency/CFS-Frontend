import { Server } from "miragejs";

import { makeServer } from "../../../../src/mirage";

context("Funding management for release batch full journey", () => {
    let server: Server;

    function setup() {
        server = makeServer({ environment: "test" });
        server.options("https://sr-t1dv-cfs-v2.service.signalr.net/*", () => {
            return { status: 201 }
        })
        server = makeServer({ environment: "test" });
        server.get("/api/users/permissions/fundingstreams", () => {
            return [
                {
                    "fundingStreamName": "d9b15202-1adb-4b77-9b84-b0fb4b317c06",
                    "userId": "",
                    "fundingStreamId": "d9b15202-1adb-4b77-9b84-b0fb4b317c06",
                    "canAdministerFundingStream": true,
                    "canCreateSpecification": true,
                    "canEditSpecification": true,
                    "canApproveSpecification": true,
                    "canEditCalculations": true,
                    "canMapDatasets": true,
                    "canChooseFunding": true,
                    "canRefreshFunding": true,
                    "canApproveFunding": true,
                    "canReleaseFunding": true,
                    "canCreateTemplates": true,
                    "canEditTemplates": true,
                    "canApproveTemplates": true,
                    "canCreateProfilePattern": true,
                    "canEditProfilePattern": true,
                    "canAssignProfilePattern": true,
                    "canApplyCustomProfilePattern": true,
                    "canApproveCalculations": true,
                    "canApproveAnyCalculations": true,
                    "canApproveAllCalculations": true,
                    "canRefreshPublishedQa": true,
                    "canUploadDataSourceFiles": true
                },
                {
                    "fundingStreamName": "8cc7d58a-426f-4b2f-bf17-d9afaa59dcc2",
                    "userId": "",
                    "fundingStreamId": "8cc7d58a-426f-4b2f-bf17-d9afaa59dcc2",
                    "canAdministerFundingStream": true,
                    "canCreateSpecification": true,
                    "canEditSpecification": true,
                    "canApproveSpecification": true,
                    "canEditCalculations": true,
                    "canMapDatasets": true,
                    "canChooseFunding": true,
                    "canRefreshFunding": true,
                    "canApproveFunding": true,
                    "canReleaseFunding": true,
                    "canCreateTemplates": true,
                    "canEditTemplates": true,
                    "canApproveTemplates": true,
                    "canCreateProfilePattern": true,
                    "canEditProfilePattern": true,
                    "canAssignProfilePattern": true,
                    "canApplyCustomProfilePattern": true,
                    "canApproveCalculations": true,
                    "canApproveAnyCalculations": true,
                    "canApproveAllCalculations": true,
                    "canRefreshPublishedQa": true,
                    "canUploadDataSourceFiles": true
                },
                {
                    "fundingStreamName": "a92bd21e-7116-4918-afdd-8748c4d77444",
                    "userId": "",
                    "fundingStreamId": "a92bd21e-7116-4918-afdd-8748c4d77444",
                    "canAdministerFundingStream": true,
                    "canCreateSpecification": true,
                    "canEditSpecification": true,
                    "canApproveSpecification": true,
                    "canEditCalculations": true,
                    "canMapDatasets": true,
                    "canChooseFunding": true,
                    "canRefreshFunding": true,
                    "canApproveFunding": true,
                    "canReleaseFunding": true,
                    "canCreateTemplates": true,
                    "canEditTemplates": true,
                    "canApproveTemplates": true,
                    "canCreateProfilePattern": true,
                    "canEditProfilePattern": true,
                    "canAssignProfilePattern": true,
                    "canApplyCustomProfilePattern": true,
                    "canApproveCalculations": true,
                    "canApproveAnyCalculations": true,
                    "canApproveAllCalculations": true,
                    "canRefreshPublishedQa": true,
                    "canUploadDataSourceFiles": true
                }]
        })
        server.get("/api/specs/funding-selections", () => {
            return [
                {
                    "id": "DSG",
                    "name": "Dedicated Schools Grant",
                    "periods": [{
                        "id": "FY-2021",
                        "name": "Financial Year 2020-21",
                        "specifications": [{
                            "id": "4aeb22b6-50e1-48b6-9f53-613234b78a55",
                            "name": "GFT Dedicated Schools Grant"
                        }]
                    }, {
                        "id": "FY-2021-abd3a03e-6da7-4bd1-a5da-f9b7d2782844",
                        "name": "FY-2021-abd3a03e-6da7-4bd1-a5da-f9b7d2782844 test period",
                        "specifications": [{ "id": "20fe8a25-b37d-4689-922a-12283eb5f3de", "name": "VWGTBSERLO" }]
                    }, {
                        "id": "FY-2021-fd89a2e0-c140-47f9-83bc-0672316a6d3c",
                        "name": "FY-2021-fd89a2e0-c140-47f9-83bc-0672316a6d3c test period",
                        "specifications": [{ "id": "aa6380e0-d1b7-43c3-9028-62a43e2b941c", "name": "VDDJWBDLQC" }]
                    }, {
                        "id": "FY-2021-69b38817-c857-435c-a8f4-d8dc53b3055a",
                        "name": "FY-2021-69b38817-c857-435c-a8f4-d8dc53b3055a test period",
                        "specifications": [{ "id": "cc1952d1-d4ef-4ee3-9494-e0b213aa37c8", "name": "BMBPBGPYYU" }]
                    }, {
                        "id": "FY-2021-c214c749-3fe4-480d-9602-ba90c11f6a29",
                        "name": "FY-2021-c214c749-3fe4-480d-9602-ba90c11f6a29 test period",
                        "specifications": [{ "id": "8c2229f0-46bc-47ed-9a6a-9a6579794a09", "name": "KUXLPROZUE" }]
                    }, {
                        "id": "FY-2021-84175b74-198d-4990-b1a1-f52ffb94c282",
                        "name": "FY-2021-84175b74-198d-4990-b1a1-f52ffb94c282 test period",
                        "specifications": [{ "id": "0c8a9456-b2a9-4fd3-8f1a-6c8e37b3d6f0", "name": "WDPFIOZBOE" }]
                    }, {
                        "id": "FY-2021-e72ac880-c482-40c8-a962-b8cedcb5c681",
                        "name": "FY-2021-e72ac880-c482-40c8-a962-b8cedcb5c681 test period",
                        "specifications": [{ "id": "f6868f2d-5843-4d79-8f20-a49c0959efb2", "name": "PCERYWZMDX" }]
                    }, {
                        "id": "FY-2021-feede2ea-c84f-4aef-8ad4-fc52c29e28aa",
                        "name": "FY-2021-feede2ea-c84f-4aef-8ad4-fc52c29e28aa test period",
                        "specifications": [{ "id": "dbd108bd-ee7b-43bf-80f7-b1ac1e08d530", "name": "TYLHFAVHKX" }]
                    }, {
                        "id": "FY-2021-a5acc967-89d1-49f5-a644-c0406f48963a",
                        "name": "FY-2021-a5acc967-89d1-49f5-a644-c0406f48963a test period",
                        "specifications": [{ "id": "b329b8bf-5cdf-41f9-ab66-656672cc585e", "name": "QNRUUFKZBW" }]
                    }, {
                        "id": "FY-2021-508043da-beb8-4459-9583-6a8ffbc8d346",
                        "name": "FY-2021-508043da-beb8-4459-9583-6a8ffbc8d346 test period",
                        "specifications": [{ "id": "368b9d1e-b42e-4c82-9c64-aeebc903e052", "name": "IXROUOAFLE" }]
                    }, {
                        "id": "FY-2021-f0036ddb-8db7-4148-b6cc-291f51c2349c",
                        "name": "FY-2021-f0036ddb-8db7-4148-b6cc-291f51c2349c test period",
                        "specifications": [{ "id": "00448fe9-00bd-4990-935f-e423ef76d9a2", "name": "DJCAYMQGCV" }]
                    }, {
                        "id": "FY-2021-871eed20-9960-4c15-a71e-f18e6296b4ad",
                        "name": "FY-2021-871eed20-9960-4c15-a71e-f18e6296b4ad test period",
                        "specifications": [{ "id": "828b64df-e90a-405d-8cbf-d62f1c7291b5", "name": "ANMAAOIPAX" }]
                    }, {
                        "id": "FY-2021-405deb0e-d9f4-48f3-87a7-f1ba73c00e3f",
                        "name": "FY-2021-405deb0e-d9f4-48f3-87a7-f1ba73c00e3f test period",
                        "specifications": [{ "id": "9d9ec30b-45c3-46b7-afc7-7907ae5f0952", "name": "NHOYYHQYMD" }]
                    }, {
                        "id": "FY-2021-1a6e33f2-964c-46ba-8c98-c4dd65094c58",
                        "name": "FY-2021-1a6e33f2-964c-46ba-8c98-c4dd65094c58 test period",
                        "specifications": [{ "id": "170e12f7-6552-4d39-9cc6-dbb1bed13029", "name": "HDGIVCYQIW" }]
                    }, {
                        "id": "FY-2021-1936479e-227f-4507-8e37-498bd2cfa7dd",
                        "name": "FY-2021-1936479e-227f-4507-8e37-498bd2cfa7dd test period",
                        "specifications": [{ "id": "b07cd2ec-131e-44d4-8ce7-a674ef3ea0d9", "name": "SRVQFIKQOO" }]
                    }, {
                        "id": "FY-2021-e5bf97e5-6d38-46ce-bf40-02e69ea6c890",
                        "name": "FY-2021-e5bf97e5-6d38-46ce-bf40-02e69ea6c890 test period",
                        "specifications": [{ "id": "d051f282-11f9-4603-bd62-a75ef42e1cb4", "name": "QALUKBRLEY" }]
                    }, {
                        "id": "FY-2021-efad2065-212a-4779-b2e8-5151d9c7dbe5",
                        "name": "FY-2021-efad2065-212a-4779-b2e8-5151d9c7dbe5 test period",
                        "specifications": [{ "id": "5f473777-e740-4f92-a15f-d97d1a7c2aeb", "name": "AYFXUQKWGI" }]
                    }, {
                        "id": "FY-2021-1d76a660-2a13-475b-90bb-09292be2080b",
                        "name": "FY-2021-1d76a660-2a13-475b-90bb-09292be2080b test period",
                        "specifications": [{ "id": "5d60179e-e9f5-4567-a5db-0e982081997c", "name": "GXFSZEFBFZ" }]
                    }, {
                        "id": "FY-2021-54751416-0a07-4c13-9bbc-7d22d66b560b",
                        "name": "FY-2021-54751416-0a07-4c13-9bbc-7d22d66b560b test period",
                        "specifications": [{ "id": "ef4d2e96-dcc4-4d01-966c-8135294ffc18", "name": "VBFYSECZNB" }]
                    }, {
                        "id": "FY-2021-8c60c957-bc7d-4894-970a-e1c2ab8c7bd5",
                        "name": "FY-2021-8c60c957-bc7d-4894-970a-e1c2ab8c7bd5 test period",
                        "specifications": [{ "id": "6b452afd-4992-4ab0-99b8-fcc85de35558", "name": "ZLVXGBXMPQ" }]
                    }, {
                        "id": "FY-2021-083423ad-b354-42ef-b14a-2349e24964f3",
                        "name": "FY-2021-083423ad-b354-42ef-b14a-2349e24964f3 test period",
                        "specifications": [{ "id": "92fb96e9-1489-4be4-bc96-0025adc47f32", "name": "RWIDQEOZBC" }]
                    }, {
                        "id": "FY-2021-d4fd5692-d507-4ef1-a53c-bd65e3788f5b",
                        "name": "FY-2021-d4fd5692-d507-4ef1-a53c-bd65e3788f5b test period",
                        "specifications": [{ "id": "7672ed0b-bc4b-4693-a84f-786e50ce558d", "name": "LWPCKMNNGE" }]
                    }, {
                        "id": "FY-2021-fc2cc0b3-9b49-4e3b-96c9-380894ef975d",
                        "name": "FY-2021-fc2cc0b3-9b49-4e3b-96c9-380894ef975d test period",
                        "specifications": [{ "id": "2702638a-7f96-463b-97ba-96840335c50d", "name": "RZJFROYMNK" }]
                    }, {
                        "id": "FY-2021-06581720-36b7-4097-9260-a3867c6b2cca",
                        "name": "FY-2021-06581720-36b7-4097-9260-a3867c6b2cca test period",
                        "specifications": [{ "id": "44229dcb-f0af-444b-a3dc-e116ec421290", "name": "HRMEHWQTPQ" }]
                    }, {
                        "id": "FY-2021-f001dd25-d557-420c-8284-13fb6c585c5f",
                        "name": "FY-2021-f001dd25-d557-420c-8284-13fb6c585c5f test period",
                        "specifications": [{ "id": "8c4a7ae0-6716-48dc-815e-7a8e791aa32f", "name": "FKSUSUPSOQ" }]
                    }, {
                        "id": "FY-2021-82e77e78-c0ff-4624-9eb7-09c242d2bcbb",
                        "name": "FY-2021-82e77e78-c0ff-4624-9eb7-09c242d2bcbb test period",
                        "specifications": [{ "id": "bd40d143-ab34-46d6-8365-06b01c3f77fe", "name": "XSVURMKWZP" }]
                    }, {
                        "id": "FY-2021-48295276-694f-44bd-82a1-f45828050e48",
                        "name": "FY-2021-48295276-694f-44bd-82a1-f45828050e48 test period",
                        "specifications": [{ "id": "a89e9676-e04c-4abd-bf1f-6c8a8d6072c3", "name": "PLOQEQTXJY" }]
                    }, {
                        "id": "FY-2021-82b0935e-ff32-4d99-b7a7-7eaf6f3b4a98",
                        "name": "FY-2021-82b0935e-ff32-4d99-b7a7-7eaf6f3b4a98 test period",
                        "specifications": [{ "id": "b596717d-e82a-4a9f-93af-b5adf47c1de3", "name": "WBZJVFELNS" }]
                    }, {
                        "id": "FY-2021-dc5b2b43-ba57-4afb-807b-bd409d24ada1",
                        "name": "FY-2021-dc5b2b43-ba57-4afb-807b-bd409d24ada1 test period",
                        "specifications": [{ "id": "81033095-0fa1-43b0-91c8-5daccfb6927c", "name": "ENBGGFHNXS" }]
                    }, {
                        "id": "FY-2021-8e85540e-6bf2-4068-834d-6e942c03e502",
                        "name": "FY-2021-8e85540e-6bf2-4068-834d-6e942c03e502 test period",
                        "specifications": [{ "id": "2e10cf69-955d-474b-ac46-1fbd9ee7d52f", "name": "PHMFKZFQMP" }]
                    }, {
                        "id": "FY-2021-1f0b08e6-2046-402c-a6fb-f2ae8b5d7608",
                        "name": "FY-2021-1f0b08e6-2046-402c-a6fb-f2ae8b5d7608 test period",
                        "specifications": [{
                            "id": "75cdeb34-55d2-4cbf-b99f-99980220c22a",
                            "name": "Pete's Test Specification rteshbsrth"
                        }]
                    }, {
                        "id": "FY-637354122734291641",
                        "name": "FY-637354122734291641 test period",
                        "specifications": [{ "id": "b9e1d05a-56a8-420d-b7a1-59e81c505c7d", "name": "NQQHQIRXSB" }]
                    }, {
                        "id": "FY-637359448512894590",
                        "name": "FY-637359448512894590 test period",
                        "specifications": [{ "id": "98578e43-4f7e-42fb-aa43-a43072df9dc3", "name": "ABNLRHMDNK" }]
                    }, {
                        "id": "FY-637360151508245738",
                        "name": "FY-637360151508245738 test period",
                        "specifications": [{ "id": "ceb1098d-55bb-4d69-aa83-d2f2965e7430", "name": "OXYOZIJLAN" }]
                    }, {
                        "id": "FY-637365961495279730",
                        "name": "FY-637365961495279730 test period",
                        "specifications": [{ "id": "ed635c45-b3db-4332-97e0-d2487fc63c4e", "name": "PHWRTRDWRZ" }]
                    }, {
                        "id": "FY-637369417583884911",
                        "name": "FY-637369417583884911 test period",
                        "specifications": [{ "id": "df9e1ebc-9c2b-4c2a-aa99-2e76e8fee1f0", "name": "RSJOLKBDEQ" }]
                    }, {
                        "id": "FY-637370281814739669",
                        "name": "FY-637370281814739669 test period",
                        "specifications": [{ "id": "fb538e18-5134-4cf3-a75e-946f28050c03", "name": "CVERSEHYCM" }]
                    }, {
                        "id": "FY-637372009269084876",
                        "name": "FY-637372009269084876 test period",
                        "specifications": [{ "id": "234e26cb-ab90-4f4e-ae39-0c8d599ddd2f", "name": "HPDDYHHZFA" }]
                    }, {
                        "id": "FY-637401422217151115",
                        "name": "FY-637401422217151115 test period",
                        "specifications": [{ "id": "195ddc54-244d-486b-b762-c3ad09a63383", "name": "HFGKYDIUIU" }]
                    }, {
                        "id": "FY-637465628648590698",
                        "name": "FY-637465628648590698 test period",
                        "specifications": [{ "id": "6e05dabd-fd3e-4773-b9c1-8573e90f42ad", "name": "ETMESBQUVD" }]
                    }, {
                        "id": "FY-637465664652667765",
                        "name": "FY-637465664652667765 test period",
                        "specifications": [{ "id": "97458204-c145-4356-b8e4-cb9a06bb3f86", "name": "ZTPVEYTGBC" }]
                    }, {
                        "id": "FY-637465708834575066",
                        "name": "FY-637465708834575066 test period",
                        "specifications": [{ "id": "ae7db83f-1399-488a-b385-97ffe233e51e", "name": "ATEQJOMTTE" }]
                    }, {
                        "id": "FY-637465742662660186",
                        "name": "FY-637465742662660186 test period",
                        "specifications": [{ "id": "bcc5f667-4f3f-4c43-967d-55b73b9bf5ca", "name": "ACOXUIWYJK" }]
                    }, {
                        "id": "FY-637465763454400421",
                        "name": "FY-637465763454400421 test period",
                        "specifications": [{ "id": "b222cd55-4ae3-472e-96b9-5842e61401da", "name": "RSNAEVOMHP" }]
                    }, {
                        "id": "FY-637465791888474139",
                        "name": "FY-637465791888474139 test period",
                        "specifications": [{ "id": "268ee832-e8ac-4d8b-add7-c8034acf223b", "name": "YNIINNMLEJ" }]
                    }, {
                        "id": "86d92c0a-292f-482c-b328-1c7837f9a769",
                        "name": "fe1cf817-7a65-4614-96c5-66df93a3b183",
                        "specifications": [{
                            "id": "e365c04d-e884-4c81-b341-e918fb98c8e6",
                            "name": "48bb58ac-e8e2-40d2-abe6-fddb434a147c"
                        }]
                    }, {
                        "id": "FY-637660847474833876",
                        "name": "FY-637660847474833876 test period",
                        "specifications": [{ "id": "80b2fd3a-4fa0-491e-999a-21caa6f4a65b", "name": "GQDLNZTPHJ" }]
                    }]
                },
                {
                    "id": "PSG",
                    "name": "PE and Sport Premium Grant",
                    "periods": [{
                        "id": "AY-1920",
                        "name": "1920",
                        "specifications": [{ "id": "289eb3f8-b331-4a29-ad20-7209fe3560fb", "name": "GFT_PE and Sport 19/20" }]
                    }, {
                        "id": "AY-TEST5",
                        "name": "Test Academic Year 5",
                        "specifications": [{
                            "id": "f49f998e-19a6-44e5-9b93-91de1d6d1d42",
                            "name": "Test Choose for Funding Link"
                        }]
                    }, {
                        "id": "AY-2021",
                        "name": "Schools Academic Year 2020-21",
                        "specifications": [{
                            "id": "7fd0f041-b4b2-40a8-a13b-3f3645722f42",
                            "name": "George Test 08102020v1"
                        }, { "id": "45e8eef2-c5b8-4ec0-a034-73913dac0b8c", "name": "RH Test" }]
                    }, {
                        "id": "AY-637378058824321011",
                        "name": "AY-637378058824321011 test period",
                        "specifications": [{ "id": "40b5de48-54ca-4f6b-9fcb-bf3c08628f30", "name": "George Test 09102020v1" }]
                    }, {
                        "id": "AY-637400558744263658",
                        "name": "AY-637400558744263658 test period",
                        "specifications": [{ "id": "d13b58fd-91bd-4c87-9765-1a99213cda6c", "name": "QIAMLQUCTG" }]
                    }, {
                        "id": "AY-637401423504314360",
                        "name": "AY-637401423504314360 test period",
                        "specifications": [{ "id": "9f58648e-46ea-4535-98fa-cd854781933b", "name": "CQXMQXIWOR" }]
                    }, {
                        "id": "AY-637402287610232202",
                        "name": "AY-637402287610232202 test period",
                        "specifications": [{ "id": "9cdeae00-67ae-43d3-afe5-8f5691942c54", "name": "CKFJNMUKVL" }]
                    }, {
                        "id": "AY-TEST3",
                        "name": "Test Academic Year 3",
                        "specifications": [{ "id": "313b714c-d1fd-448c-b211-d76f7d80dac0", "name": "Pete Test 123456" }]
                    }, {
                        "id": "AY-637410926873599646",
                        "name": "AY-637410926873599646 test period",
                        "specifications": [{ "id": "92034133-e070-4a79-b92c-4c059953926e", "name": "QHFVEPEKUX" }]
                    }, {
                        "id": "AY-637408335203770420",
                        "name": "AY-637408335203770420 test period",
                        "specifications": [{ "id": "80c27463-09b7-4e06-aff9-f1ec1897bb0d", "name": "georgetest12022021v2" }]
                    }, {
                        "id": "AY-637407471176865939",
                        "name": "AY-637407471176865939 test period",
                        "specifications": [{ "id": "9d85cdab-1fde-4b0b-8d3c-39b9b2e97535", "name": "georgetest12022021v3" }]
                    }, {
                        "id": "AY-637655799027388668",
                        "name": "AY-637655799027388668 test period",
                        "specifications": [{ "id": "774de179-f091-4bc1-a366-26f5aebe73d3", "name": "BUZXTSGQMY" }]
                    }, {
                        "id": "AY-637660873705194778",
                        "name": "AY-637660873705194778 test period",
                        "specifications": [{ "id": "db0f6e5b-13ea-44d3-a605-976b4974150a", "name": "NALXYLKKZI" }]
                    }, {
                        "id": "AY-2122",
                        "name": "Schools Academic Year 2021-22",
                        "specifications": [{ "id": "345e98fd-4493-433b-a6ea-1d2e8d512bb7", "name": "Dan PSG 2122 tester" }]
                    }]
                },
                {
                    "id": "GAG",
                    "name": "Academies General Annual Grant",
                    "periods": [{
                        "id": "AC-2122",
                        "name": "Academies Academic Year 2021-22",
                        "specifications": [{ "id": "84f7cc6c-648e-4947-82e6-22ee1776fa1b", "name": "GAG spec test" }]
                    }]
                },
                {
                    "id": "3b49e35f-144e-436d-89eb-327e03379f28",
                    "name": "887d20e5-ffe9-4958-a019-4f1f29541ceb",
                    "periods": [{
                        "id": "174a222e-3ca5-48c0-b234-99d31f8f4104",
                        "name": "c4b8d90c-6cb4-48a2-9a20-f89933805649",
                        "specifications": [{
                            "id": "3eb9f6e1-a029-46c9-81c8-ab1f03ff2c3b",
                            "name": "348cec92-7801-48f8-99c0-58ad1f5b34dd"
                        }]
                    }]
                },
                {
                    "id": "64df5566-54f2-43a5-ae0d-28db1b56e99f",
                    "name": "20f1bd7d-945e-4668-80cd-009ca7cf4fdc",
                    "periods": [{
                        "id": "05f81eb7-1ae1-499d-8d60-b85e3746cd42",
                        "name": "73958cf3-d6c0-4529-820e-777305c99993",
                        "specifications": [{
                            "id": "780c47b3-eeac-42c0-a24a-0db3e66b4150",
                            "name": "83e56c02-7061-4dcf-857d-68c52830e7ba"
                        }]
                    }]
                },
                {
                    "id": "a446ed30-f0b4-4235-8e6c-828ca070aa17",
                    "name": "93ab92c4-4245-4c21-993f-3acaf8ab5199",
                    "periods": [{
                        "id": "a6d98252-f198-4154-9fb6-afcc5b837abc",
                        "name": "1750e77a-758e-430c-a8c0-650088fa547d",
                        "specifications": [{
                            "id": "d252eb42-0d56-444d-8e9c-b73e7c5526fc",
                            "name": "c90fb7cc-3079-4b8d-b4a7-0bcdbf4ef337"
                        }]
                    }]
                },
                {
                    "id": "a830d8bb-3526-4923-a3f2-d3a25079b035",
                    "name": "c5a6bc1a-6ac1-4fb8-b081-bd3b70089ade",
                    "periods": [{
                        "id": "71ba2b38-fabd-48ae-90d8-53a18e48dec9",
                        "name": "5da46455-496e-41a4-bc7a-6ad990d16de0",
                        "specifications": [{
                            "id": "5ac03138-267c-4a79-a2dd-91a7a770fc85",
                            "name": "259f0973-e50e-43f5-a17b-a512bd7cb6ce"
                        }]
                    }]
                },
                {
                    "id": "3f4aa627-98d0-4a00-ac01-f39501bb73a0",
                    "name": "9c778865-46f9-43c9-b6e7-41eb0715c7d1",
                    "periods": [{
                        "id": "6e882103-7d9e-409e-bd7c-1e857a53d4ea",
                        "name": "3586b414-d185-45ab-8462-1f10ca0656c9",
                        "specifications": [{
                            "id": "4ad774e3-a1f7-4bbf-865e-1d85d55c3579",
                            "name": "021138d7-2afb-44fb-9cbe-6f250855f669"
                        }]
                    }]
                },
                {
                    "id": "70023413-7277-46b5-931a-3db0d0a93034",
                    "name": "2ad84daa-b682-4353-9c4c-728052de2520",
                    "periods": [{
                        "id": "5f5d8d8a-731f-45db-bed7-7ff63af8a890",
                        "name": "c940018f-f894-4c05-9d7c-2c29a0eb7bf4",
                        "specifications": [{
                            "id": "7716f695-c928-4d17-91d2-d3d019acf75f",
                            "name": "6841f49d-4a82-47bd-945c-b3e4163a0c84"
                        }]
                    }]
                },
                {
                    "id": "5a519e94-aa34-4ec0-879e-4cf9a1a87221",
                    "name": "da31232f-53b1-4874-a207-26d9011835b7",
                    "periods": [{
                        "id": "3e7e1122-b6c3-494f-966b-e7f5b72d5ab3",
                        "name": "90af39d5-1a35-4056-acfb-ac8380365e21",
                        "specifications": [{
                            "id": "e42b4a90-c0ee-4469-a095-82cd60a27aba",
                            "name": "a3c45c0a-6d3f-47b7-bcf0-a26871616072"
                        }]
                    }]
                },
                {
                    "id": "d09483ba-4fba-4507-975b-4d22ebac093a",
                    "name": "7defdafe-ed49-4874-907a-328a32bf8998",
                    "periods": [{
                        "id": "2eef3aef-303e-4851-ba44-b147d57e105d",
                        "name": "9c333a77-c874-4b8e-8b90-e277704379ca",
                        "specifications": [{
                            "id": "31721378-f44a-4931-9356-30014a68b950",
                            "name": "ad953afd-b950-4636-b7a6-f50c020604b0"
                        }]
                    }]
                },
                {
                    "id": "322aa082-b3e6-4612-99e7-8580b9934f1b",
                    "name": "02bcb76c-f2e9-4aeb-8e18-d9879231c6ac",
                    "periods": [{
                        "id": "77c3c8d3-f67e-4a06-ab2d-439ce7165560",
                        "name": "745662bb-88c1-41ea-8013-4b871066e3c9",
                        "specifications": [{
                            "id": "cbf3c768-1248-43b8-92a0-224fa93a74f3",
                            "name": "281f2e87-de72-43f0-be49-ef87a9ed63e9"
                        }]
                    }]
                },
                {
                    "id": "67ce200a-3cfc-453e-971c-30d645bad533",
                    "name": "23e36af3-7bac-4655-be08-e5388781b10c",
                    "periods": [{
                        "id": "b2680b43-fb14-462c-918b-35aeaf077f7b",
                        "name": "9559d5ab-abd9-4c4b-b9c9-738953753b64",
                        "specifications": [{
                            "id": "fd4c8ae7-b81e-4545-9af9-9e843ce9a085",
                            "name": "2a2b9f9a-461b-4005-a651-80758e276395"
                        }]
                    }]
                },
                {
                    "id": "ec0271d7-37fa-44ea-a758-e2b5004d8c00",
                    "name": "e30d42e8-ea59-42ae-a40f-bd9bf5c52baf",
                    "periods": [{
                        "id": "b7adfb8a-f332-4ead-b57c-0d2ce1a09ce7",
                        "name": "331edf61-749b-4b15-9c9d-eb31a191f152",
                        "specifications": [{
                            "id": "6066f26d-fdf5-4873-ac93-ade6728526bb",
                            "name": "d2641fe6-22ae-4fd8-8826-00086345a4de"
                        }]
                    }]
                }]
        })
        server.get("/policy/configuration/DSG/FY-2021", () => {
            return {
                "organisationGroupings": [
                    {
                        "groupTypeIdentifier": "UKPRN",
                        "groupingReason": 0,
                        "groupTypeClassification": "LegalEntity",
                        "organisationGroupTypeCode": "LocalAuthority",
                        "providerTypeMatch": [],
                        "providerStatus": null
                    },
                    {
                        "groupTypeIdentifier": "LACode",
                        "groupingReason": 1,
                        "groupTypeClassification": "GeographicalBoundary",
                        "organisationGroupTypeCode": "LocalAuthority",
                        "providerTypeMatch": [],
                        "providerStatus": null
                    },
                    {
                        "groupTypeIdentifier": "LocalAuthorityClassificationTypeCode",
                        "groupingReason": 1,
                        "groupTypeClassification": "GeographicalBoundary",
                        "organisationGroupTypeCode": "LocalGovernmentGroup",
                        "providerTypeMatch": [],
                        "providerStatus": null
                    },
                    {
                        "groupTypeIdentifier": "GovernmentOfficeRegionCode",
                        "groupingReason": 1,
                        "groupTypeClassification": "GeographicalBoundary",
                        "organisationGroupTypeCode": "GovernmentOfficeRegion",
                        "providerTypeMatch": [],
                        "providerStatus": null
                    },
                    {
                        "groupTypeIdentifier": "CountryCode",
                        "groupingReason": 1,
                        "groupTypeClassification": "GeographicalBoundary",
                        "organisationGroupTypeCode": "Country",
                        "providerTypeMatch": [],
                        "providerStatus": null
                    }
                ],
                "id": "config-DSG-FY-2021",
                "fundingStreamId": "DSG",
                "fundingPeriodId": "FY-2021",
                "defaultTemplateVersion": "1.1",
                "variations": [
                    {
                        "name": "TemplateUpdated",
                        "order": 0,
                        "fundingLineCodes": null
                    },
                    {
                        "name": "FundingSchemaUpdated",
                        "order": 1,
                        "fundingLineCodes": null
                    },
                    {
                        "name": "ProviderMetadata",
                        "order": 2,
                        "fundingLineCodes": null
                    },
                    {
                        "name": "FundingUpdated",
                        "order": 4,
                        "fundingLineCodes": null
                    },
                    {
                        "name": "ProfilingUpdated",
                        "order": 5,
                        "fundingLineCodes": null
                    },
                    {
                        "name": "ReProfiling",
                        "order": 6,
                        "fundingLineCodes": null
                    }
                ],
                "errorDetectors": [
                    "TrustIdMismatchErrorDetector",
                    "FundingLineValueProfileMismatchErrorDetector",
                    "PostPaymentOutOfScopeProviderErrorDetector",
                    "ProviderNotFundedErrorDetector"
                ],
                "approvalMode": "All",
                "providerSource": "CFS",
                "paymentOrganisationSource": "PaymentOrganisationAsProvider",
                "updateCoreProviderVersion": "Manual",
                "enableUserEditableCustomProfiles": false,
                "enableUserEditableRuleBasedProfiles": false,
                "runCalculationEngineAfterCoreProviderUpdate": true,
                "enableConverterDataMerge": false,
                "successorCheck": false,
                "indicativeOpenerProviderStatus": [],
                "allowedPublishedFundingStreamsIdsToReference": [],
                "releaseManagementVariations": [],
                "releaseChannels": [],
                "releaseActionGroups": []
            }
        });

        cy.visit("/");
    }

    before(() => setup());

    after(() => {
        server.shutdown();
    })

    it("navigates to Release Management using the link", () => {
        //todo: when the page is live then change to findByRole and use page link from root
        cy.visit("/FundingManagement");

        cy.findByRole("link", { name: /Release management/ }).should("exist").click();

        cy.findByRole("heading", {
            level: 1,
            name: /Release management/
        }).should("exist");

        cy.findByRole("heading", {
            level: 3,
            name: /Select a funding stream and funding period./
        }).should("exist");
    });

    it("selects the funding stream and funding period and continues to the next screen", () =>{
        cy.findByLabelText("Funding stream").should("exist").select(1);
        cy.findByLabelText("Funding period").should("exist").select(1);

        cy.findByRole("button", { name: /Continue/i }).should("exist").click();
    })
})
