import fs from 'node:fs/promises';
import path from 'node:path';
import playsound from 'play-sound'
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export class WordsPlayer {
  #initialized = false
  #words = new Map();
  #rootDir;
  #dir;
  #listeners = [];
  #player = playsound();
  /**
   * @type {import('@google-cloud/text-to-speech').TextToSpeechClient}
   */
  #client;
  constructor() {
    const __dirname = new URL('.', import.meta.url).pathname;
    this.#rootDir = path.join(__dirname, '..');
    this.#dir = path.join(this.#rootDir, 'sounds');
    this.#init();
  }

  async #init() {
    try {
      // Create sounds directory if not exists
      await fs.mkdir(this.#dir, { recursive: true });

      const listDir = await fs.readdir(this.#dir);

      for (const file of listDir) {
        const word = file.split('.')[0];
        const filepath = path.join(this.#dir, file);
        this.#words.set(word, filepath);
      }

      this.#client = new TextToSpeechClient({
        keyFilename: path.join(this.#rootDir, 'key.json'),
      });
    } catch(e) {
      console.error(e);
      console.error(e.stack);
      process.exit(-1);
    }
    this.#initialized = true;
    this.#notify();
  }

  async play(word) {
    const exists = this.#words.has(word);
    if (!exists) {
      const filepath = path.join(this.#dir, `${word}.mp3`);
      const [response] = await this.#makeTTS(word);
      await fs.writeFile(filepath, response.audioContent, 'binary');
      this.#words.set(word, filepath);
    }
    this.#player.play(this.#words.get(word));
  }

  #makeTTS(word) {
    const request = {
      input: {text: word},
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      audioConfig: {audioEncoding: 'MP3'},
    };
    return this.#client.synthesizeSpeech(request);
  }

  #notify() {
    this.#listeners.forEach(f => f());
  }

  onInitialized(cb) {
    if (this.#listeners.includes(cb)) {
      return;
    }
    this.#listeners.push(cb);
    if (this.#initialized) {
      this.#notify()
    }
  }
}