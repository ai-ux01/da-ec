import { prisma } from "../../lib/prisma.js";

export type CreateAddressInput = {
  customerId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
};

export const addressService = {
  async create(data: CreateAddressInput) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: data.customerId },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault ?? false,
      },
    });
  },

  async update(id: string, customerId: string, data: UpdateAddressInput) {
    if (data.isDefault === true) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    return prisma.address.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  },

  async delete(id: string, customerId: string) {
    return prisma.address.deleteMany({
      where: { id, customerId },
    });
  },

  async listByCustomer(customerId: string) {
    return prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  },

  async getById(id: string, customerId: string) {
    return prisma.address.findFirst({
      where: { id, customerId },
    });
  },

  async getDefaultAddress(customerId: string) {
    return prisma.address.findFirst({
      where: { customerId, isDefault: true },
    });
  },
};
