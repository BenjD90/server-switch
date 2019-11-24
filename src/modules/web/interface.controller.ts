import { Controller, Get, Res } from '@flyacts/routing-controllers';
import * as appRootDir from 'app-root-dir';
import { Response } from 'express';
import * as fs from 'fs-extra';

@Controller('/')
export class InterfaceController {

	@Get('')
	public getIndex(@Res() res: Response): void {
		res
				.contentType('text/html')
				.header('Content-Disposition', 'inline')
				.send(fs.readFileSync(appRootDir.get() + '/static/index.html'));
	}

	@Get('token/:token')
	public getTokenPage(@Res() res: Response): void {
		res
				.contentType('text/html')
				.header('Content-Disposition', 'inline')
				.send(fs.readFileSync(appRootDir.get() + '/static/token.html'));
	}
}
