import { Router } from "express";
import {
  createPerson,
  getPerson,
  updatePerson,
  deletePerson,
  listPersons
} from "../controllers/person.controller.js";
import { validateBody, personSchema, personUpdateSchema } from "../validators.js";
import { cacheMiddleware } from "../middleware.js";

const router = Router();

// Create
router.post("/", validateBody(personSchema), createPerson);

// Read
router.get("/", cacheMiddleware(parseInt(process.env.CACHE_SECONDS || "30")), listPersons);
router.get("/:id", cacheMiddleware(parseInt(process.env.CACHE_SECONDS || "30")), getPerson);

// Update
router.put("/:id", validateBody(personUpdateSchema), updatePerson);

// Delete
router.delete("/:id", deletePerson);

export default router;
