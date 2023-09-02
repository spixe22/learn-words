/**
 * The application reads file with list of words formatted as follows:
 * 'word (eng) - translation (rus)'.
 * Every word is separated by new line. Between lines could be any number of empty lines.
 * 
 * The application do quiz with user. It shows random word from the list and user should type translation.
 * It could have two directions: from English to Russian and from Russian to English.
 * Direction will be randomly chosen every time.
 * 
 * User should type answer and press enter every time.
 * It should has counter of correct and wrong answers.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const __dirname = new URL('.', import.meta.url).pathname;
const rootDir = join(__dirname, '..');

const words = readFileSync(join(rootDir, 'words.txt'), 'utf8')

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const wordsList = words.split('\n').filter(Boolean).map((word) => {
    const [en, ru] = word.split(' - ');
    return { en, ru };
});

const getRandomWord = () => wordsList[random(0, wordsList.length - 1)];

const askQuestion = (question, type) => new Promise((resolve) => {
    rl.question(question, (answer) => {
        resolve(answer);
    });
});


const quiz = async () => {
  const word = getRandomWord();
  const type = random(0, 1);
  const question = type ? `Translate "${word.en}" to Russian: ` : `Translate "${word.ru}" to English: `;
  const answer = await askQuestion(question);

  const correctAnswer = type ? word.ru : word.en;
  const isCorrect = answer === correctAnswer;

  if (isCorrect) {
      console.log('Correct!');
  } else {
      console.log(`Wrong! Correct answer is "${correctAnswer}"`);
  }
  return isCorrect;
}

const start = async () => {
    let correct = 0;
    let wrong = 0;
    while (true) {
        const isCorrect = await quiz();
        if (isCorrect) {
            correct++;
        } else {
            wrong++;
        }
        console.log(`Correct: ${correct}, Wrong: ${wrong}`);
        console.log('------------------------');
    }
}

start();