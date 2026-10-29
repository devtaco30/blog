import { skills, getProgressBarConfig } from './skills';

describe('skills AI 도구', () => {
  it('Claude Code 와 Cursor 가 AI 도구로 들어 있다', () => {
    expect(skills.ai.map((s) => s.name)).toEqual(expect.arrayContaining(['Claude Code', 'Cursor']));
  });

  it('두 도구의 숙련도는 중간 단계(Proficient)이다', () => {
    expect(getProgressBarConfig('Claude Code', 'AI Tools').level).toBe('Proficient');
    expect(getProgressBarConfig('Cursor', 'AI Tools').level).toBe('Proficient');
  });
});

describe('skills 이력서에 있는 기술', () => {
  const names = (list) => list.map((s) => (typeof s === 'string' ? s : s.name));

  it.each(['Python', 'Swift', 'React Native', 'MSA', 'Event-Driven'])('주력·활용 기술에 %s 가 있다', (name) => {
    expect(names(skills.main)).toContain(name);
  });

  it('Infrastructure 에 OpenSearch 가 있고 ElasticSearch 도 그대로 있다', () => {
    expect(skills.infrastructure).toEqual(expect.arrayContaining(['OpenSearch', 'ElasticSearch']));
  });

  it('AI 도구에 Claude API 가 있고 Claude Code, Cursor 도 그대로 있다', () => {
    expect(names(skills.ai)).toEqual(['Claude Code', 'Cursor', 'Claude API']);
  });

  it('새로 넣은 기술의 숙련도가 매핑되어 있다', () => {
    expect(getProgressBarConfig('MSA', 'Core Skills').level).toBe('Advanced');
    expect(getProgressBarConfig('Python', 'Core Skills').level).toBe('Proficient');
    expect(getProgressBarConfig('OpenSearch', 'Infrastructure').level).toBe('Proficient');
    expect(getProgressBarConfig('Claude API', 'AI Tools').level).toBe('Proficient');
  });
});
