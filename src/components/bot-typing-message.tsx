'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BotTypingMessage = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent('');
    if (content) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          setDisplayedContent((prev) => prev + content.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 15); // Typing speed in ms

      return () => clearInterval(typingInterval);
    }
  }, [content]);

  return (
    <div className="flex-1 prose dark:prose-invert leading-relaxed text-base pt-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
    </div>
  );
};

export default BotTypingMessage;
