import React, { useMemo } from "react";
import { useUser } from "../context/UserProvider";

const HtmlViewer = ({ htmlContent = "", codeContent = "", customStyles = "" }) => {
  const { theme } = useUser();

  const baseStyles = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      padding: 20px;
      margin: 0;
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
      color: ${theme === 'dark' ? '#ddd' : '#212529'};
    }

    h1, h2, h3, h4, h5, h6 {
      color: ${theme === 'dark' ? '#90caf9' : '#2c3e50'};
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    a {
      color: ${theme === 'dark' ? '#90caf9' : '#007bff'};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    code {
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#c0caf5' : '#000'};
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.95rem;
    }

    pre {
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#cdd9e5' : '#000'};
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 2rem 0;
      border-left: 4px solid ${theme === 'dark' ? '#90caf9' : '#007bff'};
      font-family: 'Courier New', monospace;
    }

    .code-section-title {
      font-weight: bold;
      margin-top: 3rem;
      font-size: 1.25rem;
      color: ${theme === 'dark' ? '#ffd700' : '#1e1e1e'};
    }

    ${customStyles}
  `;

  const iframeContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_blank" />
          <style>${baseStyles}</style>
        </head>
        <body>
          ${htmlContent || "<p>No content available.</p>"}

          ${codeContent
            ? `
              <div class="code-section-title">Code Block:</div>
              <pre><code>${codeContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
            `
            : ""
          }
        </body>
      </html>
    `;
  }, [htmlContent, codeContent, baseStyles]);

  return (
    <iframe
      title="Note Content"
      srcDoc={iframeContent}
      sandbox=""
      className="w-full h-[99vh] border rounded pb-5"
    />
  );
};

export default HtmlViewer;
