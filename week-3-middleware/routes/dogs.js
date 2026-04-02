import express from "express";
import dogData from "../dogData.js";

const router = express.Router();

router.get("/dogs", (req, res) => {
  res.json(dogData);
});

router.post("/adopt", (req, res, next) => {
  const { name, address, email, dogName } = req.body;


  // Throw a ValidationError



  const dog = dogData.find((d) => d.name === dogName && d.status === "available");
// Throw a NotFoundError



  
  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${email} for further details.`,
    application: {
      name,
      address,
      email,
      dogName,
      applicationId: Date.now(),
    },
  });
});

router.get("/error", (req, res, next) => {
  next(new Error("Test error"));
});

export default router;
