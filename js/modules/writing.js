window.IELTS = window.IELTS || {};

window.IELTS.writingModule = (() => {
  const TRANSITION_WORDS = [
    'furthermore', 'however', 'moreover', 'therefore', 'consequently',
    'nevertheless', 'in addition', 'on the other hand', 'in contrast',
    'for example', 'for instance', 'in conclusion', 'to summarise',
    'firstly', 'secondly', 'finally', 'overall', 'whereas', 'although',
    'despite', 'in terms of', 'regarding', 'with regard to', 'notably',
    'significantly', 'in particular', 'additionally', 'similarly',
    'likewise', 'as a result', 'due to', 'in spite of', 'by contrast'
  ];

  const ACADEMIC_PHRASES = [
    'it is evident', 'it can be seen', 'this suggests', 'this indicates',
    'it is worth noting', 'a significant', 'a considerable', 'a substantial',
    'the majority', 'a minority', 'approximately', 'roughly', 'around',
    'in comparison', 'by contrast', 'in relation to', 'it is clear that',
    'the data shows', 'the graph illustrates', 'the figure reveals',
    'accounts for', 'proportion of', 'percentage of', 'rate of'
  ];

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const countSentences = (text) => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  const countUniqueWords = (text) => {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    return new Set(words).size;
  };

  const checkTransitions = (text) => {
    const lower = text.toLowerCase();
    return TRANSITION_WORDS.filter(tw => lower.includes(tw)).length;
  };

  const checkAcademicPhrases = (text) => {
    const lower = text.toLowerCase();
    return ACADEMIC_PHRASES.filter(p => lower.includes(p)).length;
  };

  const avgSentenceLength = (text) => {
    const words = countWords(text);
    const sentences = countSentences(text);
    return sentences > 0 ? Math.round(words / sentences) : 0;
  };

  // Heuristic scoring — returns band estimates
  const scoreLocally = (text, taskType) => {
    const wordCount = countWords(text);
    const minWords = taskType === 'task1' ? 150 : 250;
    const uniqueWords = countUniqueWords(text);
    const totalWords = wordCount;
    const lexDiversity = totalWords > 0 ? uniqueWords / totalWords : 0;
    const transitions = checkTransitions(text);
    const academic = checkAcademicPhrases(text);
    const avgSentLen = avgSentenceLength(text);
    const sentences = countSentences(text);

    let wordPenalty = 0;
    if (wordCount < minWords) wordPenalty = 1.5;
    else if (wordCount < minWords * 0.9) wordPenalty = 2;

    // TR: Task Response / Achievement
    let tr = 6.0;
    if (wordCount >= minWords) tr += 0.5;
    if (wordCount >= minWords * 1.1) tr += 0.5;
    if (academic >= 2) tr += 0.5;
    if (transitions >= 3) tr += 0.5;
    tr = Math.max(4, Math.min(9, tr - wordPenalty));

    // CC: Coherence & Cohesion
    let cc = 5.5;
    if (transitions >= 3) cc += 0.5;
    if (transitions >= 6) cc += 0.5;
    if (sentences >= 5) cc += 0.5;
    if (avgSentLen > 10 && avgSentLen < 30) cc += 0.5;
    cc = Math.max(4, Math.min(9, cc - wordPenalty * 0.5));

    // LR: Lexical Resource
    let lr = 5.5;
    if (lexDiversity > 0.5) lr += 0.5;
    if (lexDiversity > 0.6) lr += 0.5;
    if (uniqueWords > 80) lr += 0.5;
    if (academic >= 3) lr += 0.5;
    lr = Math.max(4, Math.min(9, lr - wordPenalty * 0.5));

    // GRA: Grammatical Range & Accuracy
    let gra = 6.0;
    if (avgSentLen > 12 && avgSentLen < 28) gra += 0.5;
    if (sentences >= 6) gra += 0.5;
    const hasComplex = text.includes('which') || text.includes('although') ||
                       text.includes('whereas') || text.includes('despite') ||
                       text.includes('because') || text.includes('while');
    if (hasComplex) gra += 0.5;
    gra = Math.max(4, Math.min(9, gra - wordPenalty * 0.3));

    const overall = Math.round(((tr + cc + lr + gra) / 4) * 2) / 2;

    // Generate feedback
    const feedback = [];

    if (wordCount < minWords) {
      feedback.push(`⚠️ Word count: ${wordCount}/${minWords} — You must write at least ${minWords} words.`);
    } else {
      feedback.push(`✅ Word count: ${wordCount} words — Good length.`);
    }

    if (transitions < 3) {
      feedback.push('📌 Use more linking words (furthermore, however, consequently, in addition, etc.) to improve coherence.');
    } else if (transitions < 6) {
      feedback.push('📌 Good use of linking words. Try to vary them more throughout your essay.');
    } else {
      feedback.push('✅ Strong use of cohesive devices throughout.');
    }

    if (lexDiversity < 0.5) {
      feedback.push('📚 Vocabulary appears repetitive. Try using synonyms and avoiding repeating the same words.');
    } else if (lexDiversity < 0.6) {
      feedback.push('📚 Reasonable vocabulary range. Aim for more academic word choices to improve LR score.');
    } else {
      feedback.push('✅ Good vocabulary diversity. You are using a range of words effectively.');
    }

    if (avgSentLen < 10) {
      feedback.push('📝 Your sentences are quite short. Try combining ideas using relative clauses (which, that) and subordinating conjunctions (although, despite, because).');
    } else if (avgSentLen > 30) {
      feedback.push('📝 Some sentences may be too long. Break complex ideas into clearer sentences to improve readability.');
    } else {
      feedback.push('✅ Good sentence length variation. This helps with GRA score.');
    }

    if (!hasComplex) {
      feedback.push('📝 Add complex sentence structures using: although, whereas, which, despite, because, while, unless.');
    }

    if (academic < 2) {
      feedback.push('📚 Use more academic phrases: "it is evident that", "this suggests", "a significant proportion", etc.');
    }

    return {
      scores: {
        tr: Math.round(tr * 2) / 2,
        cc: Math.round(cc * 2) / 2,
        lr: Math.round(lr * 2) / 2,
        gra: Math.round(gra * 2) / 2
      },
      overall,
      wordCount,
      feedback,
      stats: { uniqueWords, transitions, academic, avgSentLen, lexDiversity: Math.round(lexDiversity * 100) }
    };
  };

  // Score using Claude API
  const scoreWithAI = async (text, question, taskType) => {
    const settings = IELTS.storage.getSettings();
    if (!settings.apiKey) throw new Error('NO_API_KEY');

    const taskContext = taskType === 'task1'
      ? 'IELTS Academic Writing Task 1 (describe visual data in at least 150 words)'
      : 'IELTS Academic Writing Task 2 (essay in at least 250 words)';

    const prompt = `You are an expert IELTS examiner. Evaluate the following ${taskContext} response.

QUESTION:
${question}

STUDENT RESPONSE:
${text}

Provide scores (to the nearest 0.5 band) and feedback for each criterion:
1. TR (Task Response for Task 2) or TA (Task Achievement for Task 1): Does the response address all parts of the task?
2. CC (Coherence and Cohesion): How well is it organised and linked?
3. LR (Lexical Resource): Range and accuracy of vocabulary?
4. GRA (Grammatical Range and Accuracy): Range and accuracy of grammar?

Format your response as valid JSON:
{
  "scores": {"tr": 6.5, "cc": 6.0, "lr": 6.5, "gra": 6.0},
  "overall": 6.5,
  "feedback": [
    "TR/TA: ...",
    "CC: ...",
    "LR: ...",
    "GRA: ...",
    "Key improvements: ..."
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid API response format');

    const result = JSON.parse(jsonMatch[0]);
    result.wordCount = countWords(text);
    result.aiScored = true;
    return result;
  };

  const getRandomQuestion = (taskType) => {
    const questions = IELTS.writingQuestions[taskType];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const getAllQuestions = (taskType) => IELTS.writingQuestions[taskType];

  const saveAttempt = (questionId, text, score) => {
    IELTS.storage.saveWritingAttempt(questionId, text, score);
  };

  return { scoreLocally, scoreWithAI, getRandomQuestion, getAllQuestions, saveAttempt, countWords };
})();
