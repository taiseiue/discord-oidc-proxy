import { describe, it, expect } from 'vitest';
import { timingSafeStringEqual } from '../../src/utils/crypto';

describe('timingSafeStringEqual', () => {
	describe('正常系', () => {
		it('同じ文字列ならtrue', () => {
			expect(timingSafeStringEqual('abc', 'abc')).toBe(true);
		});
	});
	describe('異常系', () => {
		it('長さが異なる文字列ならfalse', () => {
			expect(timingSafeStringEqual('abc', 'abcd')).toBe(false);
		});

		it('内容が異なる同じ長さの文字列ならfalse', () => {
			expect(timingSafeStringEqual('abcd', 'abce')).toBe(false);
		});
	});
});
