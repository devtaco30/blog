// published_at(epoch 밀리초 또는 ISO 문자열) → 서울 기준 YYYY-MM-DD. 읽을 수 없으면 ''.
export const formatPostDate = (publishedAt) => {
  if (publishedAt === null || publishedAt === undefined || publishedAt === '') return '';
  const date = new Date(typeof publishedAt === 'string' ? publishedAt : Number(publishedAt));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
};
