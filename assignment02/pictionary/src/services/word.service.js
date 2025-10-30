const wordRepo = require('../repositories/word.repo');
class WordService {
      async createWord({ word, difficulty }) {
    const existing = await wordRepo.findByText(word);
    if (existing) throw new Error('DuplicateWord');
    const doc = { word, difficulty, createdAt: new Date(), updatedAt: new Date() };
    const id = await wordRepo.insert(doc);
    return { ...doc, _id: id };
  }

  async updateWord({ id, word, difficulty }) {
    const other = await wordRepo.findByText(word);
    if (other && String(other._id) !== String(id)) throw new Error('DuplicateWord');

    const updates = { word, difficulty, updatedAt: new Date() };
    await wordRepo.update(id, updates);
    return await wordRepo.findById(id);
  }

  async deleteWord(id) {
    await wordRepo.remove(id);
  }

  async listWords({ q, difficulty, page, size }) {
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