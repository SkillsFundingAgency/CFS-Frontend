import './commands'
import {isTestWindow} from "../../src/mirage";

if (isTestWindow(window)) {
    Cypress.on('window:before:load', (win: any) => {
        win.handleFromCypress = (request: any) =>
            fetch(request.url, {
                method: request.method,
                headers: request.requestHeaders,
                body: request.requestBody,
            }).then((res) => {
                // @ts-ignore
                const content = res.headers.map['content-type'] === 'application/json' ? res.json() : res.text()
                return new Promise((resolve) => {
                    content.then((body) => resolve([res.status, res.headers, body]))
                })
            });
    });
}