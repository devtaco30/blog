import { experience } from './experience';

describe('experience', () => {
  it('해빗웍스가 가장 최근 경력으로 맨 앞에 있고 2026.04 에 시작해 현재 진행 중이다', () => {
    expect(experience[0].company).toBe('해빗웍스 (Habitworks)');
    expect(experience[0].period).toBe('2026.04 - 현재');
  });

  it('해빗웍스 다음에 기존 경력(블루밍비트)이 이어진다', () => {
    expect(experience[1].company).toBe('블루밍비트');
  });
});
