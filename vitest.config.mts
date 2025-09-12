import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		// Workers 環境では node:inspector 依存が解決できないため coverage は一旦無効化
		// 必要なら node 環境用の別 config を作成して収集する
		coverage: { enabled: false },
	},
});
