export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  checkedQuestions: Record<number, boolean>;
  score?: number;
  completed?: boolean;
}

export interface LearningLevel {
  title: string;
  duration?: string;
  topics: string[];
  resources: string[];
}
