
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BotTypingMessageProps {
    content: string;
    animate: boolean;
    onAnimationComplete: () => void;
}

const BotTypingMessage = ({ content, animate, onAnimationComplete }: BotTypingMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (animate) {
      setDisplayedContent(''); // Reset on new animated message
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          setDisplayedContent(content.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          onAnimationComplete();
        }
      }, 15);

      return () => clearInterval(typingInterval);
    } else {
      // If not animating, just show the full content immediately.
      setDisplayedContent(content);
    }
  }, [content, animate, onAnimationComplete]);

  return (
    <div className="flex-1 prose dark:prose-invert leading-relaxed text-base pt-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
    </div>
  );
};

export default BotTypingMessage;
