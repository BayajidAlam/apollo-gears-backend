import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';

export type TRentPayload = {
  userId: string;
  carId: string;
  rentStatus?: 'pending' | 'ongoing' | 'completed';
  startingPoint: string;
  destination: string;
};

const createRent = async (rent: TRentPayload) => {
  return await prisma.rent.create({
    data: rent,
    include: {
      user: true,
      car: true,
    },
  });
};

const findRentById = async (rentId: string) => {
  return await prisma.rent.findUnique({
    where: { id: rentId },
    include: {
      user: true,
      car: true,
      bids: true,
    },
  });
};

const getAllRents = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

  // Build where clause
  const whereConditions: Prisma.RentWhereInput[] = [];

  // Filter by other fields
  const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder', 'fields'];
  const filterData = Object.fromEntries(
    Object.entries(query).filter(([key]) => !excludeFields.includes(key)),
  );

  if (Object.keys(filterData).length > 0) {
    whereConditions.push(filterData as Prisma.RentWhereInput);
  }

  const whereClause: Prisma.RentWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Execute query
  const [result, total] = await Promise.all([
    prisma.rent.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: true,
        car: true,
      },
    }),
    prisma.rent.count({ where: whereClause }),
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

const updateRentById = async (rentId: string, payload: Partial<TRentPayload>) => {
  const result = await prisma.rent.update({
    where: { id: rentId },
    data: payload,
    include: {
      user: true,
      car: true,
    },
  });
  return result;
};

const deleteRentById = async (rentId: string) => {
  const result = await prisma.rent.delete({
    where: { id: rentId },
  });
  return result;
};

export const RentService = {
  createRent,
  findRentById,
  getAllRents,
  updateRentById,
  deleteRentById,
};
