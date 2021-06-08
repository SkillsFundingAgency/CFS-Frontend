import axios from "axios";
import {Config} from '../types/Config';
import {UserActionEvent} from "../actions/userAction";
import {createStore} from 'redux';
import {rootReducer} from "../reducers/rootReducer";

const store = createStore(rootReducer);

const configurationPromise: Promise<Config> = (window as any)['configuration'];

export function initialiseAxios() {
    configurationPromise.then(response => {
        const configuration = response;

        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        axios.interceptors.response.use(
            response => response,
            (error) => {
                
                if (window.location.href.includes('.auth/login')) {
                    return Promise.reject(error);
                }

                // no authentication provided so need to login
                if (error.response.status === 403) {
                    window.location.href = `${configuration.baseUrl}/.auth/login/aad?post_login_redirect_url=${window.location.href}`;
                    return Promise.reject(error);
                }

                // api says user hasn't confirmed skills
                if (error.response.status === 451) {
                    if (store.getState().userState.hasConfirmedSkills) {
                        store.dispatch({ type: UserActionEvent.UPDATE_USER_CONFIRMED_SKILLS, payload: false });
                    }
                }
                
                const originalRequest = error.config;

                // Do something with request error
                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    fetch(
                        `${configuration.baseUrl}/.auth/refresh`,
                        {
                            method: 'GET'
                        }
                    )
                        .then(response => {
                            return response.json();
                        })
                        .then(() => {
                            axios(originalRequest);
                        })
                        .catch(error => {
                            // do login redirect
                            window.location.href = `${configuration.baseUrl}/.auth/login/aad?post_login_redirect_url=${window.location.href}`;
                        });
                } else {
                    return Promise.reject(error);
                }
            });
    });
} 