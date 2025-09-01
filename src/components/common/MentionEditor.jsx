import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/entities/all';

export default function MentionEditor({ value, onChange, placeholder }) {
  const [users, setUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await User.list();
      setUsers(usersData.length > 0 ? usersData : [
        { id: 'demo1', email: 'demo@user.com', full_name: 'Demo User' },
        { id: 'demo2', email: 'sarah@demo.com', full_name: 'Sarah Johnson' },
        { id: 'demo3', email: 'mike@demo.com', full_name: 'Mike Chen' }
      ]);
    } catch (error) {
      console.error("Error loading users:", error);
      // Fallback demo users
      setUsers([
        { id: 'demo1', email: 'demo@user.com', full_name: 'Demo User' },
        { id: 'demo2', email: 'sarah@demo.com', full_name: 'Sarah Johnson' },
        { id: 'demo3', email: 'mike@demo.com', full_name: 'Mike Chen' }
      ]);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(text);
    
    // Find the last @ before the cursor
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's no space or newline after @ (still typing the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentions(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showMentions || filteredUsers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case 'Enter':
        if (!e.shiftKey) {
          e.preventDefault();
          insertMention(filteredUsers[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentions(false);
        break;
      case 'Tab':
        e.preventDefault();
        insertMention(filteredUsers[selectedMentionIndex]);
        break;
    }
  };

  const insertMention = (user) => {
    if (!user) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    
    const textBefore = value.substring(0, mentionStartIndex);
    const textAfter = value.substring(cursorPosition);
    
    const newText = `${textBefore}@${user.full_name} ${textAfter}`;
    onChange(newText);
    setShowMentions(false);
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = textBefore.length + user.full_name.length + 2;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
        rows={4}
      />
      
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute z-50 bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto min-w-[280px]">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b">
            Select a team member
          </div>
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                index === selectedMentionIndex 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
              onClick={() => insertMention(user)}
              onMouseEnter={() => setSelectedMentionIndex(index)}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {user.full_name[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{user.full_name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}