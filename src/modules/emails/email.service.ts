import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { N9HttpClient, PrometheusClient } from 'n9-node-routing';
import { Inject, Service } from 'typedi';
import { Conf } from '../../conf/index.models';
import { StringMap } from '../../models/string-map.models';
import * as shortid from 'shortid';
import * as MailJet from 'node-mailjet';

@Service()
export class EmailService {

	private static GET_DATE(): string {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
		const yyyy = today.getFullYear();

		return mm + '/' + dd + '/' + yyyy;
	}
	@Inject('logger')
	private logger: N9Log;

	@Inject('conf')
	private conf: Conf;

	@Inject('N9HttpClient') private httpClient: N9HttpClient;

	private currentTokens: StringMap<{ creationDateMs: number }> = {};
	private switchOnCounter: PrometheusClient.Counter;
	private readonly DURATION_30_MIN_IN_MS: number = 30 * 60 * 1_000;

	constructor() {
		this.switchOnCounter = new PrometheusClient.Counter({
			name: 'server_switch_switch_on_count',
			help: 'Number switch on',
			labelNames: [],
		});
	}

	public async sendMail(emailAddress: string): Promise<void> {
		const token = shortid.generate();
		this.logger.info(`Sending email to ${emailAddress}, token : ${token}`);
		const url = `${this.conf.activationURL.base}${token}`;

		const mailjet = MailJet.connect(this.conf.mailjet.apiKey, this.conf.mailjet.apiSecretKey, {
			url: 'api.mailjet.com', // default is the API url
			version: 'v3.1', // default is '/v3'
			perform_api_call: true, // used for tests. default is true
		});

		await mailjet
				.post('send')
				.request({
					Messages: [{
						From: {
							Email: this.conf.mailjet.sender.email,
							Name: this.conf.mailjet.sender.name,
						},
						To: [
							{
								Email: emailAddress,
								Name: emailAddress,
							},
						],
						Subject: `Allumage du serveur (${EmailService.GET_DATE()})`,
						TextPart: `URL d'alumage : ${url}`,
						HTMLPart: `<p>Hello,</p><br/><p>Pour allumer le serveur, va ici : <a href="${url}" target="_blank">${url}</a></p> <br /><br /><br /> <p>${this.conf.mailjet.sender.name}</p>`,
					}],
				});
		this.currentTokens[token] = { creationDateMs: Date.now() };
	}

	public async switchOn(token: string): Promise<void> {
		if (this.currentTokens[token]) {
			if (this.currentTokens[token].creationDateMs > (Date.now() - (this.DURATION_30_MIN_IN_MS))) {
				// check if PC is off
				if (await this.isServerOff()) {
					this.logger.info(`Call server switch ON`);
					await this.httpClient.get(`${this.conf.targetServer.switchOnUrl}`);
					this.switchOnCounter.inc(1);
					delete this.currentTokens[token];
				} else {
					delete this.currentTokens[token];
					throw new N9Error('server-is-on', 400);
				}
			} else {
				delete this.currentTokens[token];
				throw new N9Error('token-expired', 400);
			}
		} else {
			throw new N9Error('token-not-found', 400);
		}
	}

	private async isServerOff(): Promise<boolean> {
		try {
			await this.httpClient.raw(this.conf.targetServer.checkURL, {
				method: 'get',
				timeout: 5000,
				headers: this.conf.targetServer.check.headers,
			});
			this.logger.info(`Server is already available !`);
			return false;
		} catch (e) {
			if (e.status === 404 || e.status === 401) return true;
			else throw e;
		}
	}
}
