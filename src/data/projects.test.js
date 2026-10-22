import { projects } from './projects';

describe('projects Side Builds', () => {
  const titles = projects.map((project) => project.title);

  it.each(['Apex', 'Grit', '주식 매매 엔진'])('%s 항목이 있다', (name) => {
    expect(titles.some((title) => title.includes(name))).toBe(true);
  });

  it('Side Build가 회사 프로젝트보다 앞에 온다', () => {
    const firstCompany = titles.findIndex((title) => title.startsWith('[블루밍비트]') || title.startsWith('[웨이브릿지]'));
    const lastSideBuild = Math.max(...titles.map((title, index) => (title.startsWith('[Side Build]') ? index : -1)));
    expect(lastSideBuild).toBeLessThan(firstCompany);
  });

  it('주식 매매 엔진은 이력서의 p99 수치를 담는다', () => {
    const engine = projects.find((project) => project.title.includes('주식 매매 엔진'));
    expect(engine.description.join(' ')).toContain('14.6ms → 1.6ms');
  });

  it('모든 항목에 기간과 기술 스택이 있다', () => {
    projects.forEach((project) => {
      expect(project.period).toBeTruthy();
      expect(project.technologies.length).toBeGreaterThan(0);
    });
  });
});
