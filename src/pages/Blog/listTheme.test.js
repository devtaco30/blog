import { getAreaColor, ACCENT, TAG_PILL, TAG_MORE_PILL } from './listTheme';

describe('getAreaColor', () => {
  it('머신러닝·딥러닝 영역은 보라색 글자와 연보라 배경이다', () => {
    expect(getAreaColor('ml-dl')).toEqual({ color: '#7c3aed', bg: '#f1eafe' });
  });

  it('색을 가진 영역 다섯 개가 표의 값과 같다', () => {
    expect(getAreaColor('python-data')).toEqual({ color: '#2563eb', bg: '#e6efff' });
    expect(getAreaColor('language-runtime')).toEqual({ color: '#d97706', bg: '#fff1dc' });
    expect(getAreaColor('product')).toEqual({ color: '#0f9d8a', bg: '#dff5f1' });
    expect(getAreaColor('dev-tools')).toEqual({ color: '#db2777', bg: '#fde6f0' });
  });

  it('글이 1편뿐인 영역과 모르는 key와 값이 없을 때는 회색이다', () => {
    const gray = { color: '#6b7280', bg: '#eef0f3' };
    expect(getAreaColor('blockchain')).toEqual(gray);
    expect(getAreaColor('cloud-infra')).toEqual(gray);
    expect(getAreaColor('unknown')).toEqual(gray);
    expect(getAreaColor(null)).toEqual(gray);
    expect(getAreaColor(undefined)).toEqual(gray);
  });
});

describe('색 상수', () => {
  it('강조색은 인디고이고 선택 배경은 연한 인디고이다', () => {
    expect(ACCENT).toEqual({ main: '#4f46e5', selectedBg: '#e8e7fd' });
  });

  it('기술 태그 알약은 인디고 배경에 흰 글자이다', () => {
    expect(TAG_PILL).toEqual({ color: '#ffffff', bg: '#4f46e5' });
  });

  it('+N 알약은 연한 인디고 배경에 인디고 글자이다', () => {
    expect(TAG_MORE_PILL).toEqual({ color: '#4f46e5', bg: '#e8e7fd' });
  });
});
