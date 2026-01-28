// CommentInput Component
// Input form for adding comments

import { useState } from 'react';
import './CommentInput.css';

function CommentInput({ onSubmit, placeholder = 'Write a comment...', buttonText = 'Post', disabled = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form className="comment-input" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="comment-input__btn"
      >
        {buttonText}
      </button>
    </form>
  );
}

export default CommentInput;
