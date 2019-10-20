import schedule from 'node-schedule';

import {
	Database,
	Parser,
	Tweeter,
} from '~/libs';

import {
	sleep,
} from '~/helpers';

export class App {
	private readonly database: Database;
	private readonly parser: Parser;
	private readonly tweeter: Tweeter;

	public constructor() {
		this.database = new Database();
		this.parser = new Parser();
		this.tweeter = new Tweeter(__config);
	}

	private async parse(): Promise<void> {
		const items = await this.parser.parse();
		for (const item of items) {
			await this.database.insertItem(item);
		}
	}

	private async tweet(): Promise<void> {
		const items = await this.database.getUntweetedItems();
		for (const item of items) {
			await this.tweeter.tweetItem(item);
			await this.database.updateItem(item);
			await sleep(1000);
		}
	}

	public async start() {
		schedule.scheduleJob('* * * * *', async () => {
			const date = new Date();
			console.log('parse', date);

			await this.parse();
			await this.tweet();
		});
	}
}
