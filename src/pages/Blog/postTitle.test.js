import { splitTitlePrefix } from './postTitle';

describe('splitTitlePrefix', () => {
  it('맨 앞 [대괄호] 묶음을 시리즈 이름과 나머지 제목으로 나눈다', () => {
    expect(splitTitlePrefix('[Java Deep Dive] Serializable 깊이 파기 — Part 2: 바이트에서 다시 객체로')).toEqual({
      prefix: 'Java Deep Dive',
      title: 'Serializable 깊이 파기 — Part 2: 바이트에서 다시 객체로',
    });
  });

  it('대괄호 안에 공백이나 한글이 있어도 된다', () => {
    expect(splitTitlePrefix('[6년차 쯤 되면 좀 알자] 그럼 GC 는 뭔데? - 1부 -')).toEqual({
      prefix: '6년차 쯤 되면 좀 알자',
      title: '그럼 GC 는 뭔데? - 1부 -',
    });
  });

  it('대괄호가 맨 앞에 없으면 나누지 않는다', () => {
    expect(splitTitlePrefix('EST AI - Python(base)')).toEqual({ prefix: null, title: 'EST AI - Python(base)' });
    expect(splitTitlePrefix('제목 중간의 [대괄호] 는 그대로')).toEqual({ prefix: null, title: '제목 중간의 [대괄호] 는 그대로' });
  });

  it('대괄호 뒤에 제목이 없으면 나누지 않는다 (제목이 통째로 사라지지 않게)', () => {
    expect(splitTitlePrefix('[Only Prefix]')).toEqual({ prefix: null, title: '[Only Prefix]' });
  });

  it('빈 값이면 빈 제목이다', () => {
    expect(splitTitlePrefix('')).toEqual({ prefix: null, title: '' });
    expect(splitTitlePrefix(undefined)).toEqual({ prefix: null, title: '' });
  });
});
