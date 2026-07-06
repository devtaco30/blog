// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom 테스트 환경엔 TextEncoder/TextDecoder가 없어 react-router v7이 모듈 로드 시 에러를 던짐
// (jest-environment-jsdom이 아직 이를 전역으로 제공하지 않음) → Node util에서 폴리필
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
