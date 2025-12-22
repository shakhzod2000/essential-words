'use client';

import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  messages: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function TypingAnimation({
  messages,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentMessage.length) {
          setCurrentText(currentMessage.slice(0, currentText.length + 1));
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseDuration);
          return;
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next message
          setIsDeleting(false);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
          return;
        }
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(handleTyping, speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentMessageIndex, messages, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
      {currentText}
      <span style={{
        borderRight: '3px solid #2563eb',
        animation: 'blink 0.7s infinite',
        marginLeft: '4px',
        display: 'inline-block',
      }}></span>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </h1>
  );
}
