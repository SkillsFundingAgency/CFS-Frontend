
import { Config } from '../types/Config';
const configurationPromise:Promise<Config> = (window as any)['configuration'];

export class LoggerService {
    log(msg: string) {
      console.log(msg);
    }

    error(msg: string) {
      console.error(msg);
    }
    
    trace(msg: string) {
        configurationPromise.then(response => {
            const configuration = response;
            if (configuration.tracingOn)
            {
                console.log(msg);
            }
        });
    }

    debug(msg: string) {
        configurationPromise.then(response => {
            const configuration = response;
            if( configuration.debugOn )
            {
                console.log(msg);
            }
        });
    }
}