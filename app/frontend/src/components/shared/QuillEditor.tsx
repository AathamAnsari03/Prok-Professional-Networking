import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export interface QuillEditorRef {
  focus: () => void;
  blur: () => void;
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  ({ value, onChange, placeholder, className, readOnly = false }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          quill.focus();
        }
      },
      blur: () => {
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          quill.blur();
        }
      },
    }));

    return (
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        readOnly={readOnly}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
          ],
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet',
          'color', 'background',
          'link', 'image'
        ]}
      />
    );
  }
);

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor; 