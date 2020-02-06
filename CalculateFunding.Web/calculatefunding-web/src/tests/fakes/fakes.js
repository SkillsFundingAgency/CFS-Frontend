import { createMemoryHistory } from 'history'
require('./jsdom');


const history = createMemoryHistory('/');

export default { history }