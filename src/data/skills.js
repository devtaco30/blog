export const skills = {
  main: [
    { name: 'Java', level: 'Expert' },
    { name: 'Kotlin', level: 'Expert' },
    { name: 'Spring Boot', level: 'Expert' },
    { name: 'JPA/Hibernate', level: 'Expert' }
  ],
  infrastructure: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch', 'Kafka'],
  tools: ['Git', 'Docker', 'AWS', 'Jenkins'],
  ai: [
    { name: 'Claude Code', icon: 'claude.svg' },
    { name: 'Cursor', icon: 'cursor.svg' }
  ],
  frontend: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript']
};

// 숙련도에 따른 프로그레스 바 설정 함수
export const getProgressBarConfig = (skillName, category) => {
  // 스킬별 레벨 매핑
  const skillLevels = {
    'Core Skills': {
      'Java': 'Expert',
      'Kotlin': 'Expert',
      'Spring Boot': 'Expert',
      'JPA/Hibernate': 'Expert'
    },
    'Infrastructure': {
      'MySQL': 'Advanced',
      'PostgreSQL': 'Advanced',
      'MongoDB': 'Proficient',
      'Redis': 'Advanced',
      'ElasticSearch': 'Proficient',
      'Kafka': 'Proficient'
    },
    'AI Tools': {
      'Claude Code': 'Proficient',
      'Cursor': 'Proficient'
    },
    'Tools': {
      'Git': 'Advanced',
      'Docker': 'Advanced',
      'AWS': 'Advanced',
      'Jenkins': 'Basic'
    }
  };
  
  // 레벨별 설정 매핑
  const levelConfigs = {
    'Expert': { width: '100%', color: '#00ff00' },
    'Advanced': { width: '80%', color: '#00ffff' },
    'Proficient': { width: '50%', color: '#ffff00' },
    'Basic': { width: '30%', color: '#ff8800' }
  };
  
  const level = skillLevels[category]?.[skillName] || 'Basic';
  const config = levelConfigs[level];
  
  return { ...config, level };
};
