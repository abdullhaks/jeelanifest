import mongoose, { Model } from 'mongoose';
import type { PaginationQuery } from './pagination.schema';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface PaginateOptions {
  defaultLimit?: number;
  populate?: string | string[] | any[];
}

/**
 * Reusable paginate helper for Mongoose models.
 * Provides identical search + filter + sort + pagination everywhere.
 *
 * @param model - Mongoose model to query
 * @param query - Parsed pagination query (from paginationQuerySchema)
 * @param searchableFields - Array of field names to search across (OR-combined regex)
 * @param filters - Additional Mongoose filter query (module-specific filters)
 * @param options - Extra options (defaultLimit, populate)
 */
export async function paginate<T>(
  model: Model<T>,
  query: PaginationQuery,
  searchableFields: string[] = [],
  filters: Record<string, any> = {},
  options: PaginateOptions = {},
): Promise<PaginatedResult<T>> {
  const page = query.page || 1;
  const limit = query.limit || options.defaultLimit || 9;
  const skip = (page - 1) * limit;

  // Build the filter
  const mongoFilter: Record<string, any> = { ...filters };

  // Search: OR across all searchable fields with case-insensitive regex
  if (query.search && searchableFields.length > 0) {
    const searchRegex = new RegExp(query.search, 'i');
    (mongoFilter as any).$or = searchableFields.map((field) => ({
      [field]: searchRegex,
    }));
  }

  // Sort
  const sortObj: Record<string, 1 | -1> = {};
  if (query.sortBy) {
    sortObj[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
  }

  // Execute query and count in parallel
  let findQuery = model
    .find(mongoFilter)
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  // Apply populate if provided
  if (options.populate) {
    if (Array.isArray(options.populate)) {
      for (const pop of options.populate) {
        findQuery = findQuery.populate(pop);
      }
    } else {
      findQuery = findQuery.populate(options.populate);
    }
  }

  const [data, total] = await Promise.all([
    findQuery.exec(),
    model.countDocuments(mongoFilter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
