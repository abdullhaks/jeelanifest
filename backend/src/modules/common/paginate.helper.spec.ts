import { paginate } from './paginate.helper';
import type { Model } from 'mongoose';

describe('paginate helper', () => {
  it('should paginate correctly with page, limit, and default search', async () => {
    const mockData = [{ name: 'Test 1' }, { name: 'Test 2' }];
    
    // Create a chainable mock object to simulate mongoose query
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockData),
    };
    
    const mockModel = {
      find: jest.fn().mockReturnValue(mockQuery),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(10)
      }),
    } as unknown as Model<any>;

    const result = await paginate(mockModel, { page: 2, limit: 2, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
    
    expect(mockModel.find).toHaveBeenCalledWith({});
    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockQuery.skip).toHaveBeenCalledWith(2); // (2-1) * 2 = 2
    expect(mockQuery.limit).toHaveBeenCalledWith(2);
    
    expect(result.data).toEqual(mockData);
    expect(result.meta.total).toBe(10);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(2);
    expect(result.meta.totalPages).toBe(5);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPrevPage).toBe(true);
  });

  it('should handle search correctly', async () => {
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    
    const mockModel = {
      find: jest.fn().mockReturnValue(mockQuery),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0)
      }),
    } as unknown as Model<any>;

    await paginate(mockModel, { page: 1, limit: 10, search: 'hello', sortBy: 'name', sortOrder: 'asc' }, ['name', 'description']);
    
    const expectedFilter = {
      $or: [
        { name: expect.any(RegExp) },
        { description: expect.any(RegExp) }
      ]
    };
    
    expect(mockModel.find).toHaveBeenCalledWith(expectedFilter);
    expect(mockQuery.sort).toHaveBeenCalledWith({ name: 1 });
  });
});
