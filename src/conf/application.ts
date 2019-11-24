import * as Fs from 'fs-extra';
import { Conf } from './index.models';
import * as _ from 'lodash';

let conf: Partial<Conf> = {
	http: {
		port: process.env.PORT || 8088,
	},
	prometheus: {
		port: 9101,
	},
};

const confPath = process.env.CONF_PATH || '/conf/server-switch-conf.json';
if (Fs.pathExistsSync(confPath)) {
	try {
		const fileConf = Fs.readJSONSync(confPath);
		conf = _.merge(fileConf, conf);
	} catch (e) {
		(global.log || console).error(`Can't load file conf. Conf path : ${confPath}`, e);
		throw e;
	}
}

export default conf;
