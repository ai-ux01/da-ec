import type { Response } from "express";
import type { CustomerAuthRequest } from "../../lib/middleware.js";
import { addressService } from "./address.service.js";

export const addressController = {
  async create(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const body = req.body as {
      name?: string;
      phone?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      is_default?: boolean;
    };
    if (
      !body.name?.trim() ||
      !body.phone?.trim() ||
      !body.address_line1?.trim() ||
      !body.city?.trim() ||
      !body.state?.trim() ||
      !body.pincode?.trim()
    ) {
      res.status(400).json({
        error: "Missing required: name, phone, address_line1, city, state, pincode",
      });
      return;
    }
    const address = await addressService.create({
      customerId,
      name: body.name.trim(),
      phone: body.phone.trim(),
      addressLine1: body.address_line1.trim(),
      addressLine2: body.address_line2?.trim() || null,
      city: body.city.trim(),
      state: body.state.trim(),
      pincode: body.pincode.trim(),
      isDefault: body.is_default ?? false,
    });
    res.status(201).json(address);
  },

  async list(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const list = await addressService.listByCustomer(customerId);
    res.json(list);
  },

  async update(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const id = req.params.id as string;
    const existing = await addressService.getById(id, customerId);
    if (!existing) {
      res.status(404).json({ error: "Address not found" });
      return;
    }
    const body = req.body as {
      name?: string;
      phone?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      is_default?: boolean;
    };
    const data = {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.phone !== undefined && { phone: body.phone.trim() }),
      ...(body.address_line1 !== undefined && { addressLine1: body.address_line1.trim() }),
      ...(body.address_line2 !== undefined && { addressLine2: body.address_line2?.trim() ?? null }),
      ...(body.city !== undefined && { city: body.city.trim() }),
      ...(body.state !== undefined && { state: body.state.trim() }),
      ...(body.pincode !== undefined && { pincode: body.pincode.trim() }),
      ...(body.is_default !== undefined && { isDefault: body.is_default }),
    };
    const address = await addressService.update(id, customerId, data);
    res.json(address);
  },

  async delete(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const id = req.params.id as string;
    const existing = await addressService.getById(id, customerId);
    if (!existing) {
      res.status(404).json({ error: "Address not found" });
      return;
    }
    await addressService.delete(id, customerId);
    res.status(204).send();
  },
};
