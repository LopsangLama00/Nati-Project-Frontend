
import React from "react";
import { useSearchParams, Link } from "react-router-dom";

import GetProductVarientDetail from "../AxiosRequest/ProductVarientDetails";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q")?.trim() || "";

  return (
    <div className="container py-5 mt-5">

      {/* Search Heading */}
      <div className="mb-4">
        <h2 className="fw-bold">
          Search Results for{" "}
          <span className="text-warning">
            "{query}"
          </span>
        </h2>

        <p className="text-muted">
          Explore our Himalayan art collection.
        </p>
      </div>

      {/* Search Results */}
      {query.length < 2 ? (
        <div className="text-center py-5">
          <h5 className="fw-bold">
            Enter at least 2 characters to search.
          </h5>

          <Link
            to="/products"
            className="btn btn-outline-warning mt-3"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <GetProductVarientDetail
          searchQuery={query}
        />
      )}

    </div>
  );
}
