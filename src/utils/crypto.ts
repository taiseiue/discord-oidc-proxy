/**
 * 文字列同士を安全に比較する
 * @param a 比較対象の文字列
 * @param b 比較対象の文字列
 * @returns 文字列が等しい場合はtrue、そうでなければfalse
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
	const encoder = new TextEncoder();
	const bufferA = encoder.encode(a);
	const bufferB = encoder.encode(b);

	if (bufferA.length !== bufferB.length) {
		return false;
	}

	return crypto.subtle.timingSafeEqual(bufferA, bufferB);
}
