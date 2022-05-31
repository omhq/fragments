import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";

interface IEditorProps {
  data: string;
  language: string;
  onChange: any;
  disabled: boolean;
}

const CodeEditor = (props: IEditorProps) => {
  const { data, language, onChange, disabled } = props;
  const [code, setCode] = useState("");

  useEffect(() => {
    setCode(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`bg-gray-100 dark:bg-gray-900 p-2 rounded min-h-0 h-96 overflow-y-auto`}>
      <Editor
        value={code}
        onValueChange={(code) => {
          onChange(code)
          setCode(code)
        }}
        highlight={(code) => {
          if (language === "json") {
            return highlight(code, languages.json, '');
          }

          if (language === "bash") {
            return highlight(code, languages.bash, '');
          }

          if (language === "sql") {
            return highlight(code, languages.sql, '');
          }

          if (language === "python") {
            return highlight(code, languages.python, '');
          }

          return code;
        }}
        padding={0}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          minWidth: "100%",
          minHeight: "100%",
          whiteSpace: "pre",
        }}
        disabled={disabled}
      />
    </div>
  )
}

export default CodeEditor;
