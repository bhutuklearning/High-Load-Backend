import { Router } from "express";
import { usersController, } from "./users.controller.js";
import { asyncHandler, } from "../../middleware/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(
  usersController.createUser.bind(
    usersController
  )
)
);

router.get("/:id", asyncHandler(
  usersController.getUserById.bind(
    usersController
  )
)
);

router.get("/", asyncHandler(
  usersController.getAllUsers.bind(
    usersController
  )
)
);

export default router;


/*
WHY .bind(usersController) ?

VERY IMPORTANT JavaScript concept.

Without bind:
this context breaks inside class methods.

This is REAL Node.js engineering detail.
*/