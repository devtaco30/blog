import { useState, useEffect } from 'react';
import { getPublishedPostTagLists } from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';
import { countTags } from './tagCounts';

// UI용 "전체" 카테고리 (DB에는 존재하지 않음)
export const ALL_CATEGORY = { key: 'all', name: '전체', sort_order: 0, is_active: true };

/**
 * 글 목록·글 상세가 같이 쓰는 사이드바 데이터.
 * 영역 목록(맨 앞에 "전체"), 영역별 개수, 기술 태그별 개수를 불러온다.
 * 개수는 항상 전체 발행 글 기준이다. 불러오지 못한 항목은 빈 값으로 두어 화면이 깨지지 않게 한다.
 */
export const useListSidebarData = () => {
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [tagCounts, setTagCounts] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await getAllCategories();
        if (categoriesError) throw categoriesError;
        if (isCancelled) return;
        setCategories([ALL_CATEGORY, ...(categoriesData || [])]);

        const { data: countsData, error: countsError } = await getPostCountsByAllCategories();
        if (!isCancelled && !countsError && countsData) setCategoryCounts(countsData);
      } catch (error) {
        console.error('카테고리를 불러오는데 실패했습니다:', error);
        if (!isCancelled) setCategories([ALL_CATEGORY]);
      }
    };

    fetchCategories();
    getPublishedPostTagLists().then(({ data, error }) => {
      if (isCancelled || error || !data) return;
      setTagCounts(countTags(data));
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { categories, categoryCounts, tagCounts };
};
