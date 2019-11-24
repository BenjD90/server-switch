import { Get, JsonController, Post, Param } from '@flyacts/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { Inject, Service } from 'typedi';
import { Conf } from '../../conf/index.models';
import { EmailService } from './email.service';

@Service()
@JsonController('/emails')
export class EmailsController {
	@Inject('logger')
	private logger: N9Log;

	@Inject('conf')
	private conf: Conf;

	constructor(private emailService: EmailService) {
	}

	@Post('/:emailAddress')
	public async createUser(@Param('emailAddress') emailAddress: string): Promise<void> {
		// Check email is authorized
		const isEmailOK = this.conf.authorizedEmails?.includes(emailAddress);

		if (!isEmailOK) {
			throw new N9Error('email-not-found', 400);
		}

		await this.emailService.sendMail(emailAddress);
	}

	@Get('/authorized')
	public async getAuthorizedEmails(): Promise<{ emails: string[]}> {
		// Check if user exists
		return { emails: this.conf.authorizedEmails };
	}

	@Post('/switch-on/:token')
	public async switchOn(@Param('token') token: string): Promise<void> {
		await this.emailService.switchOn(token);
	}
}
