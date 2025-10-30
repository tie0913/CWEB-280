const {succeed, fail} = require("../util/response");
const {createWordSchema, updateWordSchema, listWordsSchema} = require("../schemas/word.joi");
const wordService = require("../services/word.service");

class WordController {

  /**
   * Create a new word entry.
   *
   * Validates input with createWordSchema. If invalid, returns HTTP 400.
   * On success, adds the word through wordService and returns it.
   * Handles duplicate word errors with HTTP 409.
   *
   * Response:
   *   201: Word created successfully.
   *   400: Invalid input data.
   *   409: Duplicate word.
   *   500: Server error.
   */
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

  /**
   * Update an existing word entry.
   *
   * Validates combined params and body with updateWordSchema.
   * If valid, updates the word via wordService and returns the result.
   * Handles duplicate word conflicts with HTTP 409.
   *
   * Response:
   *   200: Word updated successfully.
   *   400: Invalid input data.
   *   409: Duplicate word.
   *   500: Server error.
   */
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

  /**
   * Delete a word entry by ID.
   *
   * Calls wordService.deleteWord() and returns 204 if successful.
   * Responds with 500 if an error occurs during deletion.
   *
   * Response:
   *   204: Word deleted successfully.
   *   500: Server error.
   */
  async remove(req, res) {
    try {
      await wordService.deleteWord(req.params.id);
      res.status(200).json(succeed("the word has been deleted"))
    } catch (e) {
      res.status(500).json(fail(1, e.message));
    }
  }

  /**
   * List words with optional filters.
   *
   * Validates query parameters with listWordsSchema.
   * If valid, retrieves the word list from wordService.
   *
   * Response:
   *   200: Word list retrieved successfully.
   *   400: Invalid query parameters.
   *   500: Server error.
   */
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

  /**
   * Get a random word.
   *
   * Fetches a random word from wordService.
   * Returns 404 if no words are available.
   *
   * Response:
   *   200: Random word retrieved successfully.
   *   404: No words found.
   *   500: Server error.
   */
  async random(req, res) {
    try {
      res.json(succeed(await wordService.randomWord()));
    } catch (e) {
      const code = e.message === "NoWords" ? 404 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }

  /**
   * Get a random word by difficulty level.
   *
   * Calls wordService.randomWordByDifficulty() with the given difficulty.
   * Returns 404 if no words match the specified level.
   *
   * Response:
   *   200: Random word retrieved successfully.
   *   404: No words found for the given difficulty.
   *   500: Server error.
   */
  async randomByDifficulty(req, res) {
    try {
      res.status(200).json(succeed(await wordService.randomWordByDifficulty(req.params.difficulty)));
    } catch (e) {
      const code = e.message === "NoWordsForDifficulty" ? 404 : 500;
      res.status(code).json(fail(1, e.message));
    }
  }
}

module.exports = new WordController();
