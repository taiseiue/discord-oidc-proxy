import { IAppContext } from '../src/types';
import { generateKeyPairSync } from 'crypto';

/**
 * テスト用のメモリベースKVストレージ実装（名前を衝突しないよう TestMemoryKV に）
 */
export class TestMemoryKV {
	store = new Map<string, string>();

	async get(key: string): Promise<string | null> {
		return this.store.get(key) ?? null;
	}

	async put(key: string, value: string): Promise<void> {
		this.store.set(key, value);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}
}

/**
 * テスト用の設定データ（シンプルなダミー鍵を使用）
 */
export const testConfig = {
	oidcIssuer: 'https://issuer.example.com',
	oidcAudience: 'aud',
	oidcClientSecret: 'unused',
	discordClientId: 'discId',
	discordClientSecret: 'discSecret',
	targetGuildId: 'target-guild-id',
	jwtPrivateKey: 'test-private-key',
	jwtPublicKey: 'test-public-key',
};

/**
 * テスト実行時にランタイムでRSA鍵ペアを生成する（秘密鍵をリポジトリに含めないため）
 */
export function generateRSAKeys(): { jwtPrivateKey: string; jwtPublicKey: string } {
	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: { type: 'spki', format: 'pem' },
		privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
	});

	return { jwtPrivateKey: privateKey, jwtPublicKey: publicKey };
}

/**
 * テスト用のAppContextを作成する
 */
export function createTestContext(useRealKeys = false): IAppContext {
	const storage = new TestMemoryKV();

	return {
		config: {
			...testConfig,
			...(useRealKeys ? generateRSAKeys() : {}),
		},
		storage,
	};
}

/**
 * テスト用のクリーンアップユーティリティ
 */
export function cleanupTestContext(context: IAppContext): void {
	if (context.storage instanceof TestMemoryKV) {
		context.storage.clear();
	}
}
