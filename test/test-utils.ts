import { IAppContext } from '../src/types';

/**
 * テスト用のメモリベースKVストレージ実装
 */
export class MemoryKV {
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
	jwtPrivateKey: 'test-private-key',
	jwtPublicKey: 'test-public-key',
};

/**
 * 本物のRSA鍵ペア（複雑なテストで必要な場合のみ使用）
 */
export const realRSAKeys = {
	privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+owYpUK4vzhbI
l1F1UQANOtiqCJT8a+OSjhYOIgpOIGTf45KeQXPKiK8vv56Pgky7YvSr4AlBkHe+
b/rKppUkY6Zc7udEkMt2L8SAuAC3oJELAAn+hVf0GdStZ1dc3Z4KnQfB3EM+R3X/
HNzYKEaNNftDmNZXe+qJxmrhYR44AQGcd20NIBHY8ZelpyjtlTLOxsEiDZKT3fSi
aA3Stvc0biULJaBXDsgSh3QUe5MshzuNpKWTd9uY3vpkeJ1BGT9cnxyH1+J+9fNm
pSzURMT/SX2+QOKUN8Nr4PO+elgy5K3H62ES+ts+clchCz7U5+0fn6ENw+Z82Duw
9SlMXrq5AgMBAAECggEAbhIS7Kf46wFDhm5YSjSKoxjnIMXzwAtLSsNfWKmu6Y0q
sVrkvRttj/N7s0Ygdxv00f1A6DxjG8geW4asd3XXhztCQ0Ztodk4oPTTsL6NK3k6
Re+v1ZWIQxjnA3g3qRcMuXQRlo1nBf6c0sAHg4c9tSsF+PG2UKzrrsEx1RAOMqbi
dRFm0iR8NrlOL+Fh0iNgmkZR2Wuh5YD2CQ3ZNoNehYA76LBgjokamwRtjIKpAxgq
6kTGyi1F5U3XmLcmtORGxgmsWCLSvQ/pjSCpUtiWquTIFhHzBVqyp78ZaZJ/I9t0
q5SSH3sTo19ZWeLOCsaeW5TRNGOD3lsac9SI+pDlQQKBgQDrjauVrj3Tx89O/0JJ
mDw0/iTx1l9Emlvy479Pd/Er4m3tAwLAPT8vKJG1gdixGnTcaKuR7LQbZOsAuwEC
lPhoL/nPqSvlpNKWlbCr9aafYMlTLRdBTzJ+ZxUGz5ZWEHgSTkW9Di6kAXbA3jWE
HVYjm4Swyis0laZlzvp9ef/IuwKBgQDPLz5kf5sHOBCbSYXEdvoKtkgZxSYp69l/
yF/8yFcGeG+zshs8VUfLwuPTdTEwL0o9Wv1KifGlcu0tQCcuj+kD6wvK2uONXDsh
u/6igpirmmsJzbZJiqNA442tOe6qaa+pZCbmq59hkpWkYPP8AVx3/hN9yVsMKr8k
6LJ+QbA9GwKBgQDkBvJK5TFfGfebHso52lC2cCytnHv/Onq2qDikIpVqiTknDxoT
pXbMHTbpAfkWgWkNkZo9mmpEdq50t5Njv3i1y3PGzpr7JVLjiadM4HJbqWNbzLPN
enCEIyAcxspfKHRELFegi+EkzXH7hWFDMu8Xa07JofyvXAuIVRTycS7nTwKBgHJv
H8EWkiQsnU+IDnBzXqwn/i7tq6Sf9iQUIqBWb2rNfrT7/PsYB23OGVQkeKSqmhDF
fv16r5O4pLPHqVyYdBWL75l9yQ29EZQSaBSOmZC+27wweSypfH5MsWYqh15svW+M
N8hUptWXxzthqaFZhx9noJBrdPSFb8oNFPmTgqpdAoGBAOb/XSgYebW7Q3RY2p02
jQVjyZE/A9is6L/nzrGQuRWsLsuyzbBELQpUaiN0eL9ZXXoLw4a3JOOY/lQOR7IZ
t/lmRCQO1dVrBdb2Ab0hYdcU8uZU+IaOYV1x8cfnJ5WW2IBjMPCU1WacnpiaggEk
vthorZZUtvj/cwLcPSg5uCw5
-----END PRIVATE KEY-----`,
	publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvqMGKVCuL84WyJdRdVEA
DTrYqgiU/Gvjko4WDiIKTiBk3+OSnkFzyoivL7+ej4JMu2L0q+AJQZB3vm/6yqaV
JGOmXO7nRJDLdi/EgLgAt6CRCwAJ/oVX9BnUrWdXXN2eCp0HwdxDPkd1/xzc2ChG
jTX7Q5jWV3vqicZq4WEeOAEBnHdtDSAR2PGXpaco7ZUyzsbBIg2Sk930omgN0rb3
NG4lCyWgVw7IEod0FHuTLIc7jaSlk3fbmN76ZHidQRk/XJ8ch9fifvXzZqUs1ETE
/0l9vkDilDfDa+DzvnpYMuStx+thEvrbPnJXIQs+1OftH5+hDcPmfNg7sPUpTF66
uQIDAQAB
-----END PUBLIC KEY-----`,
};

/**
 * テスト用のAppContextを作成する
 */
export function createTestContext(useRealKeys = false): IAppContext {
	const storage = new MemoryKV();

	return {
		config: {
			...testConfig,
			...(useRealKeys ? realRSAKeys : {}),
		},
		storage,
	};
}

/**
 * テスト用のクリーンアップユーティリティ
 */
export function cleanupTestContext(context: IAppContext): void {
	if (context.storage instanceof MemoryKV) {
		context.storage.clear();
	}
}
