import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fitsyncRouter from "./fitsync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fitsyncRouter);

export default router;
