import React, { useEffect, useRef } from 'react';
import { useAi } from '../context/Airesposnseprovider'; // Adjust the import path as needed
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  question: {
    marginBottom: 15,
  },
  questionText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  option: {
    marginLeft: 10,
    marginBottom: 4,
  },
  fillBlank: {
    marginBottom: 8,
  },
});

// PDF Document component
const MyDocument = ({ content }) => {
  // Parse the markdown-like content
  const questions = [];
  const lines = content.split('\n');
  
  let currentQuestion = null;
  
  for (const line of lines) {
    if (line.startsWith('## Question')) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        number: line.replace('## Question ', ''),
        text: '',
        options: [],
        type: 'mcq' // default to multiple choice
      };
    } else if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
      if (currentQuestion) currentQuestion.options.push(line);
    } else if (line.trim() !== '') {
      if (currentQuestion && currentQuestion.text === '') {
        currentQuestion.text = line;
        // Check if it's a fill in the blank question
        if (line.includes('__________')) {
          currentQuestion.type = 'fillblank';
        }
      }
    }
  }
  
  if (currentQuestion) questions.push(currentQuestion);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AI Generated Questions</Text>
        {questions.map((question, index) => (
          <View key={index} style={styles.question} wrap={false}>
            <Text style={styles.questionText}>{`Question ${question.number}: ${question.text}`}</Text>
            {question.type === 'mcq' ? (
              question.options.map((option, optIndex) => (
                <Text key={optIndex} style={styles.option}>{option}</Text>
              ))
            ) : (
              <Text style={styles.fillBlank}>[Blank space for answer]</Text>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
};

const PdfMaker = () => {
  const { generatedContent, craetepdf, setCreatepdf } = useAi();
  const downloadAttempted = useRef(false);
  
  useEffect(() => {
    const downloadPDF = async () => {
      // Only proceed if craetepdf is true, content exists, and download hasn't been attempted
      if (craetepdf && generatedContent && generatedContent !== "Error generating content." && !downloadAttempted.current) {
        try {
          downloadAttempted.current = true;
          
          // Generate the PDF blob
          const blob = await pdf(<MyDocument content={generatedContent} />).toBlob();
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `generated-questions-${Date.now()}.pdf`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          // Reset the flag after successful download
          setCreatepdf(false);
          
        } catch (error) {
          console.error('Error generating PDF:', error);
          // Reset flag even on error to prevent infinite loops
          downloadAttempted.current = false;
          setCreatepdf(false);
        }
      }
    };

    downloadPDF();
  }, [craetepdf, generatedContent, setCreatepdf]);

  // Reset the download flag when craetepdf becomes false
  useEffect(() => {
    if (!craetepdf) {
      downloadAttempted.current = false;
    }
  }, [craetepdf]);

  // This component doesn't render anything visible
  return null;
};

export default PdfMaker;