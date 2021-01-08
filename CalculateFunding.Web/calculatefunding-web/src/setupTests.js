import {configure} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import MutationObserver from '@sheerun/mutationobserver-shim';

window.scrollTo = jest.fn();
window.MutationObserver = MutationObserver;
window.HTMLElement.prototype.scrollIntoView = function () {};

configure({adapter: new Adapter()});

const error = global.console.error;

global.console.error = function (...args) {
    error(...args);
    throw new Error(format(...args));
};
