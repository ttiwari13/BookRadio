exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i'); // case-insensitive

    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } }
      ]
    }).limit(50);

    res.status(200).json(books);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};
