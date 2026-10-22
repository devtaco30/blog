const PREFIX_PATTERN = /^\[([^\]]+)\]\s*(.+)$/;

/**
 * 제목 맨 앞의 [대괄호] 묶음(시리즈 이름)을 떼어 낸다. 긴 제목을 읽기 쉽게 시리즈 이름을 따로 보여 주기 위해서다.
 * 대괄호가 맨 앞에 없거나 그 뒤에 제목이 없으면 나누지 않고 제목을 그대로 돌려준다.
 * @returns {{prefix: string | null, title: string}}
 */
export const splitTitlePrefix = (fullTitle) => {
  const title = fullTitle || '';
  const match = PREFIX_PATTERN.exec(title);
  if (!match) return { prefix: null, title };
  return { prefix: match[1], title: match[2] };
};
