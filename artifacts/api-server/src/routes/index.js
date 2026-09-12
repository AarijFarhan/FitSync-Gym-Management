import { Router } from "express";
import healthRouter from "./health.js";
import fitsyncRouter from "./fitsync.js";

const router = Router();

router.use(healthRouter);
router.use(fitsyncRouter);

export default router;
