import { Response,createServer } from "miragejs";

type TestWindow = Window & {
  handleFromCypress: (request: Request) => Promise<any>;
};

export const isTestWindow = (window: Window | TestWindow): window is TestWindow => {
  return window.hasOwnProperty("Cypress");
};

export const interceptBrowserRequests = () => {
  if (isTestWindow(window)) {
    const testWindow: TestWindow = window;
    if (testWindow.handleFromCypress) {
      createServer({
        environment: "test",
        routes() {
          const methods = ["get", "put", "patch", "post", "delete"];
          methods.forEach((method) => {
            (this as any)[method]("/api/*", async (schema: any, request: Request) => {
              const [status, headers, body] = await testWindow.handleFromCypress(request);
              return new Response(status, headers, body);
            });
          });
        },
      });
    }
  }
};
