export const SCORING_RULES = {
  easy: { correct: 10 },
  medium: { correct: 20 },
  hard: { correct: 30 },
};

export function calculateScore(
  level: 'easy' | 'medium' | 'hard',
  isCorrect: boolean,
  isPassed: boolean = false
): number {
  const baseScore = SCORING_RULES[level];
  
  // Calculate score based on correct/wrong
  let score = 0;
  if (isCorrect) {
    score = baseScore.correct; // Full points for correct answer
  } else {
    score = -(baseScore.correct * 0.50); // 50% negative points for wrong answer
  }
  
  if (isPassed) {
    if (isCorrect) {
      // Passed correct: 50% of original value
      score = baseScore.correct * 0.5;
    } else {
      // Passed wrong: 25% deduction (50% of the 50% penalty)
      score = -(baseScore.correct * 0.25);
    }
  }
  
  return Math.round(score);
}

export function getQuestionCounts(questions: { level: string; opened: boolean }[], level: 'easy' | 'medium' | 'hard'): number {
  return questions.filter(q => q.level === level && !q.opened).length;
}
