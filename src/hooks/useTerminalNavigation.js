import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTerminalNavigation = () => {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const navigate = useNavigate();

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (event) => {
      // 터미널 열기/닫기 단축키 (Ctrl/Cmd + M)
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        setTerminalOpen(!terminalOpen);
        return;
      }

      // 터미널이 닫혀있으면 다른 키 무시
      if (!terminalOpen) return;
      
      switch(event.key) {
        case '1':
          navigate('/posts');
          setTerminalOpen(false);
          break;
        case '2':
          navigate('/about');
          setTerminalOpen(false);
          break;

        case 'g':
          window.open('https://github.com/devtaco30', '_blank');
          setTerminalOpen(false);
          break;
        case 'e':
          window.location.href = 'mailto:devtaco@naver.com';
          setTerminalOpen(false);
          break;
        case 'l':
          window.open('https://www.linkedin.com/in/jonghyuk-park-02b1a1203', '_blank');
          setTerminalOpen(false);
          break;
        case 'Escape':
        case 'q':
        case 'Q':
          setTerminalOpen(false);
          break;
        default:
          break;
      }
    };

    // 항상 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [terminalOpen, navigate]);

  const handleNavigationClick = (command) => {
    switch(command) {
      case 'about':
        navigate('/about');
        setTerminalOpen(false);
        break;
      case 'posts':
        navigate('/posts');
        setTerminalOpen(false);
        break;

      case 'github':
        window.open('https://github.com/devtaco30', '_blank');
        setTerminalOpen(false);
        break;
      case 'email':
        window.location.href = 'mailto:devtaco@naver.com';
        setTerminalOpen(false);
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/in/jonghyuk-park-02b1a1203', '_blank');
        setTerminalOpen(false);
        break;
      default:
        break;
    }
  };

  const toggleTerminal = () => setTerminalOpen(!terminalOpen);
  const closeTerminal = () => setTerminalOpen(false);

  return {
    terminalOpen,
    toggleTerminal,
    closeTerminal,
    handleNavigationClick
  };
};
