import { Request, Response } from "express";
import Course from "../models/Courses";

export const getCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.status(200).json({
      message: "Courses fetched successfully",
      courses,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json({
      message: "Course fetched successfully",
      course,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
