import {configure} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import MutationObserver from '@sheerun/mutationobserver-shim';
import { format } from "util";

window.scrollTo = jest.fn();
window.MutationObserver = MutationObserver;
window.HTMLElement.prototype.scrollIntoView = function () {};

configure({adapter: new Adapter()});

const error = global.console.error;

global.console.error = function (...args) {
    const testPath = global.jasmine.testPath ? ` ${global.jasmine.testPath} \n` : '';
    const message = format(testPath, ...args);
    error(message);
    throw new Error(message);
};