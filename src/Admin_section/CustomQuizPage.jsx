import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const CustomQuizPage = () => {
  const { subject, docId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(
          `https://api-e5q6islzdq-uc.a.run.app/customquiz/${subject}/${docId}`
        );

        setQuizData(res.data);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [subject, docId]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;
  if (!quizData || !quizData.mcqData) return <div>Quiz not found.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{quizData.mcqData.title}</h2>
      <ul className="space-y-4">
        {quizData.mcqData.questions?.map((q, index) => (
          <li key={index} className="border p-4 rounded">
            <p className="font-semibold">
              Q{index + 1}: {q.question}
            </p>
            <ul className="ml-4 mt-2 space-y-1">
              {q.options.map((opt, idx) => (
                <li key={idx} className="ml-2">- {opt}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomQuizPage;
