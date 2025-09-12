import { describe, it, expect } from 'vitest';
import { decodeBasicAuth } from '../../src/utils/basicAuth';

describe('decodeBasicAuth', () => {
	describe('正常系', () => {
		it('正常なBasicヘッダーをデコードできる', () => {
			const header = 'Basic ' + btoa('user:pass');
			expect(decodeBasicAuth(header)).toEqual({ user_id: 'user', password: 'pass' });
		});
	});

	describe('異常系', () => {
		it('不正なフォーマット(プレフィックスなし)ならばエラー', () => {
			expect(() => decodeBasicAuth('Bearer abc')).toThrowError('Invalid Basic Auth format');
		});

		it('不正なフォーマット(コロン数が不足)ならばエラー', () => {
			const header = 'Basic ' + btoa('onlyuser');
			expect(() => decodeBasicAuth(header)).toThrowError('Invalid Basic Auth format');
		});
	});
});
