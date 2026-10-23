export const projects = [
  {
    title: '[Side Build] Apex — AI 면접 멘토',
    description: [
      '진단 → 학습 → 복습 → 성장 추적 루프를 제공하는 **AI 면접 멘토 서비스**',
      '개념 학습 · 코드 리뷰 · 설계 면접의 **3세션 구조**',
      '대화 · 진단 · 평가 · 계획 · 회고 **역할별 LLM 에이전트 분리**',
      'tool 정의로 응답 형식을 고정하고 같은 스키마로 **재검증**',
      '프롬프트 수정 전후를 **재실행 비교**로 평가하는 기준 수립'
    ],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Redis', 'Claude API', 'React', 'Docker', 'Fly.io'],
    period: '2026.04 - 현재'
  },
  {
    title: '[Side Build] 주식 매매 엔진 — 주문 체결 코어',
    description: [
      '같은 매매 플로우를 **DB 락 기반 분산 처리**(v1)와 **인메모리 Single Writer**(v2) 두 가지로 구현해 비교',
      'v2는 **링버퍼 단일 스레드** 메모리 계좌와 **UDP(Aeron)** 통신으로 주문 경로에서 브로커·DB 락 제거',
      '동일 주문 워크로드(초당 192건)에서 주문 발행 → 첫 체결 **p99 14.6ms → 1.6ms** (약 89% 단축)',
      '검토한 대안(락 안 쿼리 최적화, 조건부 원자 UPDATE, Redis Lua)과 트레이드오프를 **ADR로 기록**'
    ],
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Redis', 'LMAX Disruptor', 'Aeron', 'JMH', 'k6'],
    period: '2026.02 - 현재'
  },
  {
    title: '[Side Build] Grit — 운동 기록 앱',
    description: [
      'PT 수업 기록 · 개인 운동 로그 · 팁 노트 검색 · 루틴 · Streak를 **한 앱으로 통합**',
      '공개 데이터셋 4종 10,242장으로 **YOLOv8s 학습**',
      '**온디바이스 ML 추론**으로 바벨 경로 분석, Galaxy A36 기준 처리 시간 **108초 → 20초** (81% 단축)'
    ],
    technologies: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'React Native', 'Python', 'YOLO', 'OpenCV'],
    period: '2026.04 - 2026.06'
  },
  {
    title: '[블루밍비트] FCM Push 기능 고도화',
    description: [
      '**OneSignal → FCM** 전환 및 설정 누락 이슈 해결',
      '**MongoDB → MySQL** 마이그레이션 완료',
      '**푸시 타입 추상화** 및 **토픽 기반 구독 시스템** 설계',
      '**실시간 푸시 알림** 시스템 구축'
    ],
    technologies: ['Kotlin', 'Spring Boot 3', 'Kafka', 'FCM', 'MySQL'],
    period: '2024.12 - 2025.04'
  },
  {
    title: '[블루밍비트] 뉴스 자동 공유 기능 개선',
    description: [
      '**Kafka** 기반 데이터 처리 파이프라인 구축',  
      '**KafkaStream + KTable** 기반 데이터 처리 파이프라인 추가',
      '**SNS별 전송 조건** 설계 및 **토큰 관리 자동화**',
      '**에러 복구 메커니즘** 구현으로 안정성 향상'
    ],
    technologies: ['Kotlin', 'Spring Boot 3', 'Kafka', 'KafkaStreams'],
    period: '2024.10 - 2024.11'
  },
  {
    title: '[블루밍비트] 통합 검색 서비스 MSA 개발',
    description: [
      '**자산, 뉴스, 커뮤니티** 검색 기능 통합',
      '**Query Generator** 및 **하이라이팅 처리기** 구현',
      '검색 응답 지연 **1.5~3초 → 200~450ms** 단축',
      '**글로벌 확장성**을 고려한 모델링 설계',
      '**ElasticSearch** 최적화'
    ],
    technologies: ['Kotlin', 'Spring Boot 3', 'ElasticSearch'],
    period: '2024.10 - 2024.10'
  },
  {
    title: '[블루밍비트] WorldCoin 회원 가입 및 로그인 기능',
    description: [
      '**JWT 기반 인증** 시스템 구축',
      '**World ID 연동**으로 보안 강화',
      '사용자 인증 **안정성 확보**',
      '**OAuth 2.0** 표준 준수'
    ],
    technologies: ['Java', 'Spring Boot', 'JWT', 'World ID'],
    period: '2024.08 - 2024.08'
  },
  {
    title: '[블루밍비트] 가상 자산 거래소 연결 서비스',
    description: [
      '**가상 자산 포트폴리오 API** 구현',
      '**다중 거래소 연동** 서비스 개발',
      '**OAuth2** 인증 시스템 구축',
      '(현재 해당 서비스 중단)'
    ],
    technologies: ['Java', 'Spring Boot', 'OAuth2'],
    period: '2023.12 - 2024.01'
  },
  {
    title: '[블루밍비트] Backend MSA 리빌딩',
    description: [
      '**기존 MSA 프로젝트 재분류** 및 **Core 모듈화**',
      '**Spring Cloud Config** 도입',
      '**AWS Secrets Manager** 연동',
      '시스템 **안정성 및 확장성** 향상'
    ],
    technologies: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'AWS'],
    period: '2023.09 - 2023.12'
  },
  {
    title: '[블루밍비트] AWS 운영환경 및 개발환경 구축 및 2.0 배포',
    description: [
      '**AWS 운영환경** 및 **개발환경** 구축',
      '**Jenkins** CI/CD 구축',
      '**2.0 버전 배포** 완료',
      '**인프라 자동화** 구축'
    ],
    technologies: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'AWS'],
    period: '2023.08 - 2023.09'
  },
  {
    title: '[웨이브릿지] MarketInfo & MarketData 수집 시스템',
    description: [
      '**시장 데이터 수집 시스템** 개선',
      'Node.js 기반 거래소 API 통합 라이브러리**(ccxt)** 활용'
    ],
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS'],
    period: '2022.12 - 2023.05'
  },
  {
    title: '[웨이브릿지] 가상자산 Index 시스템 구축 및 고도화',
    description: [
      '**가상자산 거래소 Orderbook/Trade 데이터** 활용',
      '**기준 지수 산출 시스템** 설계 및 구축',
      '**Elastic-Job 기반 배치** 리팩토링',
      '**WebSocket** 실시간 데이터 처리',
      '**실시간/분단위 지수 계산** 엔진 개발',
      '**데이터 품질 검증** 시스템 구축',
      '**성능 모니터링** 및 **알림 시스템** 구현',
      '초기 구축시 **BE, FE, DevOps 모두 구축**',
      '**API 게이트웨이** 구축으로 외부 서비스 연동'
    ],
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'WebSocket', 'AWS', 'Jenkins', 'Elastic-Job', 'Zookeeper'],
    period: '2020.08 - 2022.07'
  }
];
