import { formatPostDate } from './formatPostDate';

describe('formatPostDate', () => {
  it('epoch 밀리초를 서울 기준 YYYY-MM-DD로 바꾼다', () => {
    expect(formatPostDate(1775347200000)).toBe('2026-04-05');
  });

  it('ISO 문자열도 바꾼다', () => {
    expect(formatPostDate('2026-04-05T00:00:00.000Z')).toBe('2026-04-05');
  });

  it('값이 없거나 날짜로 읽을 수 없으면 빈 문자열이다', () => {
    expect(formatPostDate(null)).toBe('');
    expect(formatPostDate(undefined)).toBe('');
    expect(formatPostDate('not a date')).toBe('');
  });
});
