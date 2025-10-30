const wordRepo = require('../repositories/word.repo');

/**
 * WordService class
 *
 * Handles word management operations including creation, update, deletion,
 * listing with pagination, and random word retrieval. Ensures no duplicates
 * and supports difficulty-based random selection. Serves as a business logic
 * layer between controllers and the word repository.
 */

class WordService {
      async createWord({ word, difficulty }) {
    const existing = await wordRepo.findByWord(word);
    if (existing) throw new Error('DuplicateWord');
    const doc = { word, difficulty, createdAt: new Date(), updatedAt: new Date() };
    const id = await wordRepo.insert(doc);
    return { ...doc, _id: id };
  }

  async updateWord({ _id, word, difficulty }) {
    const other = await wordRepo.findByWord(word);
    if (other && String(other._id) !== String(_id)) throw new Error('DuplicateWord');

    const updates = { word, difficulty, updatedAt: new Date() };
    await wordRepo.update(_id, updates);
    return await wordRepo.findById(_id);
  }

  async deleteWord(id) {
    await wordRepo.remove(id);
  }

  async listWords({query, difficulty, page, size }) {
    const { total, items } = await wordRepo.list({
      query, difficulty,
      skip: (page - 1) * size,
      limit: size
    });
    return { list: items, page, size, total, totalPages: Math.ceil(total / size) };
  }

  async randomWord() {
    const word = await wordRepo.getRandom();
    if (!word) throw new Error('NoWords');
    return word;
  }

  async randomWordByDifficulty(difficulty) {
    const word = await wordRepo.getRandomByDifficulty(difficulty);
    if (!word) throw new Error('NoWordsForDifficulty');
    return word;
  }
}

module.exports = new WordService()