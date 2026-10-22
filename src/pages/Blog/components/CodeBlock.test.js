import React from 'react';
import { render, screen } from '@testing-library/react';
import CodeBlock from './CodeBlock';

describe('CodeBlock', () => {
  it('언어 이름을 대문자로 위에 보여 주고 없으면 TEXT로 보여 준다', () => {
    const { unmount } = render(<CodeBlock language="java" code="int a = 1;" />);
    expect(screen.getByText('JAVA')).toBeInTheDocument();
    unmount();
    render(<CodeBlock language={null} code="plain" />);
    expect(screen.getByText('TEXT')).toBeInTheDocument();
  });

  it('줄마다 줄 번호가 붙고 코드 글자는 그대로 보인다', () => {
    render(<CodeBlock language="text" code={'첫 줄\n둘째 줄\n\n넷째 줄'} />);
    ['1', '2', '3', '4'].forEach((n) => expect(screen.getByText(n)).toBeInTheDocument());
    expect(screen.getByText('첫 줄')).toBeInTheDocument();
    expect(screen.getByText('넷째 줄')).toBeInTheDocument();
  });

  it('끝에 붙은 빈 줄 하나는 줄 번호로 세지 않는다', () => {
    render(<CodeBlock language="text" code={'a\nb\n'} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });
});
