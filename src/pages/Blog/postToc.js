import { useState, useEffect } from 'react';

const TOC_SELECTOR = 'h2, h3';
const ACTIVE_OFFSET_PX = 120;

/** 소제목 글자를 id로 쓸 수 있게 바꾼다. 한글·영문·숫자는 남기고 공백은 -, 나머지 기호는 뺀다. */
export const slugifyHeading = (text) => {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'section';
};

/**
 * 기준선(offset)을 지나간 마지막 소제목의 id. 아직 아무것도 지나가지 않았으면 첫 소제목, 없으면 ''.
 * @param {Array<{id: string, top: number}>} items 화면 위쪽 기준 각 소제목의 위치
 */
export const pickActiveHeadingId = (items, offset = ACTIVE_OFFSET_PX) => {
  if (items.length === 0) return '';
  let active = items[0].id;
  items.forEach((item) => {
    if (item.top <= offset) active = item.id;
  });
  return active;
};

/**
 * 렌더된 글 본문(containerRef 안)의 h2·h3를 모아 목차 항목으로 돌려주고, id가 없는 소제목에는 id를 붙인다.
 * 마크다운 문법을 직접 해석하지 않고 실제로 그려진 DOM에서 읽으므로 굵게·코드 같은 인라인 서식이 있어도 어긋나지 않는다.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {*} contentKey 본문이 바뀌면 다시 모으기 위한 값
 * @returns {Array<{id: string, text: string, level: 2 | 3}>}
 */
export const usePostHeadings = (containerRef, contentKey) => {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHeadings([]);
      return;
    }
    const used = new Set();
    const found = Array.from(container.querySelectorAll(TOC_SELECTOR)).map((element) => {
      const text = element.textContent.trim();
      let id = element.id;
      if (!id) {
        const base = slugifyHeading(text);
        id = base;
        let suffix = 2;
        while (used.has(id)) id = `${base}-${suffix++}`;
        element.id = id;
      }
      used.add(id);
      return { id, text, level: element.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(found);
  }, [containerRef, contentKey]);

  return headings;
};

/** 스크롤 위치에 따라 지금 읽고 있는 소제목의 id를 돌려준다. */
export const useActiveHeadingId = (headings) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId('');
      return undefined;
    }
    let frame = null;
    const update = () => {
      frame = null;
      const items = headings
        .map(({ id }) => {
          const element = document.getElementById(id);
          return element ? { id, top: element.getBoundingClientRect().top } : null;
        })
        .filter(Boolean);
      setActiveId(pickActiveHeadingId(items));
    };
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [headings]);

  return activeId;
};
