class APIFeatures {
  constructor(query, queryString) {
    // `query` is the Mongoose query object (e.g., Tour.find()).
    // `queryString` is the request query string (e.g., req.query).
    this.query = query;
    this.queryString = queryString;
  }

  // Method to filter the query based on the query string parameters
  filter() {
    // 1A) Basic Filtering: Copy the query string object
    const queryObj = { ...this.queryString };
    // Fields that should be excluded from filtering (e.g., pagination, sorting)
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering: Replace operators with MongoDB operators
    // Convert queryObj to a string and replace gte, gt, lte, lt with $gte, $gt, $lte, $lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Example input: /tours?price[gte]=500&duration[lt]=10
    // Translates to: { price: { $gte: 500 }, duration: { $lt: 10 } }

    // Convert the string back to an object and apply it to the Mongoose query
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // Return the class instance for chaining
  }

  // Method to sort the query results
  sort() {
    if (this.queryString.sort) {
      // Convert the sort parameter into a format Mongoose can use
      const sortBy = this.queryString.sort.split(",").join(" ");
      // Apply sorting to the query
      this.query = this.query.sort(sortBy);
    } else {
      // Default sorting by creation date in descending order if no sort parameter is provided
      this.query = this.query.sort("-createdAt");
    }

    // Example input: /tours?sort=price,duration
    // Translates to: .sort('price duration')

    return this; // Return the class instance for chaining
  }

  // Method to limit the fields returned in the query results
  limitFields() {
    if (this.queryString.fields) {
      // Convert the fields parameter into a format Mongoose can use
      const fields = this.queryString.fields.split(",").join(" ");
      // Apply field selection to the query
      this.query = this.query.select(fields);
    } else {
      // Exclude the `__v` field by default
      this.query = this.query.select("-__v");
    }

    // Example input: /tours?fields=name,duration,price
    // Translates to: .select('name duration price')

    return this; // Return the class instance for chaining
  }

  // Method to paginate the query results
  paginate() {
    // Set default values for page and limit
    const page = this.queryString.page * 1 || 1; // Convert to number, default to 1
    const limit = this.queryString.limit * 1 || 100; // Convert to number, default to 100
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Apply pagination to the query
    this.query = this.query.skip(skip).limit(limit);

    // Example input: /tours?page=2&limit=10
    // Translates to: .skip(10).limit(10) (Skipping the first 10 results and limiting to 10)

    return this; // Return the class instance for chaining
  }
}

module.exports = APIFeatures;
