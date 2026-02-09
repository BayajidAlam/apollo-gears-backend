import { prisma } from '../../lib/prisma';
import { CarSearchableFields } from './car.constant';
import { Prisma } from '../../../generated/prisma/client';

export type TCarPayload = {
  name: string;
  brand: string;
  model: string;
  image: string;
  rating?: number;
  fuelType: 'Octane' | 'Hybrid' | 'Electric' | 'Diesel' | 'Petrol';
  passengerCapacity: number;
  color: string;
  condition: 'New' | 'Used';
};

const createCar = async (car: TCarPayload) => {
  return await prisma.car.create({
    data: car,
  });
};

const findCarById = async (carId: string) => {
  return await prisma.car.findUnique({
    where: { id: carId },
    include: {
      rents: true,
    },
  });
};

const getAllCars = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = query.searchTerm as string | undefined;
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

  // Build where clause
  const whereConditions: Prisma.CarWhereInput[] = [];

  // Search functionality
  if (searchTerm) {
    whereConditions.push({
      OR: CarSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      })),
    });
  }

  // Filter by other fields
  const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder', 'fields'];
  const filterData = Object.fromEntries(
    Object.entries(query).filter(([key]) => !excludeFields.includes(key)),
  );

  if (Object.keys(filterData).length > 0) {
    whereConditions.push(filterData as Prisma.CarWhereInput);
  }

  const whereClause: Prisma.CarWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Execute query
  const [result, total] = await Promise.all([
    prisma.car.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.car.count({ where: whereClause }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const updateCarById = async (carId: string, payload: Partial<TCarPayload>) => {
  const result = await prisma.car.update({
    where: { id: carId },
    data: payload,
  });
  return result;
};

const deleteCarById = async (carId: string) => {
  const result = await prisma.car.delete({
    where: { id: carId },
  });
  return result;
};

export const CarService = {
  createCar,
  findCarById,
  getAllCars,
  updateCarById,
  deleteCarById,
};
