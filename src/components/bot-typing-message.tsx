
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BotTypingMessageProps {
    content: string;
    animate: boolean;
}

const BotTypingMessage = ({ content, animate }: BotTypingMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState(animate ? '' : content);

  useEffect(() => {
    if (animate) {
      setDisplayedContent('');
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          setDisplayedContent(content.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 15);

      return () => clearInterval(typingInterval);
    } else {
        setDisplayedContent(content);
    }
  }, [content, animate]);

  return (
    <div className="flex-1 prose dark:prose-invert leading-relaxed text-base pt-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
    </div>
  );
};

export default BotTypingMessage;
