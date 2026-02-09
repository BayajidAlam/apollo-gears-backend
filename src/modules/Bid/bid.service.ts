import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';

export type TBidPayload = {
  rentId: string;
  driverId: string;
  bidAmount: number;
  bidStatus?: 'accepted' | 'pending' | 'rejected';
  driverLocation: string;
};

const createBid = async (bid: TBidPayload) => {
  return await prisma.bid.create({
    data: bid,
    include: {
      rent: true,
      driver: true,
    },
  });
};

const findBidById = async (bidId: string) => {
  return await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      rent: true,
      driver: true,
    },
  });
};

const getAllBids = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

  // Build where clause
  const whereConditions: Prisma.BidWhereInput[] = [];

  // Filter by other fields
  const excludeFields = ['searchTerm', 'page', 'limit', 'sortBy', 'sortOrder', 'fields'];
  const filterData = Object.fromEntries(
    Object.entries(query).filter(([key]) => !excludeFields.includes(key)),
  );

  if (Object.keys(filterData).length > 0) {
    whereConditions.push(filterData as Prisma.BidWhereInput);
  }

  const whereClause: Prisma.BidWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Execute query
  const [result, total] = await Promise.all([
    prisma.bid.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        rent: true,
        driver: true,
      },
    }),
    prisma.bid.count({ where: whereClause }),
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

const updateBidById = async (bidId: string, payload: Partial<TBidPayload>) => {
  const result = await prisma.bid.update({
    where: { id: bidId },
    data: payload,
    include: {
      rent: true,
      driver: true,
    },
  });

  // If bid is accepted, update rent status to ongoing
  if (result?.bidStatus === 'accepted') {
    await prisma.rent.update({
      where: { id: result.rentId },
      data: { rentStatus: 'ongoing' },
    });
  }

  return result;
};

const deleteBidById = async (bidId: string) => {
  const result = await prisma.bid.delete({
    where: { id: bidId },
  });
  return result;
};

export const BidService = {
  createBid,
  findBidById,
  getAllBids,
  updateBidById,
  deleteBidById,
};
