import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Adjust path if needed

const HtmlViewer = ({ htmlContent, customStyles = '' }) => {
  const { theme } = useUser();
  const [combinedStyles, setCombinedStyles] = useState('');

  // Base styles to match Bootstrap and app's theme
  const baseStyles = `
    .html-viewer {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      padding: 20px;
      color: ${theme === 'dark' ? '#ddd' : '#212529'};
      background-color: ${theme === 'dark' ? '#343a40' : '#fff'};
    }
    .html-viewer h1, .html-viewer h2, .html-viewer h3, .html-viewer h4, .html-viewer h5, .html-viewer h6 {
      color: ${theme === 'dark' ? '#90caf9' : '#2c3e50'};
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .html-viewer p, .html-viewer div, .html-viewer span, .html-viewer article, .html-viewer section, .html-viewer aside {
      color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
      margin-bottom: 1rem;
    }
    .html-viewer a {
      color: ${theme === 'dark' ? '#90caf9' : '#007bff'};
      text-decoration: none;
    }
    .html-viewer a:hover {
      text-decoration: underline;
    }
    .html-viewer img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    .html-viewer ul, .html-viewer ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .html-viewer li {
      color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
    }
    .html-viewer code {
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#c0caf5' : '#000'};
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.95rem;
    }
    .html-viewer pre {
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#cdd9e5' : '#000'};
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1rem 0;
      border-left: 4px solid ${theme === 'dark' ? '#90caf9' : '#007bff'};
    }
    .html-viewer table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
    }
    .html-viewer th, .html-viewer td {
      border: 1px solid ${theme === 'dark' ? '#444' : '#dee2e6'};
      padding: 0.75rem;
      text-align: left;
    }
    .html-viewer th {
      background-color: ${theme === 'dark' ? '#495057' : '#343a40'};
      color: ${theme === 'dark' ? '#fff' : '#fff'};
    }
    .html-viewer tr:nth-child(even) {
      background-color: ${theme === 'dark' ? '#2a2a2a' : '#f8f9fa'};
    }
    .html-viewer .note {
      background-color: ${theme === 'dark' ? '#1e3a5f' : '#e3f2fd'};
      border-left: 5px solid #2196f3;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      color: ${theme === 'dark' ? '#bbdefb' : '#212529'};
    }
    .html-viewer .warning {
      background-color: ${theme === 'dark' ? '#4b1c1c' : '#ffebee'};
      border-left: 5px solid #f44336;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      color: ${theme === 'dark' ? '#ffcdd2' : '#212529'};
    }
    .html-viewer .success {
      background-color: ${theme === 'dark' ? '#1b3f2d' : '#e8f5e9'};
      border-left: 5px solid #4caf50;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      color: ${theme === 'dark' ? '#c8e6c9' : '#212529'};
    }
    .html-viewer .try-it {
      background-color: ${theme === 'dark' ? '#4e4e00' : '#fff8e1'};
      border-left: 5px solid #ffc107;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      color: ${theme === 'dark' ? '#fff59d' : '#212529'};
    }
    .html-viewer .box-model {
      background-color: ${theme === 'dark' ? '#1e1e1e' : '#fff'};
      border: 2px solid ${theme === 'dark' ? '#90caf9' : '#3498db'};
      border-radius: 8px;
      padding: 1.25rem;
      margin: 1rem 0;
      text-align: center;
      color: ${theme === 'dark' ? '#e0e0e0' : '#212529'};
    }
  `;

  // Function to extract styles and clean HTML
  const processHtmlContent = (content) => {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    let extractedStyles = '';

    // Extract styles from <style> tags
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach((tag) => {
      extractedStyles += tag.textContent + '\n';
      tag.remove(); // Remove the style tag from the DOM
    });

    // Serialize the cleaned HTML (without <style> tags)
    const cleanedHtml = doc.documentElement.outerHTML;
    return { cleanedHtml, extractedStyles };
  };

  // Process HTML content and set styles when htmlContent changes
  useEffect(() => {
    const { cleanedHtml, extractedStyles } = processHtmlContent(htmlContent);
    // Combine baseStyles, extractedStyles, and customStyles
    setCombinedStyles(`
      ${baseStyles}
      ${extractedStyles}
     
    `);
    // Update the HTML content to use the cleaned version
    setCleanedHtmlContent(cleanedHtml);
  }, [htmlContent, theme, customStyles]); // Re-run when these dependencies change

  // State to store cleaned HTML content
  const [cleanedHtmlContent, setCleanedHtmlContent] = useState(htmlContent);

  return (
    <div className={`html-viewer ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <style>{combinedStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: cleanedHtmlContent }} />
    </div>
  );
};

export default HtmlViewer;