const { succeed, fail } = require("../util/response");
const {
  createWordSchema,
  updateWordSchema,
  listWordsSchema,
} = require("../schemas/word.joi");
const wordService = require("../services/word.service");

class WordController {
  async create(req, res) {
    const { error, value } = createWordSchema.validate(req.body);
    if (error)
      return res.status(400).json(
        fail(
          1,
          error.details.map((d) => d.message)
        )
      );
    try {
      const word = await wordService.createWord(value);
      res.status(201).json(succeed(word));
    } catch (e) {
      const code = e.message === "DuplicateWord" ? 409 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }

  async update(req, res) {
    const { error, value } = updateWordSchema.validate({
      ...req.body,
      _id: req.params.id,
    });
    if (error)
      return res.status(400).json(
        fail(
          1,
          error.details.map((d) => d.message)
        )
      );
    try {
      const word = await wordService.updateWord(value);
      res.json(succeed(word));
    } catch (e) {
      const code = e.message === "DuplicateWord" ? 409 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }

  async remove(req, res) {
    try {
      await wordService.deleteWord(req.params.id);
      res.status(204).end();
    } catch (e) {
      res.status(500).json(fail(1, e.message));
    }
  }

  async list(req, res) {
    const { error, value } = listWordsSchema.validate(req.query);
    if (error)
      return res.status(400).json(
        fail(
          1,
          error.details.map((d) => d.message)
        )
      );
    try {
      res.json(succeed(await wordService.listWords(value)));
    } catch (e) {
      res.status(500).json(fail(1, e.message));
    }
  }

  async random(req, res) {
    try {
      res.json(succeed(await wordService.randomWord()));
    } catch (e) {
      const code = e.message === "NoWords" ? 404 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }

  async randomByDifficulty(req, res) {
    try {
      res.json(
        succeed(await wordService.randomWordByDifficulty(req.params.difficulty))
      );
    } catch (e) {
      const code = e.message === "NoWordsForDifficulty" ? 404 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }
}

module.exports = new WordController();
