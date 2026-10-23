import { education } from './education';

describe('education 이력서와 맞춘 내용', () => {
  const schools = education.map((item) => item.school);

  it('학점은행 기관 이름은 국가평생교육진흥원이다', () => {
    expect(schools.some((school) => school.includes('국가평생교육진흥원'))).toBe(true);
    expect(schools.some((school) => school.includes('평생진흥교육원'))).toBe(false);
  });

  it('학점은행은 2017.06 - 2020.02, 홍익대는 2006.03 - 2014.03 기간으로 적는다', () => {
    const bank = education.find((item) => item.school.includes('국가평생교육진흥원'));
    const hongik = education.find((item) => item.school.includes('홍익대학교'));
    expect(bank.period).toBe('2017.06 - 2020.02');
    expect(hongik.period).toBe('2006.03 - 2014.03');
  });

  it('이력서의 교육 과정(이스트캠프 와썹 AI, KCI)을 담는다', () => {
    const east = education.find((item) => item.school.includes('이스트캠프'));
    const kci = education.find((item) => item.school.includes('KCI'));
    expect(east.period).toBe('2025.11 - 2026.04');
    expect(kci.period).toBe('2019.12 - 2020.06');
  });

  it('이력서에 없어도 ESMOD 학력은 그대로 둔다', () => {
    const esmod = education.find((item) => item.school.includes('ESMOD'));
    expect(esmod.degree).toBe('란제리 전공');
    expect(esmod.period).toBe('2014.02 졸업');
  });
});
