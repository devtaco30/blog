import { skills, getProgressBarConfig } from './skills';

describe('skills AI 도구', () => {
  it('Claude Code 와 Cursor 가 AI 도구로 들어 있다', () => {
    expect(skills.ai.map((s) => s.name)).toEqual(['Claude Code', 'Cursor']);
  });

  it('두 도구의 숙련도는 중간 단계(Proficient)이다', () => {
    expect(getProgressBarConfig('Claude Code', 'AI Tools').level).toBe('Proficient');
    expect(getProgressBarConfig('Cursor', 'AI Tools').level).toBe('Proficient');
  });
});
