import React, { useState, useRef, useEffect } from 'react';

const AutoExpandTextarea = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  conversationId,
  textareaRef
  // autoFocus,
}) => {
  const [height, setHeight] = useState(45);
  const handleChange = event => {
    onChange(event);
    if (event.target.value === '') {
      setHeight(45); // Set height to 45px when there's no content in the textarea
    } else {
      setHeight('auto');
      setHeight(textareaRef.current.scrollHeight);
    }
  };

  useEffect(() => {
    if (textareaRef.current && value !== '') {
      setHeight(textareaRef.current.scrollHeight);
    }
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [conversationId]);

  useEffect(() => {
    if (value === '' && height !== 45) {
      setHeight(45);
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      // autoFocus={autoFocus}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      style={{
        height: height,
        minHeight: '45px',
        maxHeight: '120px',
        resize: 'none',
        overflow: 'auto'
      }}
    />
  );
};

export default AutoExpandTextarea;
